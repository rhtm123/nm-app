import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import deepLinkManager from './DeepLinkManager';

/**
 * Payment utility class for handling payments in React Native app
 */
class PaymentUtils {
  static API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://nm.thelearningsetu.in'; // Replace with your actual API base URL
  // For local development, you might use: 'http://10.0.2.2:8000' (Android emulator)
  // or 'http://localhost:8000' (iOS simulator)
  
  /**
   * Create a payment and get payment URL
   * @param {object} paymentData - Payment data
   * @returns {Promise<object>} Payment response
   */
  static async createPayment(paymentData) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Add platform information to payment data
      const paymentPayload = {
        ...paymentData,
        platform: 'mobile', // Indicate this is from mobile app
        device_info: {
          platform: Platform.OS,
          version: Platform.Version,
          app_version: '1.0.0' // You can get this from package.json
        }
      };

      const response = await fetch(`${this.API_BASE_URL}/api/payments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment creation failed');
      }

      const paymentResponse = await response.json();
      return paymentResponse;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  /**
   * Initiate payment process
   * @param {object} paymentData - Payment data including order_id, amount, etc.
   * @returns {Promise<boolean>} Success status
   */
  static async initiatePayment(paymentData) {
    try {
      // Show loading state
      Alert.alert('Processing', 'Creating payment...', [], { cancelable: false });

      // Create payment
      const payment = await this.createPayment(paymentData);
      
      if (!payment.payment_url) {
        throw new Error('Payment URL not received from server');
      }

      // Store payment details for tracking
      await this.storePaymentDetails(payment);

      // Setup deep link listener for payment result
      this.setupPaymentListener(payment);

      // Open payment URL in external app/browser
      const opened = await deepLinkManager.openExternalURL(payment.payment_url);
      
      if (!opened) {
        Alert.alert(
          'Error', 
          'Unable to open payment gateway. Please try again.',
          [{ text: 'OK' }]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error initiating payment:', error);
      Alert.alert(
        'Payment Error', 
        error.message || 'Unable to initiate payment. Please try again.',
        [{ text: 'OK' }]
      );
      return false;
    }
  }

  /**
   * Store payment details locally for tracking
   * @param {object} payment - Payment object
   */
  static async storePaymentDetails(payment) {
    try {
      const paymentData = {
        id: payment.id,
        transaction_id: payment.transaction_id,
        order_id: payment.order_id,
        amount: payment.amount,
        status: payment.status,
        created_at: new Date().toISOString()
      };

      await AsyncStorage.setItem(
        `payment_${payment.transaction_id}`, 
        JSON.stringify(paymentData)
      );
    } catch (error) {
      console.error('Error storing payment details:', error);
    }
  }

  /**
   * Setup payment result listener
   * @param {object} payment - Payment object
   */
  static setupPaymentListener(payment) {
    const handlePaymentResult = (type, data) => {
      if (type === 'payment') {
        this.handlePaymentCallback(data, payment);
      }
    };

    // Remove any existing listeners
    deepLinkManager.removeListener(handlePaymentResult);
    
    // Add new listener
    deepLinkManager.addListener(handlePaymentResult);
  }

  /**
   * Handle payment callback from deep link
   * @param {object} data - Payment callback data
   * @param {object} originalPayment - Original payment object
   */
  static async handlePaymentCallback(data, originalPayment) {
    try {
      const { status, transactionId, orderId } = data;
      
      // Verify payment status with server
      const verifiedPayment = await this.verifyPaymentStatus(transactionId);
      
      // Update local storage
      await this.updatePaymentStatus(transactionId, verifiedPayment.status);
      
      // Handle different payment statuses
      switch (verifiedPayment.status) {
        case 'completed':
          await this.handleSuccessfulPayment(verifiedPayment);
          break;
        case 'failed':
          await this.handleFailedPayment(verifiedPayment);
          break;
        case 'pending':
          await this.handlePendingPayment(verifiedPayment);
          break;
        default:
          console.log('Unknown payment status:', verifiedPayment.status);
      }
    } catch (error) {
      console.error('Error handling payment callback:', error);
      Alert.alert(
        'Error',
        'Unable to verify payment status. Please check your order history.',
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Verify payment status with server
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<object>} Payment verification response
   */
  static async verifyPaymentStatus(transactionId) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(
        `${this.API_BASE_URL}/api/verify-payment?transaction_id=${transactionId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const verificationResult = await response.json();
      return verificationResult;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  /**
   * Update payment status in local storage
   * @param {string} transactionId - Transaction ID
   * @param {string} status - New status
   */
  static async updatePaymentStatus(transactionId, status) {
    try {
      const paymentKey = `payment_${transactionId}`;
      const existingPayment = await AsyncStorage.getItem(paymentKey);
      
      if (existingPayment) {
        const paymentData = JSON.parse(existingPayment);
        paymentData.status = status;
        paymentData.updated_at = new Date().toISOString();
        
        await AsyncStorage.setItem(paymentKey, JSON.stringify(paymentData));
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  }

  /**
   * Handle successful payment
   * @param {object} payment - Payment object
   */
  static async handleSuccessfulPayment(payment) {
    console.log('Payment successful:', payment);
    
    // You can implement custom success handling here
    // For example:
    // - Navigate to order success page
    // - Show success notification
    // - Update app state
    // - Sync with server
    
    Alert.alert(
      'Payment Successful!',
      'Your payment has been completed successfully.',
      [
        {
          text: 'View Order',
          onPress: () => this.navigateToOrderDetails(payment.order_id)
        },
        { text: 'OK' }
      ]
    );
  }

  /**
   * Handle failed payment
   * @param {object} payment - Payment object
   */
  static async handleFailedPayment(payment) {
    console.log('Payment failed:', payment);
    
    Alert.alert(
      'Payment Failed',
      'Your payment could not be processed. Would you like to try again?',
      [
        {
          text: 'Retry Payment',
          onPress: () => this.retryPayment(payment)
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  }

  /**
   * Handle pending payment
   * @param {object} payment - Payment object
   */
  static async handlePendingPayment(payment) {
    console.log('Payment pending:', payment);
    
    Alert.alert(
      'Payment Processing',
      'Your payment is being processed. You will be notified once it is completed.',
      [{ text: 'OK' }]
    );
  }

  /**
   * Retry failed payment
   * @param {object} payment - Payment object
   */
  static async retryPayment(payment) {
    try {
      const paymentData = {
        order_id: payment.order_id,
        amount: payment.amount,
        estore_id: payment.estore_id || 1
      };

      await this.initiatePayment(paymentData);
    } catch (error) {
      console.error('Error retrying payment:', error);
    }
  }

  /**
   * Navigate to order details (implement based on your navigation setup)
   * @param {string} orderId - Order ID
   */
  static navigateToOrderDetails(orderId) {
    console.log('Navigate to order details:', orderId);
    // Implement navigation logic here
    // Example: navigation.navigate('OrderDetails', { orderId });
  }

  /**
   * Get stored payment details
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<object|null>} Payment details
   */
  static async getStoredPaymentDetails(transactionId) {
    try {
      const paymentData = await AsyncStorage.getItem(`payment_${transactionId}`);
      return paymentData ? JSON.parse(paymentData) : null;
    } catch (error) {
      console.error('Error getting stored payment details:', error);
      return null;
    }
  }

  /**
   * Clear stored payment details
   * @param {string} transactionId - Transaction ID
   */
  static async clearStoredPaymentDetails(transactionId) {
    try {
      await AsyncStorage.removeItem(`payment_${transactionId}`);
    } catch (error) {
      console.error('Error clearing stored payment details:', error);
    }
  }

  /**
   * Get all pending payments
   * @returns {Promise<array>} Array of pending payments
   */
  static async getPendingPayments() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const paymentKeys = keys.filter(key => key.startsWith('payment_'));
      
      const payments = [];
      for (const key of paymentKeys) {
        const paymentData = await AsyncStorage.getItem(key);
        if (paymentData) {
          const payment = JSON.parse(paymentData);
          if (payment.status === 'pending') {
            payments.push(payment);
          }
        }
      }
      
      return payments;
    } catch (error) {
      console.error('Error getting pending payments:', error);
      return [];
    }
  }
}

export default PaymentUtils;
