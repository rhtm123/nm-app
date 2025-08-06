import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/endpoints';

export const paymentService = {
  // Create a new payment
  createPayment: async (paymentData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PAYMENTS, paymentData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating payment:', error);
      return { success: false, error: error.message };
    }
  },

  // Get payment details by order ID
  getPaymentByOrderId: async (orderId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PAYMENTS, {
        params: { order_id: orderId }
      });
      return { success: true, data: response.data.results };
    } catch (error) {
      console.error('Error getting payment by order ID:', error);
      return { success: false, error: error.message };
    }
  },

  // Verify payment using transaction ID
  verifyPayment: async (transactionId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.VERIFY_PAYMENT, {
        params: { transaction_id: transactionId }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error verifying payment:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all payments with optional filters
  getPayments: async (params = {}) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PAYMENTS, { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error getting payments:', error);
      return { success: false, error: error.message };
    }
  },

  // Check payment status for an order
  checkPaymentStatus: async (orderId) => {
    try {
      // First get the payment details
      const paymentResult = await paymentService.getPaymentByOrderId(orderId);
      
      if (!paymentResult.success || !paymentResult.data || paymentResult.data.length === 0) {
        return { success: false, error: 'No payment found for this order' };
      }

      const latestPayment = paymentResult.data[0];
      
      if (!latestPayment.transaction_id) {
        return { success: false, error: 'No transaction ID found' };
      }

      // Verify the payment
      const verifyResult = await paymentService.verifyPayment(latestPayment.transaction_id);
      
      if (!verifyResult.success) {
        return verifyResult;
      }

      const verificationData = verifyResult.data;
      
      // Check if payment is successful
      if (verificationData.status === 'completed' || verificationData.status === 'success') {
        return { 
          success: true, 
          data: verificationData,
          message: 'Payment completed successfully'
        };
      } else {
        return { 
          success: false, 
          error: `Payment status: ${verificationData.status}`,
          data: verificationData
        };
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      return { success: false, error: error.message };
    }
  },

  // Poll payment status until completion or timeout
  pollPaymentStatus: async (orderId, maxAttempts = 10, interval = 2000) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`Polling payment status - Attempt ${attempt}/${maxAttempts}`);
      
      const result = await paymentService.checkPaymentStatus(orderId);
      
      if (result.success) {
        return result;
      }
      
      // If it's the last attempt, return the error
      if (attempt === maxAttempts) {
        return result;
      }
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    return { success: false, error: 'Payment verification timeout' };
  },

  // Update order payment status
  updateOrderPaymentStatus: async (orderId, paymentStatus) => {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.ORDER_BY_ID(orderId)}`, {
        payment_status: paymentStatus
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating order payment status:', error);
      return { success: false, error: error.message };
    }
  }
};

export default paymentService;
