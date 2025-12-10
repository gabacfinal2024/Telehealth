# Auth Service

Utility functions for authentication and user profile management.

## Usage Examples

### Get User Profile

```javascript
import { getUserProfile, getFormattedUserData, refreshUserProfile } from '../services/authService';

// Option 1: Get raw profile data from API
const profile = await getUserProfile();
console.log('Profile:', profile);
// Returns: { first_name, last_name, email, user_type, ... }

// Option 2: Get formatted user data
const userData = await getFormattedUserData();
console.log('User Data:', userData);
// Returns: { firstName, lastName, email, userType, ... }

// Option 3: Get profile and save to AsyncStorage
const userData = await refreshUserProfile();
console.log('User Data:', userData);
```

### Get Auth Token

```javascript
import { getAuthToken } from '../services/authService';

const token = await getAuthToken();
if (token) {
  console.log('Token:', token);
} else {
  console.log('No token found');
}
```

### Example: Fetch Profile in a Component

```javascript
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getUserProfile } from '../services/authService';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await getUserProfile();
      setProfile(data);
      setLoading(false);
    };
    
    fetchProfile();
  }, []);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!profile) {
    return <Text>Failed to load profile</Text>;
  }

  return (
    <View>
      <Text>Name: {profile.first_name} {profile.last_name}</Text>
      <Text>Email: {profile.email}</Text>
      <Text>User Type: {profile.user_type}</Text>
    </View>
  );
}
```

