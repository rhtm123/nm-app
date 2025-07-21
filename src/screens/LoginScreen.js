import React from 'react';
import { View, Text, Button } from 'react-native';

const LoginScreen = ({ onLogin }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Login Screen</Text>
    <Button title="Login" onPress={onLogin} />
  </View>
);

export default LoginScreen;
