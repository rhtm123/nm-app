import apiClient from "../config/apiClient"
import { API_ENDPOINTS } from "../config/endpoints"

// Default estore_id - you may want to make this configurable later
const DEFAULT_ESTORE_ID = process.env.EXPO_PUBLIC_ESTORE_ID || 2;

export const searchService = {
  // Search Products
  searchProducts: async (query, params = {}) => {
    try {
      const searchParams = {
        q: query,
        estore_id: DEFAULT_ESTORE_ID,
        limit: 10,
        ...params
      }
      const response = await apiClient.get(API_ENDPOINTS.SEARCH_PRODUCTS, {
        params: searchParams,
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Search products error:', error)
      return { success: false, error: error.response?.data?.message || "Search failed" }
    }
  },

  // Search Categories
  searchCategories: async (query, params = {}) => {
    try {
      const searchParams = {
        q: query,
        estore_id: DEFAULT_ESTORE_ID,
        ...params
      }
      const response = await apiClient.get(API_ENDPOINTS.SEARCH_CATEGORIES, {
        params: searchParams,
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Search categories error:', error)
      return { success: false, error: error.response?.data?.message || "Category search failed" }
    }
  },

  // Search Brands
  searchBrands: async (query, params = {}) => {
    try {
      const searchParams = {
        q: query,
        estore_id: DEFAULT_ESTORE_ID,
        ...params
      }
      const response = await apiClient.get(API_ENDPOINTS.SEARCH_BRANDS, {
        params: searchParams,
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Search brands error:', error)
      return { success: false, error: error.response?.data?.message || "Brand search failed" }
    }
  },

  // Autocomplete Products
  autocompleteProducts: async (query, limit = 5) => {
    try {
      const searchParams = {
        q: query,
        estore_id: DEFAULT_ESTORE_ID,
        limit
      }
      const response = await apiClient.get(API_ENDPOINTS.AUTOCOMPLETE_PRODUCTS, {
        params: searchParams,
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Autocomplete products error:', error)
      return { success: false, error: error.response?.data?.message || "Autocomplete failed" }
    }
  },

  // Autocomplete Categories
  autocompleteCategories: async (query, limit = 5) => {
    try {
      const searchParams = {
        q: query,
        estore_id: DEFAULT_ESTORE_ID,
        limit
      }
      const response = await apiClient.get(API_ENDPOINTS.AUTOCOMPLETE_CATEGORIES, {
        params: searchParams,
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Autocomplete categories error:', error)
      return { success: false, error: error.response?.data?.message || "Autocomplete failed" }
    }
  },

  // Autocomplete Brands
  autocompleteBrands: async (query, limit = 5) => {
    try {
      const searchParams = {
        q: query,
        estore_id: DEFAULT_ESTORE_ID,
        limit
      }
      const response = await apiClient.get(API_ENDPOINTS.AUTOCOMPLETE_BRANDS, {
        params: searchParams,
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Autocomplete brands error:', error)
      return { success: false, error: error.response?.data?.message || "Autocomplete failed" }
    }
  },
}
