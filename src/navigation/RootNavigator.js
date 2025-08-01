import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import AuthStack from './AuthStack';
import AppDrawer from './AppDrawer';
import useAuthStore from '../stores/authStore';
import { colors } from '../theme';

const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return isAuthenticated ? <AppDrawer /> : <AuthStack onLogin={() => {}} />;
};

export default RootNavigator;
