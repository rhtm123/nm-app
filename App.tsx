/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { LightTheme, DarkTheme } from './src/theme';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CartProvider } from './src/context/CartContext';
import { AuthProvider } from './src/context/AuthContext';

export default function App() {
    const [darkMode, setDarkMode] = useState(false); // toggle this with a button or switch

  return (
    <>
    <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <CartProvider>
          <NavigationContainer theme={darkMode ? DarkTheme : LightTheme}>
            <RootNavigator />
          </NavigationContainer>
        </CartProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  </>
  );
}
