import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { paymentCallbackService } from '../services/paymentCallbackService';

const DeepLinkHandler = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Setup deep link listener with navigation
    const cleanup = paymentCallbackService.setupDeepLinkListener(navigation);
    
    return cleanup;
  }, [navigation]);

  return null; // This component doesn't render anything
};

export default DeepLinkHandler; 