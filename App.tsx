/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */



import React from 'react';
import { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { LightTheme, DarkTheme } from './src/theme';
import { StatusBar, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import useAuthStore from './src/stores/authStore';

import "./global.css"; // Ensure this is imported to apply global styles


export default function App() {
    const [darkMode, setDarkMode] = useState(false); // toggle this with a button or switch
    const checkAuthStatus = useAuthStore(state => state.checkAuthStatus);

    useEffect(() => {
        // Initialize auth status when app starts
        checkAuthStatus();
        
        // Ensure status bar is properly configured on both platforms
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor('#ffffff', true);
          StatusBar.setBarStyle('dark-content', true);
        } else {
          StatusBar.setBarStyle('dark-content', true);
        }
    }, [checkAuthStatus]);

  return (
    <>
      {/* Status bar with white background and dark content */}
      <StatusBar 
        backgroundColor="#ffffff" 
        barStyle="dark-content" 
        translucent={false}
      />
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <NavigationContainer theme={darkMode ? DarkTheme : LightTheme}>
          <RootNavigator />
        </NavigationContainer>
      </GestureHandlerRootView>
    </>
  );
}
