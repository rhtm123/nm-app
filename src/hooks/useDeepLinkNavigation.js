import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { paymentCallbackService } from '../services/paymentCallbackService';

export const useDeepLinkNavigation = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Setup deep link listener with navigation
    const cleanup = paymentCallbackService.setupDeepLinkListener(navigation);
    
    return cleanup;
  }, [navigation]);

  return navigation;
}; 