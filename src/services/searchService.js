import apiClient from "../config/apiClient"
import { API_ENDPOINTS } from "../config/endpoints"

export const searchService = {
  // Search Products
  searchProducts: async (query, params = {}) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SEARCH_PRODUCTS, {
        params: { search: query, ...params },
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Search failed" }
    }
  },

  // Search Categories
  searchCategories: async (query, params = {}) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SEARCH_CATEGORIES, {
        params: { search: query, ...params },
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Category search failed" }
    }
  },

  // Search Brands
  searchBrands: async (query, params = {}) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SEARCH_BRANDS, {
        params: { search: query, ...params },
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Brand search failed" }
    }
  },

  // Autocomplete Products
  autocompleteProducts: async (query) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTOCOMPLETE_PRODUCTS, {
        params: { search: query },
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Autocomplete failed" }
    }
  },

  // Autocomplete Categories
  autocompleteCategories: async (query) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTOCOMPLETE_CATEGORIES, {
        params: { search: query },
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Autocomplete failed" }
    }
  },

  // Autocomplete Brands
  autocompleteBrands: async (query) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTOCOMPLETE_BRANDS, {
        params: { search: query },
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Autocomplete failed" }
    }
  },
}
