import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useWishlistStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    wishlistItems: [],
    wishlistItemIds: new Set(), // Keep track of product IDs for fast lookup
    isLoading: false,
    wishlistId: null,

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),

  // Initialize wishlist on app start
  initializeWishlist: async (userId) => {
    if (!userId) {
      console.log('No user ID provided for wishlist initialization');
      return { success: false, error: 'No user ID provided' };
    }
    
    try {
      set({ isLoading: true });
      
      // First, try to get existing wishlist
      const wishlistResponse = await apiClient.get(`${API_ENDPOINTS.WISHLISTS}?user_id=${userId}`);
      
      let wishlist;
      if (wishlistResponse.data.results && wishlistResponse.data.results.length > 0) {
        // Use existing wishlist
        wishlist = wishlistResponse.data.results[0];
        console.log('Using existing wishlist:', wishlist.id);
      } else {
        // Create new wishlist
        console.log('Creating new wishlist for user:', userId);
        const newWishlistResponse = await apiClient.post(API_ENDPOINTS.WISHLISTS, {
          user_id: userId,
          estore_id: 1 // Use hardcoded estore_id
        });
        wishlist = newWishlistResponse.data;
        console.log('Created new wishlist:', wishlist.id);
      }

      set({ wishlistId: wishlist.id });

      // Get wishlist items
      await get().fetchWishlistItems();
      
      return { success: true, wishlistId: wishlist.id };

    } catch (error) {
      console.error('Error initializing wishlist:', error);
      set({ wishlistId: null, wishlistItems: [] });
      return { success: false, error: error.message || 'Failed to initialize wishlist' };
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
      const items = response.data.results || [];
      const itemIds = new Set(items.map(item => item.product_listing_id).filter(id => id !== undefined && id !== null));
      
      set({ 
        wishlistItems: items,
        wishlistItemIds: itemIds
      });
      
      // console.log('Fetched wishlist items:', items.length, 'IDs:', Array.from(itemIds));
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      set({ 
        wishlistItems: [],
        wishlistItemIds: new Set()
      });
    } finally {
      set({ isLoading: false });
    }
  },

  // Add item to wishlist
  addToWishlist: async (productListing) => {
    const { wishlistId, wishlistItems, isLoading } = get();
    
    if (!wishlistId) {
      return { success: false, error: 'Wishlist not initialized' };
    }

    // Prevent multiple simultaneous requests
    if (isLoading) {
      return { success: false, error: 'Please wait...' };
    }

    // Check if item is already in wishlist (double-check to prevent race conditions)
    const existingItem = wishlistItems.find(item => 
      item.product_listing_id === productListing.id
    );

    if (existingItem) {
      return { success: false, error: 'Item already in wishlist' };
    }

    try {
      set({ isLoading: true });
      
      // Double-check after setting loading state
      const currentState = get();
      const stillExists = currentState.wishlistItems.find(item => 
        item.product_listing_id === productListing.id
      );
      
      if (stillExists) {
        return { success: false, error: 'Item already in wishlist' };
      }
      
      const wishlistItemData = {
        wishlist_id: wishlistId,
        product_listing_id: productListing.id
      };

      const response = await apiClient.post(API_ENDPOINTS.WISHLIST_ITEMS, wishlistItemData);
      
      // Add to local state immediately for instant UI feedback
      const newItem = {
        ...response.data,
        product_listing: productListing
      };
      
      set(state => {
        const newIds = new Set(state.wishlistItemIds);
        newIds.add(productListing.id);
        return {
          wishlistItems: [...state.wishlistItems, newItem],
          wishlistItemIds: newIds
        };
      });

      console.log('Added to wishlist:', productListing.name, 'ID:', productListing.id);
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
    const { wishlistItems, isLoading } = get();
    
    // Prevent multiple simultaneous requests
    if (isLoading) {
      return { success: false, error: 'Please wait...' };
    }
    
    const wishlistItem = wishlistItems.find(item => 
      item.product_listing_id === productListingId
    );

    if (!wishlistItem) {
      return { success: false, error: 'Item not found in wishlist' };
    }

    try {
      set({ isLoading: true });
      
      // Remove from local state immediately for instant UI feedback
      set(state => {
        const newIds = new Set(state.wishlistItemIds);
        newIds.delete(productListingId);
        return {
          wishlistItems: state.wishlistItems.filter(item => 
            item.product_listing_id !== productListingId
          ),
          wishlistItemIds: newIds
        };
      });
      
      await apiClient.delete(`${API_ENDPOINTS.WISHLIST_ITEMS}${wishlistItem.id}/`);
      
      console.log('Removed from wishlist:', productListingId);
      return { success: true };

    } catch (error) {
      console.error('Error removing from wishlist:', error);
      
      // Revert the local state change if API call failed
      set(state => {
        const newIds = new Set(state.wishlistItemIds);
        newIds.add(productListingId);
        return {
          wishlistItems: [...state.wishlistItems, wishlistItem],
          wishlistItemIds: newIds
        };
      });
      
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
    const { wishlistItemIds } = get();
    const result = wishlistItemIds.has(productListingId);
    // console.log(`IsInWishlist check for product ${productListingId}: ${result}. Total wishlist items: ${wishlistItemIds.size}`);
    return result;
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
      wishlistItemIds: new Set(),
      wishlistId: null 
    });
  },

  // Clear all wishlist items (but keep wishlist active)
  clearAllWishlistItems: async () => {
    const { wishlistItems, isLoading } = get();
    
    if (isLoading) {
      return { success: false, error: 'Please wait...' };
    }

    if (wishlistItems.length === 0) {
      return { success: true, message: 'Wishlist is already empty' };
    }

    try {
      set({ isLoading: true });
      
      // Store original items for rollback
      const originalItems = [...wishlistItems];
      const originalIds = new Set(wishlistItems.map(item => item.product_listing_id));
      
      // Clear local state immediately for instant UI feedback
      set({ 
        wishlistItems: [], 
        wishlistItemIds: new Set()
      });
      
      // Delete all items from server
      const deletePromises = originalItems.map(item => 
        apiClient.delete(`${API_ENDPOINTS.WISHLIST_ITEMS}${item.id}/`)
      );
      
      await Promise.all(deletePromises);
      
      console.log('Cleared all wishlist items');
      return { success: true, message: 'All items removed from wishlist' };

    } catch (error) {
      console.error('Error clearing wishlist:', error);
      
      // Revert the local state change if API call failed
      set({ 
        wishlistItems: originalItems,
        wishlistItemIds: originalIds
      });
      
      return { 
        success: false, 
        error: 'Failed to clear wishlist' 
      };
    } finally {
      set({ isLoading: false });
    }
  },

  // Toggle wishlist item
  toggleWishlist: async (productListing) => {
    const { isInWishlist, addToWishlist, removeFromWishlist, wishlistId } = get();
    
    // Check if wishlist is initialized
    if (!wishlistId) {
      return { success: false, error: 'Wishlist not initialized. Please try again.' };
    }
    
    if (isInWishlist(productListing.id)) {
      return await removeFromWishlist(productListing.id);
    } else {
      return await addToWishlist(productListing);
    }
  },

  // Auto-initialize wishlist when needed
  ensureWishlistInitialized: async (userId) => {
    const { wishlistId, initializeWishlist } = get();
    
    if (!wishlistId && userId) {
      console.log('Auto-initializing wishlist for user:', userId);
      return await initializeWishlist(userId);
    }
    
    return { success: true, wishlistId };
  }
})))

export default useWishlistStore;
