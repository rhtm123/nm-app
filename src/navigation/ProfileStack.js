import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/ProfileScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import AddressesScreen from '../screens/AddressesScreen'; // <-- Import
import WishlistScreen from '../screens/WishlistScreen';   // <-- Import
import SupportScreen from '../screens/SupportScreen';     // <-- Import

const Stack = createNativeStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true
      }}
    >
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Orders" 
        component={OrdersScreen}
        options={{ title: 'My Orders' }}
      />
      <Stack.Screen 
        name="OrderDetail" 
        component={OrderDetailScreen} 
        options={{ title: 'Order Details' }}
      />
      <Stack.Screen 
        name="Addresses" 
        component={AddressesScreen}
        options={{ title: 'Saved Addresses' }}
      />
      <Stack.Screen 
        name="Wishlist" 
        component={WishlistScreen}
        options={{ title: 'Wishlist' }}
      />
      <Stack.Screen 
        name="Support" 
        component={SupportScreen}
        options={{ title: 'Help & Support' }}
      />
    </Stack.Navigator>
  );
};

export default ProfileStack;