import { create } from 'zustand';
import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useWishlistStore = create((set, get) => ({
  // State
  wishlistItems: [],
  isLoading: false,
  wishlistId: null,

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),

  // Initialize wishlist on app start
  initializeWishlist: async (userId) => {
    if (!userId) return;
    
    try {
      set({ isLoading: true });
      
      // First, try to get existing wishlist
      const wishlistResponse = await apiClient.get(`${API_ENDPOINTS.WISHLISTS}?user_id=${userId}`);
      
      let wishlist;
      if (wishlistResponse.data.results && wishlistResponse.data.results.length > 0) {
        // Use existing wishlist
        wishlist = wishlistResponse.data.results[0];
      } else {
        // Create new wishlist
        const newWishlistResponse = await apiClient.post(API_ENDPOINTS.WISHLISTS, {
          user_id: userId,
          estore_id: process.env.EXPO_PUBLIC_ESTORE_ID || 1
        });
        wishlist = newWishlistResponse.data;
      }

      set({ wishlistId: wishlist.id });

      // Get wishlist items
      await get().fetchWishlistItems();

    } catch (error) {
      console.error('Error initializing wishlist:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch wishlist items
  fetchWishlistItems: async () => {
    const { wishlistId } = get();
    if (!wishlistId) return;

    try {
      set({ isLoading: true });
      const response = await apiClient.get(`${API_ENDPOINTS.WISHLIST_ITEMS}?wishlist_id=${wishlistId}`);
      set({ wishlistItems: response.data.results || [] });
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      set({ wishlistItems: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  // Add item to wishlist
  addToWishlist: async (productListing) => {
    const { wishlistId, wishlistItems } = get();
    
    if (!wishlistId) {
      return { success: false, error: 'Wishlist not initialized' };
    }

    // Check if item is already in wishlist
    const existingItem = wishlistItems.find(item => 
      item.product_listing_id === productListing.id
    );

    if (existingItem) {
      return { success: false, error: 'Item already in wishlist' };
    }

    try {
      set({ isLoading: true });
      
      const wishlistItemData = {
        wishlist_id: wishlistId,
        product_listing_id: productListing.id
      };

      const response = await apiClient.post(API_ENDPOINTS.WISHLIST_ITEMS, wishlistItemData);
      
      // Add to local state
      const newItem = {
        ...response.data,
        product_listing: productListing
      };
      
      set({ 
        wishlistItems: [...wishlistItems, newItem]
      });

      return { success: true, data: newItem };

    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add to wishlist' 
      };
    } finally {
      set({ isLoading: false });
    }
  },

  // Remove item from wishlist
  removeFromWishlist: async (productListingId) => {
    const { wishlistItems } = get();
    
    const wishlistItem = wishlistItems.find(item => 
      item.product_listing_id === productListingId
    );

    if (!wishlistItem) {
      return { success: false, error: 'Item not found in wishlist' };
    }

    try {
      set({ isLoading: true });
      
      await apiClient.delete(`${API_ENDPOINTS.WISHLIST_ITEMS}${wishlistItem.id}/`);
      
      // Remove from local state
      set({ 
        wishlistItems: wishlistItems.filter(item => 
          item.product_listing_id !== productListingId
        )
      });

      return { success: true };

    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to remove from wishlist' 
      };
    } finally {
      set({ isLoading: false });
    }
  },

  // Check if item is in wishlist
  isInWishlist: (productListingId) => {
    const { wishlistItems } = get();
    return wishlistItems.some(item => item.product_listing_id === productListingId);
  },

  // Get wishlist item count
  getWishlistCount: () => {
    const { wishlistItems } = get();
    return wishlistItems.length;
  },

  // Clear wishlist (for logout)
  clearWishlist: () => {
    set({ 
      wishlistItems: [], 
      wishlistId: null 
    });
  },

  // Toggle wishlist item
  toggleWishlist: async (productListing) => {
    const { isInWishlist, addToWishlist, removeFromWishlist } = get();
    
    if (isInWishlist(productListing.id)) {
      return await removeFromWishlist(productListing.id);
    } else {
      return await addToWishlist(productListing);
    }
  }
}));

export default useWishlistStore;
