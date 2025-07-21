import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';

const Stack = createNativeStackNavigator();

const AuthStack = ({ onLogin }) => (
  <Stack.Navigator>
    <Stack.Screen name="Login">
      {props => <LoginScreen {...props} onLogin={onLogin} />}
    </Stack.Screen>
  </Stack.Navigator>
);

export default AuthStack;
