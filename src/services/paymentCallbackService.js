import { Linking, Alert } from 'react-native';
import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/endpoints';

export const paymentCallbackService = {
  // Handle PhonePe payment callback
  handlePhonePeCallback: async (paymentData) => {
    try {
      const {
        merchantTransactionId,
        transactionId,
        amount,
        responseCode,
        responseMessage,
        paymentInstrument
      } = paymentData;

      // Verify payment with backend using existing API
      const verificationResponse = await apiClient.get(`${API_ENDPOINTS.VERIFY_PAYMENT}?transaction_id=${transactionId}`);

      return {
        success: true,
        data: verificationResponse.data,
        isSuccess: verificationResponse.data.status === 'completed'
      };
    } catch (error) {
      console.error('Payment callback error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Handle deep link payment response
  handleDeepLinkPayment: async (url) => {
    try {
      console.log('Handling deep link payment:', url);
      
      // Parse URL parameters
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const transactionId = urlParams.get('transaction_id') || urlParams.get('merchantTransactionId');
      
      if (!transactionId) {
        throw new Error('No transaction ID found in URL');
      }

      // Verify payment using existing API
      const verificationResponse = await apiClient.get(`${API_ENDPOINTS.VERIFY_PAYMENT}?transaction_id=${transactionId}`);
      
      return {
        success: true,
        data: verificationResponse.data,
        isSuccess: verificationResponse.data.status === 'completed'
      };
    } catch (error) {
      console.error('Deep link payment error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Setup deep link listener
  setupDeepLinkListener: (navigation) => {
    const handleDeepLink = (event) => {
      const { url } = event;
      
      console.log('Deep link received:', url);
      
      if (url && (url.includes('/payment') || url.includes('/checkout'))) {
        paymentCallbackService.handleDeepLinkPayment(url)
          .then(result => {
            if (result.success && result.isSuccess) {
              // Payment successful
              Alert.alert(
                "Payment Successful",
                "Your payment has been completed successfully!",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      // Navigate to order details
                      const orderId = result.data.order_id;
                      if (orderId && navigation) {
                        navigation.navigate("OrderDetails", { orderId: orderId });
                      }
                    }
                  }
                ]
              );
            } else if (result.success && !result.isSuccess) {
              // Payment failed
              Alert.alert(
                "Payment Failed",
                result.data.message || "Payment was not successful. Please try again.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      // Navigate to order details or retry
                      const orderId = result.data.order_id;
                      if (orderId && navigation) {
                        navigation.navigate("OrderDetails", { orderId: orderId });
                      }
                    }
                  }
                ]
              );
            } else {
              // Error handling
              Alert.alert(
                "Payment Error",
                "There was an error processing your payment. Please contact support.",
                [{ text: "OK" }]
              );
            }
          })
          .catch(error => {
            console.error('Payment callback error:', error);
            Alert.alert(
              "Payment Error",
              "There was an error processing your payment. Please contact support.",
              [{ text: "OK" }]
            );
          });
      }
    };

    // Add event listener for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Return cleanup function
    return () => {
      subscription?.remove();
    };
  }
};

export default paymentCallbackService; 