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
import { googleAuthService } from './src/services/googleAuthService';
import deepLinkManager from './src/utils/DeepLinkManager';

import "./global.css"; // Ensure this is imported to apply global styles


export default function App() {
    const [darkMode, setDarkMode] = useState(false); // toggle this with a button or switch
    const initializeAuth = useAuthStore(state => state.initializeAuth);

    useEffect(() => {
        // Initialize Google Sign-In configuration
        googleAuthService.configure();
        
        // Initialize auth status when app starts
        initializeAuth();
        
        // Initialize deep link manager for payment callbacks
        deepLinkManager.initialize();
        
        // Ensure status bar is properly configured on both platforms
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor('#ffffff', true);
          StatusBar.setBarStyle('dark-content', true);
        } else {
          StatusBar.setBarStyle('dark-content', true);
        }
        
        // Cleanup function
        return () => {
          deepLinkManager.cleanup();
        };
    }, [initializeAuth]);

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
