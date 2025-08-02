import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CartScreen from '../screens/CartScreen';
import ProfileStack from '../navigation/ProfileStack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { View, Text } from 'react-native';
import { useCart } from '../context/CartContext';

const Tab = createBottomTabNavigator();

const CartTabIcon = ({ color, size }) => {
  const { getCartItemsCount } = useCart();
  const cartCount = getCartItemsCount();

  return (
    <View>
      <Ionicons name={cartCount > 0 ? 'cart' : 'cart-outline'} size={size} color={color} />
      {cartCount > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -4,
            right: -10,
            backgroundColor: '#ef4444',
            borderRadius: 8,
            minWidth: 16,
            height: 16,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 3,
          }}
        >
          <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
            {cartCount > 99 ? '99+' : cartCount}
          </Text>
        </View>
      )}
    </View>
  );
};

const BottomTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        if (route.name === 'Home') {
          return <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
        } else if (route.name === 'Categories') {
          return <Ionicons name={focused ? 'list' : 'list-outline'} size={size} color={color} />;
        } else if (route.name === 'Cart') {
          return <CartTabIcon color={color} size={size} />;
        } else if (route.name === 'Profile') {
          return <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />;
        }
      },
      tabBarActiveTintColor: '#1E90FF',
      tabBarInactiveTintColor: 'gray',
      tabBarLabelStyle: { fontSize: 12 },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Categories" component={CategoriesScreen} />
    <Tab.Screen name="Cart" component={CartScreen} />
    {/* <Tab.Screen name="Profile" component={ProfileStack} /> */}
  </Tab.Navigator>
);

export default BottomTabs;