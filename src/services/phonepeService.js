import { Linking, Alert, AppState } from 'react-native';
import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/endpoints';
import paymentService from './paymentService';

export const phonepeService = {
  // Generate merchant transaction ID
  generateMerchantTransactionId: () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `TXN_${timestamp}_${random}`.toUpperCase();
  },

  // Check if in-app browser is available (always false now)
  isInAppBrowserAvailable: async () => {
    return false; // In-app browser not available
  },

  // Open PhonePe payment in external browser
  openPhonePeUrl: async (paymentUrl, orderId) => {
    try {
      console.log('Opening PhonePe URL in external browser:', paymentUrl);
      
      // Always use external browser
      const supported = await Linking.canOpenURL(paymentUrl);
      
      if (supported) {
        await Linking.openURL(paymentUrl);
        return { success: true, message: 'Payment opened in external browser' };
      } else {
        return { success: false, error: 'Cannot open payment URL' };
      }
    } catch (error) {
      console.error('Error opening PhonePe URL:', error);
      return { success: false, error: error.message };
    }
  },

  // Handle payment success
  handlePaymentSuccess: async (orderId) => {
    try {
      console.log('Handling payment success for order:', orderId);
      
      // Wait a bit for the payment to be processed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Use payment service to verify payment
      const verificationResult = await paymentService.pollPaymentStatus(orderId, 5, 3000);
      
      if (verificationResult.success) {
        // Update order payment method to reflect online payment
        try {
          await apiClient.put(`${API_ENDPOINTS.ORDER_BY_ID(orderId)}`, {
            payment_method: 'pg'
          });
          console.log('Order payment method updated to online payment');
        } catch (updateError) {
          console.error('Error updating order payment method:', updateError);
        }
        
        return { success: true, message: 'Payment verified successfully', data: verificationResult.data };
      } else {
        return { success: false, error: verificationResult.error };
      }
    } catch (error) {
      console.error('Error handling payment success:', error);
      return { success: false, error: error.message };
    }
  },

  // Verify payment with backend (legacy method - use paymentService instead)
  verifyPayment: async (orderId) => {
    try {
      console.log('Verifying payment for order:', orderId);
      
      // Use the payment service for verification
      const result = await paymentService.checkPaymentStatus(orderId);
      
      return result;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return { success: false, error: error.message };
    }
  },

  // Check if PhonePe app is installed
  isPhonePeInstalled: async () => {
    try {
      const canOpen = await Linking.canOpenURL('phonepe://');
      return canOpen;
    } catch (error) {
      return false;
    }
  },

  // Handle payment completion callback
  handlePaymentCompletion: async (transactionId, orderId) => {
    try {
      console.log('Handling payment completion for transaction:', transactionId);
      
      // Use payment service to verify payment
      const result = await paymentService.verifyPayment(transactionId);
      
      return result;
    } catch (error) {
      console.error('Error handling payment completion:', error);
      return { success: false, error: error.message };
    }
  },

  // Close in-app browser (no-op now)
  closeInAppBrowser: async () => {
    // No-op since we're not using in-app browser
  },

  // Warm up in-app browser (no-op now)
  warmup: async () => {
    // No-op since we're not using in-app browser
  },

  // Cool down in-app browser (no-op now)
  cooldown: async () => {
    // No-op since we're not using in-app browser
  }
};

export default phonepeService; 