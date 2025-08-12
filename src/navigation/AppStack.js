import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CategoryProductsScreen from '../screens/CategoryProductsScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import SearchScreen from '../screens/SearchScreen';
import Header from '../components/Header';
import AddressesScreen from '../screens/AddressesScreen';
import WishlistScreen from '../screens/WishlistScreen';
import SupportScreen from '../screens/SupportScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';

const Stack = createNativeStackNavigator();

const AppStack = () => (
  <Stack.Navigator
    screenOptions={{
      header: (props) => <Header {...props} />,
    }}
  >
    <Stack.Screen name="MainTabs" component={BottomTabs} options={{ headerShown: false }} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="CategoryProducts" component={CategoryProductsScreen} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
    <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search Products' }} />
    <Stack.Screen name="Addresses" component={AddressesScreen} />
    <Stack.Screen name="Wishlist" component={WishlistScreen} />
    <Stack.Screen name="Support" component={SupportScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Orders" component={OrdersScreen} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
  </Stack.Navigator>
);

export default AppStack; 