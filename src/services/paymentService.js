import apiClient from "../config/apiClient"
import { API_ENDPOINTS } from "../config/endpoints"

export const paymentService = {
  // Create Payment
  createPayment: async (paymentData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PAYMENTS, paymentData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to create payment" }
    }
  },

  // Get Payments
  getPayments: async (params = {}) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PAYMENTS, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to fetch payments" }
    }
  },

  // Verify Payment
  verifyPayment: async (paymentData) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.VERIFY_PAYMENT, {
        params: paymentData,
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Payment verification failed" }
    }
  },
}
