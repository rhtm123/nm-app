import React, { useState } from 'react';
import AuthStack from './AuthStack';
import AppDrawer from './AppDrawer';

const RootNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Temporary login state

  return isLoggedIn ? <AppDrawer /> : <AuthStack onLogin={() => setIsLoggedIn(true)} />;
};

export default RootNavigator;
