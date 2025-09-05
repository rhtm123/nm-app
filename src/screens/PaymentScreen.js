import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  BackHandler,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import PaymentUtils from '../utils/PaymentUtils';
import deepLinkManager from '../utils/DeepLinkManager';

const PaymentScreen = ({ route, navigation }) => {
  const { orderData, paymentData } = route.params;
  const webViewRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [error, setError] = useState(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  useEffect(() => {
    initializePayment();
    setupDeepLinkHandler();
    setupBackHandler();

    return () => {
      cleanupListeners();
    };
  }, []);

  const initializePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare payment data with platform information
      const paymentPayload = {
        order_id: orderData.id,
        amount: paymentData.amount,
        estore_id: paymentData.estore_id || 1,
        payment_method: 'pg',
        platform: 'mobile',
        device_info: {
          platform: 'react-native',
          app_version: '1.0.0',
          screen_name: 'PaymentScreen'
        }
      };

      console.log('Initiating payment with:', paymentPayload);

      // Create payment
      const success = await PaymentUtils.initiatePayment(paymentPayload);
      
      if (success) {
        setPaymentInitiated(true);
        // Payment URL will be opened externally by PaymentUtils
        // We'll wait for the deep link callback
        showPaymentInProgress();
      } else {
        setError('Failed to initiate payment. Please try again.');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      setError(error.message || 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  const showPaymentInProgress = () => {
    Alert.alert(
      'Payment Initiated',
      'You will be redirected to PhonePe for payment. Please complete your payment and return to the app.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: handlePaymentCancel
        },
        {
          text: 'OK',
          onPress: () => console.log('Payment in progress')
        }
      ]
    );
  };

  const setupDeepLinkHandler = () => {
    const handlePaymentCallback = (type, data) => {
      if (type === 'payment') {
        console.log('Payment callback received in screen:', data);
        handlePaymentResult(data);
      }
    };

    // Initialize deep link manager
    deepLinkManager.initialize();
    
    // Add listener for payment callbacks
    deepLinkManager.addListener(handlePaymentCallback);
  };

  const setupBackHandler = () => {
    const backAction = () => {
      if (paymentInitiated) {
        Alert.alert(
          'Payment in Progress',
          'Payment is currently in progress. Are you sure you want to go back?',
          [
            { text: 'Stay', style: 'cancel' },
            { text: 'Go Back', onPress: handlePaymentCancel }
          ]
        );
        return true;
      }
      return false;
    };

    BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => BackHandler.removeEventListener('hardwareBackPress', backAction);
  };

  const handlePaymentResult = (data) => {
    const { status, transactionId, orderId } = data;

    setLoading(false);
    setPaymentInitiated(false);

    switch (status) {
      case 'success':
      case 'completed':
        handlePaymentSuccess(data);
        break;
      case 'failed':
        handlePaymentFailure(data);
        break;
      case 'pending':
        handlePaymentPending(data);
        break;
      default:
        handleUnknownStatus(data);
    }
  };

  const handlePaymentSuccess = (data) => {
    Alert.alert(
      'Payment Successful!',
      `Your payment has been completed successfully.\nTransaction ID: ${data.transactionId || 'N/A'}`,
      [
        {
          text: 'View Order',
          onPress: () => navigateToOrderDetails(data.orderId)
        },
        {
          text: 'Go Home',
          onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }]
          })
        }
      ]
    );
  };

  const handlePaymentFailure = (data) => {
    Alert.alert(
      'Payment Failed',
      'Your payment could not be processed. Would you like to try again?',
      [
        {
          text: 'Retry',
          onPress: retryPayment
        },
        {
          text: 'Go Back',
          style: 'cancel',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const handlePaymentPending = (data) => {
    Alert.alert(
      'Payment Processing',
      `Your payment is being processed. You will be notified once it is completed.\nTransaction ID: ${data.transactionId || 'N/A'}`,
      [
        {
          text: 'Check Status Later',
          onPress: () => navigation.goBack()
        },
        {
          text: 'Go Home',
          onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }]
          })
        }
      ]
    );
  };

  const handleUnknownStatus = (data) => {
    Alert.alert(
      'Payment Status Unknown',
      `Payment status: ${data.status}\nTransaction ID: ${data.transactionId || 'N/A'}\n\nPlease check your order history for the latest status.`,
      [
        {
          text: 'Check Orders',
          onPress: () => navigation.navigate('Orders')
        },
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const handlePaymentCancel = () => {
    setLoading(false);
    setPaymentInitiated(false);
    navigation.goBack();
  };

  const retryPayment = () => {
    setError(null);
    setPaymentInitiated(false);
    initializePayment();
  };

  const navigateToOrderDetails = (orderId) => {
    navigation.navigate('OrderDetails', { orderId });
  };

  const cleanupListeners = () => {
    // Clean up deep link listeners
    deepLinkManager.cleanup();
  };

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Payment Error</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={retryPayment}>
        <Text style={styles.retryButtonText}>Retry Payment</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={handlePaymentCancel}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>
        {paymentInitiated ? 'Processing Payment...' : 'Initializing Payment...'}
      </Text>
      <Text style={styles.loadingSubtext}>
        {paymentInitiated 
          ? 'Please complete your payment in PhonePe and return to the app'
          : 'Please wait while we set up your payment'
        }
      </Text>
    </View>
  );

  const renderPaymentInProgress = () => (
    <View style={styles.progressContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.progressTitle}>Payment in Progress</Text>
      <Text style={styles.progressMessage}>
        You have been redirected to PhonePe for payment.
        Please complete your payment and return to the app.
      </Text>
      <TouchableOpacity style={styles.checkStatusButton} onPress={() => {
        // You can implement a manual status check here
        console.log('Checking payment status manually');
      }}>
        <Text style={styles.checkStatusButtonText}>Check Status</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={handlePaymentCancel}>
        <Text style={styles.cancelButtonText}>Cancel Payment</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payment</Text>
        <Text style={styles.headerSubtitle}>
          Order #{orderData?.order_number || orderData?.id}
        </Text>
      </View>

      {error ? renderError() : 
       loading ? renderLoading() :
       paymentInitiated ? renderPaymentInProgress() :
       renderError() // Fallback
      }
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 16,
  },
  progressMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 16,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  checkStatusButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 16,
  },
  checkStatusButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentScreen;
