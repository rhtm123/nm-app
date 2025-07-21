import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import BottomTabs from './BottomTabs';
import ProfileScreen from '../screens/ProfileScreen';

const Drawer = createDrawerNavigator();

const AppDrawer = () => (
  <Drawer.Navigator>
    <Drawer.Screen name="Home" component={BottomTabs} />
    <Drawer.Screen name="Profile" component={ProfileScreen} />
  </Drawer.Navigator>
);

export default AppDrawer;
