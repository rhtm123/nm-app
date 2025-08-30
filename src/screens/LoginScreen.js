import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import useAuthStore from '../stores/authStore';
import { googleAuthService } from '../services/googleAuthService';

const LoginScreen = ({ onLogin }) => {
  const { loginWithPassword, register, loginWithGoogle, isLoading } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const googleResult = await googleAuthService.signIn();
      
      if (!googleResult.success) {
        setError(googleResult.error || 'Google sign-in failed');
        return;
      }

      // Use the ID token to authenticate with your backend
      const result = await loginWithGoogle(googleResult.idToken);
      
      if (result.success) {
        onLogin && onLogin();
      } else {
        setError(result.error || 'Google login failed');
      }
    } catch (error) {
      setError(error.message || 'Google login failed');
    }
  };

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


  return (
    <View className="flex-1 justify-center items-center px-6 bg-gray-50">
      {/* Logo/Brand Section */}
      <View className="items-center mb-8">
        <View className="bg-blue-600 w-16 h-16 rounded-2xl items-center justify-center mb-4">
          <Text className="text-white text-2xl font-bold">NM</Text>
        </View>
        <Text className="text-gray-800 text-2xl font-bold mb-2">Welcome Back</Text>
        <Text className="text-gray-600 text-center">
          {isRegister ? 'Create your account to get started' : 'Sign in to your account'}
        </Text>
      </View>

      {/* Form Container */}
      <View className="w-full max-w-sm">
        {error ? (
          <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <Text className="text-red-600 text-sm text-center">{error}</Text>
          </View>
        ) : null}

        {/* Username Input */}
        <View className="mb-4">
          <Text className="text-gray-700 text-sm font-medium mb-2">Username</Text>
          <TextInput
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-white"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Email Input (Register only) */}
        {isRegister && (
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">Email</Text>
            <TextInput
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-white"
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>
        )}

        {/* Password Input */}
        <View className="mb-6">
          <Text className="text-gray-700 text-sm font-medium mb-2">Password</Text>
          <TextInput
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-white"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className={`w-full rounded-xl py-4 items-center mb-4 ${isLoading ? 'bg-gray-400' : 'bg-blue-600'}`}
          onPress={isRegister ? handleRegister : handleLogin}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-semibold text-lg">
              {isRegister ? 'Create Account' : 'Sign In'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Toggle Register/Login */}
        <TouchableOpacity 
          onPress={() => setIsRegister(!isRegister)}
          className="items-center py-2"
          activeOpacity={0.7}
        >
          <Text className="text-blue-600 font-medium">
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View className="flex-row items-center my-6">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="mx-4 text-gray-500 text-sm">or</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        {/* Google Sign In Button */}
        <TouchableOpacity
          className="w-full border border-gray-300 rounded-xl py-4 items-center bg-white mb-4"
          onPress={handleGoogleLogin}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#4285F4" size="small" />
          ) : (
            <View className="flex-row items-center">
              <View className="w-5 h-5 mr-3 items-center justify-center">
                <Text className="text-base font-bold" style={{color: '#4285F4'}}>G</Text>
              </View>
              <Text className="text-gray-700 font-medium">Continue with Google</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <View className="items-center mt-4">
          <Text className="text-gray-500 text-sm text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;
