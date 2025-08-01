import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// const GOOGLE_WEB_CLIENT_ID = process.env.PUBLIC_GOOGLE_WEB_CLIENT_ID; // TODO: Replace with your actual web client ID

const LoginScreen = ({ onLogin }) => {
  const { loginWithPassword, register, loginWithGoogle, isLoading } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  // useEffect(() => {
  //   GoogleSignin.configure({
  //     webClientId: GOOGLE_WEB_CLIENT_ID,
  //     offlineAccess: false,
  //   });
  // }, []);

  const handleLogin = async () => {
    setError('');
    const result = await loginWithPassword(username, password);
    if (result.success) {
      onLogin && onLogin();
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleRegister = async () => {
    setError('');
    const result = await register({ username, password, email });
    if (result.success) {
      onLogin && onLogin();
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  // const handleGoogleLogin = async () => {
  //   setError('');
  //   try {
  //     await GoogleSignin.hasPlayServices();
  //     const userInfo = await GoogleSignin.signIn();
  //     const token = (await GoogleSignin.getTokens()).idToken;
  //     if (!token) throw new Error('No Google token received');
  //     const result = await loginWithGoogle(token);
  //     if (result.success) {
  //       onLogin && onLogin();
  //     } else {
  //       setError(result.error || 'Google login failed');
  //     }
  //   } catch (err) {
  //     if (err.code === statusCodes.SIGN_IN_CANCELLED) {
  //       setError('Google sign in cancelled');
  //     } else if (err.code === statusCodes.IN_PROGRESS) {
  //       setError('Google sign in in progress');
  //     } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
  //       setError('Google Play Services not available');
  //     } else {
  //       setError(err.message || 'Google login failed');
  //     }
  //   }
  // };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>

      <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-4xl font-bold mb-4 ">
        Welcome to Nativewind!
      </Text>
    </View>

      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 24 }}>
        {isRegister ? 'Register' : 'Login'}
      </Text>
      {error ? <Text style={{ color: 'red', marginBottom: 12 }}>{error}</Text> : null}
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{ width: 250, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 }}
        autoCapitalize="none"
      />
      {isRegister && (
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={{ width: 250, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 }}
          autoCapitalize="none"
        />
      )}
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={{ width: 250, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 }}
        secureTextEntry
      />
      <TouchableOpacity
        style={{ backgroundColor: '#1E90FF', padding: 14, borderRadius: 8, width: 250, alignItems: 'center', marginBottom: 12 }}
        onPress={isRegister ? handleRegister : handleLogin}
        disabled={isLoading}
      >
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>{isRegister ? 'Register' : 'Login'}</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
        <Text style={{ color: '#1E90FF', marginBottom: 16 }}>{isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}</Text>
      </TouchableOpacity>
      {/*
      <TouchableOpacity
        style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#1E90FF', padding: 14, borderRadius: 8, width: 250, alignItems: 'center' }}
        onPress={handleGoogleLogin}
        disabled={isLoading}
      >
        <Text style={{ color: '#1E90FF', fontWeight: 'bold' }}>Continue with Google</Text>
      </TouchableOpacity>
      */}
      {/* TODO: Re-enable Google login after native setup is complete */}
    </View>
  );
};

export default LoginScreen;
