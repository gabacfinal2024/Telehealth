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

export default function SignInScreen({ navigation }) {
  const [userType, setUserType] = useState('Patient');
  const [credentials, setCredentials] = useState({ id_number: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!credentials.id_number || !credentials.password) {
      Alert.alert('Error', 'Please enter ID number and password');
      return;
    }

    setLoading(true);
    try {
      // Login
      const response = await api.post('auth/token/login/', credentials);
      const token = response.data?.auth_token;
      if (!token) throw new Error('Invalid credentials');

      await AsyncStorage.setItem('auth_token', token);

      // Fetch profile
      const profileResp = await api.get('auth/user/me/', {
        headers: { Authorization: 'Token ' + token },
      });

      const userData = {
        firstName: profileResp.data?.first_name || '',
        middleName: profileResp.data?.middle_name || '',
        lastName: profileResp.data?.last_name || '',
        email: profileResp.data?.email || '',
        userType: profileResp.data?.user_type || 'Patient',
      };

      await AsyncStorage.setItem('user', JSON.stringify(userData));

      // Enforce portal
      if (userData.userType !== userType) {
        await AsyncStorage.removeItem('auth_token');
        Alert.alert(
          'Wrong account type',
          `This account is registered as ${userData.userType}. Please switch to the ${userData.userType} tab to sign in.`
        );
        setLoading(false);
        return;
      }

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
      console.error('Login error:', error.response?.data || error.message);
      Alert.alert('Error', 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
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

