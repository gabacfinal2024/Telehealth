import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../http.ts';
import { getUserProfile, getFormattedUserData } from '../services/authService';

export default function SignInScreen({ navigation }) {
  const [userType, setUserType] = useState('Patient');
  const [credentials, setCredentials] = useState({ id_number: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    console.log('=== SIGN IN BUTTON PRESSED ===');
    console.log('User Type:', userType);
    console.log('Credentials:', { 
      id_number: credentials.id_number, 
      password: credentials.password ? '***' : '' 
    });

    if (!credentials.id_number || !credentials.password) {
      console.log('Validation failed: Missing credentials');
      Alert.alert('Error', 'Please enter ID number and password');
      return;
    }

    setLoading(true);
    console.log('Starting login process...');
    
    try {
      // Login
      console.log('Making API call to: auth/token/login/');
      console.log('Request payload:', { id_number: credentials.id_number, password: '***' });
      
      const response = await api.post('auth/token/login/', credentials);
      
      console.log('=== LOGIN API RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      
      const token = response.data?.auth_token;
      console.log('Auth token received:', token ? 'Yes (token exists)' : 'No');
      
      if (!token) {
        console.error('No auth token in response');
        throw new Error('Invalid credentials');
      }

      await AsyncStorage.setItem('auth_token', token);
      console.log('Auth token saved to AsyncStorage');

      // Try direct API call first to see raw response
      console.log('\n=== DIRECT API CALL TO FETCH PROFILE ===');
      try {
        const directResponse = await api.get('auth/user/me/', {
          headers: { 
            Authorization: 'Token ' + token,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        });
        console.log('Direct API Response Status:', directResponse.status);
        console.log('Direct API Response Type:', typeof directResponse.data);
        console.log('Direct API Response (first 200 chars):', 
          typeof directResponse.data === 'string' 
            ? directResponse.data.substring(0, 200) 
            : JSON.stringify(directResponse.data, null, 2).substring(0, 200));
      } catch (directError) {
        console.error('Direct API call error:', directError.message);
        console.error('Direct API error response:', directError.response?.data);
      }

      // Fetch profile using utility function
      console.log('\n=== FETCHING USER PROFILE WITH TOKEN ===');
      const profileData = await getUserProfile();
      
      if (!profileData) {
        console.error('❌ Failed to fetch profile data - API may have returned HTML instead of JSON');
        console.error('This usually means the endpoint URL is incorrect or the API requires different authentication');
        throw new Error('Failed to fetch user profile');
      }

      // Check if we got valid JSON data
      if (typeof profileData === 'string' && profileData.trim().startsWith('<!')) {
        console.error('❌ ERROR: Profile API returned HTML instead of JSON!');
        console.error('Response type:', typeof profileData);
        console.error('First 200 chars:', profileData.substring(0, 200));
        throw new Error('Profile API returned HTML instead of JSON. Please check the API endpoint.');
      }

      console.log('\n✅ SUCCESS: Got valid profile data from API');
      console.log('\n=== FULL PROFILE DATA FROM API ===');
      console.log('Complete Profile Object:', JSON.stringify(profileData, null, 2));
      console.log('Profile Keys:', Object.keys(profileData));
      
      // Log individual profile fields with emphasis
      console.log('\n=== 🎯 REAL PROFILE INFORMATION ===');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('👤 First Name:', profileData?.first_name || '❌ NOT FOUND');
      console.log('👤 Middle Name:', profileData?.middle_name || '❌ NOT FOUND');
      console.log('👤 Last Name:', profileData?.last_name || '❌ NOT FOUND');
      console.log('📧 Email:', profileData?.email || '❌ NOT FOUND');
      console.log('🆔 User Type:', profileData?.user_type || '❌ NOT FOUND');
      console.log('🔢 ID Number:', profileData?.id_number || profileData?.idNumber || '❌ NOT FOUND');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Validate that we have essential data
      if (!profileData?.email && !profileData?.first_name) {
        console.warn('⚠️ WARNING: Profile data appears incomplete or invalid');
      }
      
      // Get formatted user data
      const userData = await getFormattedUserData();
      
      if (!userData) {
        console.error('Failed to format user data');
        throw new Error('Failed to format user data');
      }

      console.log('\n=== FORMATTED USER DATA ===');
      console.log('Formatted User Data:', JSON.stringify(userData, null, 2));

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      console.log('User data saved to AsyncStorage');

      // Enforce portal
      if (userData.userType !== userType) {
        console.log('User type mismatch:', {
          expected: userType,
          actual: userData.userType
        });
        await AsyncStorage.removeItem('auth_token');
        Alert.alert(
          'Wrong account type',
          `This account is registered as ${userData.userType}. Please switch to the ${userData.userType} tab to sign in.`
        );
        setLoading(false);
        return;
      }

      console.log('Login successful! Navigating to dashboard...');
      if (userData.userType === 'Doctor') {
        navigation.replace('DoctorDashboard', {
          userName: `${userData.firstName} ${userData.lastName}`.trim() || 'Doctor',
          userEmail: userData.email,
          userType: userData.userType,
        });
      } else {
        navigation.replace('Dashboard', {
          userName: `${userData.firstName} ${userData.lastName}`.trim() || 'Patient',
          userEmail: userData.email,
          userType: userData.userType,
        });
      }
    } catch (error) {
      console.error('=== LOGIN ERROR ===');
      console.error('Error message:', error.message);
      console.error('Error response status:', error.response?.status);
      console.error('Error response data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Error response headers:', error.response?.headers);
      console.error('Full error object:', error);
      
      Alert.alert('Error', 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
      console.log('Login process completed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Heart Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="heart" size={32} color="#E91E63" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>TELEHEALTH</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        {/* User Type Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              userType === 'Patient' && styles.toggleButtonActive,
            ]}
            onPress={() => setUserType('Patient')}
          >
            <Text
              style={[
                styles.toggleText,
                userType === 'Patient' && styles.toggleTextActive,
              ]}
            >
              Patient
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              userType === 'Doctor' && styles.toggleButtonActive,
            ]}
            onPress={() => setUserType('Doctor')}
          >
            <Text
              style={[
                styles.toggleText,
                userType === 'Doctor' && styles.toggleTextActive,
              ]}
            >
              Doctor
            </Text>
          </TouchableOpacity>
        </View>

        {/* ID Number Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>ID Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your ID number"
            placeholderTextColor="#999"
            value={credentials.id_number}
            onChangeText={(text) => setCredentials({ ...credentials, id_number: text })}
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#999"
            value={credentials.password}
            onChangeText={(text) => setCredentials({ ...credentials, password: text })}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Sign In Button */}
        <TouchableOpacity 
          style={[styles.signInButton, loading && styles.signInButtonDisabled]} 
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.signInButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Register Link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  toggleText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  googleButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 24,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  googleG: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  googleButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  separatorText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#999',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000',
  },
  signInButton: {
    width: '100%',
    backgroundColor: '#E91E63',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  signInButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#666',
  },
  registerLink: {
    fontSize: 14,
    color: '#E91E63',
    fontWeight: '600',
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
});

