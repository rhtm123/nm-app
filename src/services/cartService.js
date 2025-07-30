import apiClient from "../config/apiClient"
import { API_ENDPOINTS } from "../config/endpoints"

export const cartService = {
  // Get Cart
  getCart: async (userId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CARTS, {
        params: { user_id: userId },
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to fetch cart" }
    }
  },

  // Create Cart
  createCart: async (cartData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CARTS, cartData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to create cart" }
    }
  },

  // Add Item to Cart
  addToCart: async (cartItemData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CART_ITEMS, cartItemData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to add item to cart" }
    }
  },

  // Update Cart Item
  updateCartItem: async (itemId, updateData) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.CART_ITEM_BY_ID(itemId), updateData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to update cart item" }
    }
  },

  // Remove Cart Item
  removeCartItem: async (itemId) => {
    try {
      await apiClient.delete(API_ENDPOINTS.CART_ITEM_BY_ID(itemId))
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to remove cart item" }
    }
  },

  // Get Cart Items
  getCartItems: async (cartId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CART_ITEMS, {
        params: { cart_id: cartId },
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to fetch cart items" }
    }
  },

  // Wishlist operations
  getWishlist: async (userId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WISHLISTS, {
        params: { user_id: userId },
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to fetch wishlist" }
    }
  },

  addToWishlist: async (wishlistItemData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.WISHLIST_ITEMS, wishlistItemData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to add to wishlist" }
    }
  },

  removeFromWishlist: async (itemId) => {
    try {
      await apiClient.delete(`${API_ENDPOINTS.WISHLIST_ITEMS}${itemId}/`)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to remove from wishlist" }
    }
  },
}

