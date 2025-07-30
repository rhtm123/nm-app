import apiClient from "../config/apiClient"
import { API_ENDPOINTS } from "../config/endpoints"

export const productService = {
  // Get Product Listings (Main function - this is what we use everywhere)
  getProductListings: async (params = {}) => {
    console.log('API CALL: getProductListings', params);
    try {
      // Always filter for approved products and add estore_id
      const defaultParams = {
        approved: true,
        estore_id: 2, // Based on your API example
        page: 1,
        page_size: 10,
        ...params,
      }

      const response = await apiClient.get(API_ENDPOINTS.PRODUCT_LISTINGS, { params: defaultParams })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to fetch product listings" }
    }
  },

  // Get Featured Product Listings
  getFeaturedProductListings: async (params = {}) => {
    console.log('API CALL: getFeaturedProductListings');
    try {
      const defaultParams = {
        approved: true,
        estore_id: 2,
        featured: true,
        page_size: 5,
        ...params,
      }

      const response = await apiClient.get(API_ENDPOINTS.PRODUCT_LISTINGS, { params: defaultParams })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to fetch featured products" }
    }
  },

  // Get Product Listing by ID
  getProductListingById: async (listingId) => {
    console.log('API CALL: getProductListingById', listingId);
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCT_LISTING_BY_ID(listingId))
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to fetch product listing" }
    }
  },

  // Get Product Listing by Slug
  getProductListingBySlug: async (slug) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCT_LISTING_BY_SLUG(slug))
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to fetch product listing" }
    }
  },

  // Get Product Variants (All listings for a specific product_id)
  getProductVariants: async (productId) => {
    console.log('API CALL: getProductVariants', productId);
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCT_LISTINGS, {
        params: {
          product_id: productId,
          approved: true,
          estore_id: 2,
          page_size: 50, // Get all variants
        },
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to fetch product variants" }
    }
  },

  // Get Product Details (Base product info)
  getProductById: async (productId) => {
    console.log('API CALL: getProductById', productId);
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCT_BY_ID(productId))
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to fetch product details" }
    }
  },

  // Get Related Products
  getRelatedProducts: async (listingId, params = {}) => {
    console.log('API CALL: getRelatedProducts', listingId, params);
    try {
      const response = await apiClient.get(API_ENDPOINTS.RELATED_PRODUCTS(listingId), { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to fetch related products" }
    }
  },

  // Get Categories
  getCategories: async (params = {}) => {
    console.log('API CALL: getCategories', params);
    try {
      const defaultParams = {
        page_size: 50,
        ...params,
      }
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES, { params: defaultParams })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to fetch categories" }
    }
  },

  // Get Products by Category
  getProductsByCategory: async (categoryId, params = {}) => {
    console.log('API CALL: getProductsByCategory', categoryId, params);
    try {
      const defaultParams = {
        category_id: categoryId,
        approved: true,
        estore_id: 2,
        page: 1,
        page_size: 20,
        ...params,
      }

      const response = await apiClient.get(API_ENDPOINTS.PRODUCT_LISTINGS, { params: defaultParams })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to fetch products by category" }
    }
  },

  // Get Products by Brand
  getProductsByBrand: async (brandIds, params = {}) => {
    try {
      const defaultParams = {
        brand_ids: Array.isArray(brandIds) ? brandIds.join(",") : brandIds,
        approved: true,
        estore_id: 2,
        page: 1,
        page_size: 20,
        ...params,
      }

      const response = await apiClient.get(API_ENDPOINTS.PRODUCT_LISTINGS, { params: defaultParams })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to fetch products by brand" }
    }
  },

  // Search Products
  searchProducts: async (searchQuery, params = {}) => {
    console.log('API CALL: searchProducts', searchQuery, params);
    try {
      const defaultParams = {
        search: searchQuery,
        approved: true,
        estore_id: 2,
        page: 1,
        page_size: 20,
        ...params,
      }

      const response = await apiClient.get(API_ENDPOINTS.PRODUCT_LISTINGS, { params: defaultParams })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to search products" }
    }
  },
}
