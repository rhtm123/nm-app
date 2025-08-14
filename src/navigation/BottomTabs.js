import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CartScreen from '../screens/CartScreen';
import ProfileStack from '../navigation/ProfileStack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useCart } from '../context/CartContext';
import { colors } from '../theme';

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
            backgroundColor: colors.error,
            borderRadius: 8,
            minWidth: 16,
            height: 16,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 3,
          }}
        >
          <Text style={{ color: colors.text.white, fontSize: 10, fontWeight: 'bold' }}>
            {cartCount > 99 ? '99+' : cartCount}
          </Text>
        </View>
      )}
    </View>
  );
};

const BottomTabs = () => {
  const insets = useSafeAreaInsets();
  const hasGestureNavigation = insets.bottom > 0;
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') {
            return <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
          } else if (route.name === 'Categories') {
            return <Ionicons name={focused ? 'grid' : 'grid-outline'} size={size} color={color} />;
          } else if (route.name === 'Cart') {
            return <CartTabIcon color={color} size={size} />;
          } else if (route.name === 'Profile') {
            return <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.gray[500],
        tabBarLabelStyle: { 
          fontSize: 11, 
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border.light,
          paddingBottom: hasGestureNavigation ? Math.max(insets.bottom - 10, 8) : 8,
          paddingTop: 8,
          height: hasGestureNavigation ? 70 + Math.max(insets.bottom - 10, 0) : 70,
          elevation: 8,
          shadowColor: colors.gray[900],
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default BottomTabs;