import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../http.ts';

/**
 * Get the stored auth token from AsyncStorage
 * @returns {Promise<string|null>} The auth token or null if not found
 */
export const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Fetch user profile using the stored auth token
 * @returns {Promise<Object|null>} User profile data or null if error
 */
export const getUserProfile = async () => {
  try {
    console.log('=== FETCHING USER PROFILE ===');
    
    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem('auth_token');
    
    if (!token) {
      console.log('No auth token found in AsyncStorage');
      return null;
    }

    console.log('Token found:', token.substring(0, 10) + '...');
    console.log('Making API call to: auth/user/me/');

    // Fetch profile using the token
    const response = await api.get('auth/user/me/', {
      headers: { 
        Authorization: 'Token ' + token,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });

    console.log('=== PROFILE API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Response headers:', JSON.stringify(response.headers, null, 2));
    console.log('Response content-type:', response.headers?.['content-type']);
    
    // Check if response is HTML instead of JSON
    const contentType = response.headers?.['content-type'] || '';
    const responseData = response.data;
    
    if (typeof responseData === 'string' && responseData.trim().startsWith('<!')) {
      console.error('⚠️ WARNING: API returned HTML instead of JSON!');
      console.error('Response appears to be HTML. First 500 chars:', responseData.substring(0, 500));
      
      // Try alternative endpoints
      console.log('Trying alternative endpoint: auth/users/me/');
      try {
        const altResponse = await api.get('auth/users/me/', {
          headers: { 
            Authorization: 'Token ' + token,
            'Accept': 'application/json',
          },
        });
        console.log('Alternative endpoint response:', JSON.stringify(altResponse.data, null, 2));
        return altResponse.data;
      } catch (altError) {
        console.error('Alternative endpoint also failed:', altError.message);
      }
      
      return null;
    }

    console.log('=== RAW PROFILE DATA ===');
    console.log('Profile data:', JSON.stringify(responseData, null, 2));
    
    // Log important fields specifically
    console.log('\n=== EXTRACTED PROFILE INFORMATION ===');
    console.log('First Name:', responseData?.first_name || 'NOT FOUND');
    console.log('Middle Name:', responseData?.middle_name || 'NOT FOUND');
    console.log('Last Name:', responseData?.last_name || 'NOT FOUND');
    console.log('Full Name:', `${responseData?.first_name || ''} ${responseData?.middle_name || ''} ${responseData?.last_name || ''}`.trim() || 'NOT FOUND');
    console.log('Email:', responseData?.email || 'NOT FOUND');
    console.log('User Type:', responseData?.user_type || 'NOT FOUND');
    console.log('ID Number:', responseData?.id_number || responseData?.idNumber || 'NOT FOUND');
    console.log('All available keys:', Object.keys(responseData || {}));

    // Return the raw profile data
    return responseData;
  } catch (error) {
    console.error('=== ERROR FETCHING PROFILE ===');
    console.error('Error message:', error.message);
    console.error('Error response status:', error.response?.status);
    console.error('Error response headers:', JSON.stringify(error.response?.headers, null, 2));
    
    if (error.response?.data) {
      const errorData = error.response.data;
      if (typeof errorData === 'string' && errorData.includes('<!DOCTYPE')) {
        console.error('⚠️ ERROR: API returned HTML error page instead of JSON!');
        console.error('HTML Error (first 500 chars):', errorData.substring(0, 500));
      } else {
        console.error('Error response data:', JSON.stringify(errorData, null, 2));
      }
    }
    
    return null;
  }
};

/**
 * Get formatted user data (processed profile)
 * @returns {Promise<Object|null>} Formatted user data or null if error
 */
export const getFormattedUserData = async () => {
  try {
    const profileData = await getUserProfile();
    
    if (!profileData) {
      return null;
    }

    const userData = {
      firstName: profileData?.first_name || '',
      middleName: profileData?.middle_name || '',
      lastName: profileData?.last_name || '',
      email: profileData?.email || '',
      userType: profileData?.user_type || 'Patient',
      // Include any other fields from the API response
      ...profileData,
    };

    console.log('=== FORMATTED USER DATA ===');
    console.log('User Data:', JSON.stringify(userData, null, 2));

    return userData;
  } catch (error) {
    console.error('Error formatting user data:', error);
    return null;
  }
};

/**
 * Get user profile and save it to AsyncStorage
 * @returns {Promise<Object|null>} User data or null if error
 */
export const refreshUserProfile = async () => {
  try {
    const userData = await getFormattedUserData();
    
    if (userData) {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      console.log('User profile refreshed and saved to AsyncStorage');
    }
    
    return userData;
  } catch (error) {
    console.error('Error refreshing user profile:', error);
    return null;
  }
};

