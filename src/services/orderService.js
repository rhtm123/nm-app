import apiClient from "../config/apiClient"
import { API_ENDPOINTS } from "../config/endpoints"

export const orderService = {
  // Create Order
  createOrder: async (orderData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ORDERS, orderData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to create order" }
    }
  },

  // Get Orders
  getOrders: async (params = {}) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDERS, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to fetch orders" }
    }
  },

  // Get Order by ID
  getOrderById: async (orderId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDER_BY_ID(orderId))
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to fetch order" }
    }
  },

  // Update Order
  updateOrder: async (orderId, updateData) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.ORDER_BY_ID(orderId), updateData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to update order" }
    }
  },

  // Get Delivery Status
  getDeliveryStatus: async (orderNumber) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DELIVERY_STATUS(orderNumber))
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to fetch delivery status" }
    }
  },

  // Get Order Items
  getOrderItems: async (params = {}) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDER_ITEMS, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to fetch order items" }
    }
  },
}
