import apiClient from '../config/apiClient'
import { API_ENDPOINTS } from '../config/endpoints'

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://emotional-cecily-codingchaska-5e686914.koyeb.app'

export const offerApi = {
  // Validate coupon
  validateCoupon: async (code, cartValue = 0, productId = null) => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('cart_value', cartValue.toString())
      if (productId) {
        queryParams.append('product_id', productId.toString())
      }
      const response = await apiClient.get(
        `${API_ENDPOINTS.VALIDATE_COUPON(code)}?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error('Error validating coupon:', error)
      throw error
    }
  },

  // Validate offer
  validateOffer: async (offerId, productIds, quantities) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.VALIDATE_OFFER(offerId),
        {
          product_ids: productIds,
          quantities: quantities
        }
      )
      return response.data
    } catch (error) {
      console.error('Error validating offer:', error)
      throw error
    }
  },

  // Get active coupons
  getActiveCoupons: async () => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.COUPONS}?is_active=true`)
      return response.data
    } catch (error) {
      console.error('Error fetching coupons:', error)
      return []
    }
  },

  // Get active offers
  getActiveOffers: async () => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.OFFERS}?is_active=true`)
      return response.data
    } catch (error) {
      console.error('Error fetching offers:', error)
      return []
    }
  },

  // Get product offers
  getProductOffers: async (productId) => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.PRODUCT_OFFERS_BY_ID(productId)}`)
      return response.data
    } catch (error) {
      console.error('Error fetching product offers:', error)
      return []
    }
  }
} 