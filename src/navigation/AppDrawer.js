import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AppStack from './AppStack';
import ProfileScreen from '../screens/ProfileScreen'; 
import OrdersScreen from '../screens/OrdersScreen';
import Header from '../components/Header';

const Drawer = createDrawerNavigator();

const AppDrawer = () => (
  <Drawer.Navigator
    screenOptions={{
      header: (props) => <Header {...props} />,
    }}
  >
    <Drawer.Screen name="Home" component={AppStack} options={{ headerShown: false }} />
    <Drawer.Screen name="Profile" component={ProfileScreen} />
  </Drawer.Navigator>
);

export default AppDrawer;
