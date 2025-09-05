import { Linking, Alert } from 'react-native';
import AppLink from 'react-native-app-link';

class DeepLinkManager {
  constructor() {
    this.listeners = [];
    this.isInitialized = false;
  }

  /**
   * Initialize deep link handling
   */
  initialize() {
    if (this.isInitialized) return;
    
    this.isInitialized = true;
    
    // Handle initial URL if app was opened via deep link
    this.handleInitialURL();
    
    // Listen for incoming deep links while app is running
    this.addEventListener();
  }

  /**
   * Handle the initial URL when app is opened via deep link
   */
  async handleInitialURL() {
    try {
      const url = await Linking.getInitialURL();
      if (url) {
        console.log('Initial URL:', url);
        this.handleDeepLink(url);
      }
    } catch (error) {
      console.error('Error getting initial URL:', error);
    }
  }

  /**
   * Add event listener for deep links
   */
  addEventListener() {
    const subscription = Linking.addEventListener('url', (event) => {
      console.log('Incoming URL:', event.url);
      this.handleDeepLink(event.url);
    });
    
    this.listeners.push(subscription);
  }

  /**
   * Parse and handle deep link URL
   * @param {string} url - The deep link URL
   */
  handleDeepLink(url) {
    try {
      const parsed = this.parseDeepLink(url);
      
      if (!parsed) return;

      switch (parsed.host) {
        case 'payment':
          this.handlePaymentCallback(parsed);
          break;
        case 'order':
          this.handleOrderCallback(parsed);
          break;
        default:
          console.log('Unknown deep link host:', parsed.host);
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
    }
  }

  /**
   * Parse deep link URL into components
   * @param {string} url - The deep link URL
   * @returns {object|null} Parsed URL components
   */
  parseDeepLink(url) {
    try {
      // Handle custom scheme: naigaonmarketapp://payment?status=success&transaction_id=123
      const urlObj = new URL(url);
      
      if (urlObj.protocol !== 'naigaonmarketapp:') {
        return null;
      }

      const host = urlObj.hostname || urlObj.pathname.replace('//', '').split('/')[0];
      const params = {};
      
      // Parse query parameters
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });

      return {
        scheme: urlObj.protocol.replace(':', ''),
        host,
        params
      };
    } catch (error) {
      console.error('Error parsing deep link:', error);
      return null;
    }
  }

  /**
   * Handle payment callback from PhonePe
   * @param {object} parsed - Parsed deep link data
   */
  handlePaymentCallback(parsed) {
    const { params } = parsed;
    const { status, transaction_id, order_id } = params;

    console.log('Payment callback received:', params);

    // Notify listeners about payment status
    this.notifyListeners('payment', {
      status,
      transactionId: transaction_id,
      orderId: order_id,
      ...params
    });

    // Show appropriate message to user
    if (status === 'success') {
      Alert.alert(
        'Payment Successful!',
        `Your payment has been completed successfully.${transaction_id ? `\nTransaction ID: ${transaction_id}` : ''}`,
        [{ text: 'OK', onPress: () => this.navigateToOrderSuccess(order_id) }]
      );
    } else if (status === 'failed') {
      Alert.alert(
        'Payment Failed',
        'Your payment could not be processed. Please try again.',
        [{ text: 'OK', onPress: () => this.navigateToPaymentRetry(order_id) }]
      );
    } else {
      Alert.alert(
        'Payment Status',
        `Payment status: ${status}${transaction_id ? `\nTransaction ID: ${transaction_id}` : ''}`,
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Handle order callback
   * @param {object} parsed - Parsed deep link data
   */
  handleOrderCallback(parsed) {
    const { params } = parsed;
    console.log('Order callback received:', params);
    
    this.notifyListeners('order', params);
  }

  /**
   * Register a listener for deep link events
   * @param {function} callback - Callback function to handle deep link events
   */
  addListener(callback) {
    if (typeof callback === 'function') {
      this.listeners.push({ callback, type: 'custom' });
    }
  }

  /**
   * Remove a listener
   * @param {function} callback - Callback function to remove
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => 
      listener.type !== 'custom' || listener.callback !== callback
    );
  }

  /**
   * Notify all listeners about deep link events
   * @param {string} type - Event type
   * @param {object} data - Event data
   */
  notifyListeners(type, data) {
    this.listeners.forEach(listener => {
      if (listener.type === 'custom') {
        try {
          listener.callback(type, data);
        } catch (error) {
          console.error('Error in deep link listener:', error);
        }
      }
    });
  }

  /**
   * Navigate to order success page
   * @param {string} orderId - Order ID
   */
  navigateToOrderSuccess(orderId) {
    // You can implement navigation logic here
    // For example, using React Navigation:
    // NavigationService.navigate('OrderSuccess', { orderId });
    console.log('Navigate to order success:', orderId);
  }

  /**
   * Navigate to payment retry page
   * @param {string} orderId - Order ID
   */
  navigateToPaymentRetry(orderId) {
    // You can implement navigation logic here
    // For example, using React Navigation:
    // NavigationService.navigate('Payment', { orderId, retry: true });
    console.log('Navigate to payment retry:', orderId);
  }

  /**
   * Generate app redirect URL for payments
   * @param {string} transactionId - Transaction ID
   * @param {string} orderId - Order ID
   * @returns {string} Deep link URL
   */
  static generatePaymentRedirectURL(transactionId, orderId) {
    const baseUrl = 'naigaonmarketapp://payment';
    const params = new URLSearchParams({
      transaction_id: transactionId,
      order_id: orderId,
      timestamp: Date.now().toString()
    });
    
    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Check if app can handle deep links
   * @returns {Promise<boolean>}
   */
  static async canHandleDeepLinks() {
    try {
      const supported = await Linking.canOpenURL('naigaonmarketapp://');
      return supported;
    } catch (error) {
      console.error('Error checking deep link support:', error);
      return false;
    }
  }

  /**
   * Open external URL (e.g., PhonePe payment URL)
   * @param {string} url - URL to open
   * @returns {Promise<boolean>}
   */
  static async openExternalURL(url) {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      } else {
        console.warn('Cannot open URL:', url);
        return false;
      }
    } catch (error) {
      console.error('Error opening external URL:', error);
      return false;
    }
  }

  /**
   * Clean up listeners
   */
  cleanup() {
    this.listeners.forEach(listener => {
      if (listener.remove) {
        listener.remove();
      }
    });
    this.listeners = [];
    this.isInitialized = false;
  }
}

// Export singleton instance
const deepLinkManager = new DeepLinkManager();

export default deepLinkManager;
export { DeepLinkManager };
