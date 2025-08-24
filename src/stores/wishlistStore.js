import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Debounce utility for API operations
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const useWishlistStore = create(
  subscribeWithSelector((set, get) => {
    // Debounced API operations to prevent excessive calls
    const debouncedAddToWishlist = debounce(async (productListing, wishlistId) => {
      try {
        const wishlistItemData = {
          wishlist_id: wishlistId,
          product_listing_id: productListing.id
        };
        const response = await apiClient.post(API_ENDPOINTS.WISHLIST_ITEMS, wishlistItemData);
        
        // Update the temporary item with real server data
        set(state => {
          // Find the first temp item for this product and replace it
          let tempItemReplaced = false;
          const updatedItems = state.wishlistItems.map(item => {
            if (item.product_listing_id === productListing.id && 
                item.id.toString().startsWith('temp_') && !tempItemReplaced) {
              tempItemReplaced = true;
              return {
                ...response.data,
                product_listing: productListing
              };
            }
            return item;
          });
          
          // If no temp item was found, this might be a fresh add - ensure no duplicates
          const hasRealItem = updatedItems.some(item => 
            item.product_listing_id === productListing.id && 
            !item.id.toString().startsWith('temp_')
          );
          
          if (!hasRealItem && !tempItemReplaced) {
            // Add new item if no real item exists
            updatedItems.push({
              ...response.data,
              product_listing: productListing
            });
          }
          
          return {
            wishlistItems: updatedItems
          };
        });
        
        console.log('Added to wishlist (API):', productListing.name, 'Real ID:', response.data.id);
      } catch (error) {
        console.error('Error adding to wishlist (API):', error);
        // Revert optimistic update on API failure
        set(state => {
          const newIds = new Set(state.wishlistItemIds);
          newIds.delete(productListing.id);
          return {
            wishlistItems: state.wishlistItems.filter(item => 
              item.product_listing_id !== productListing.id
            ),
            wishlistItemIds: newIds
          };
        });
      }
    }, 300);

    const debouncedRemoveFromWishlist = debounce(async (productListingId, wishlistItem) => {
      try {
        // Only make API call if item has a real server ID (not temporary)
        if (wishlistItem.id && !wishlistItem.id.toString().startsWith('temp_')) {
          await apiClient.delete(`${API_ENDPOINTS.WISHLIST_ITEMS}${wishlistItem.id}/`);
          console.log('Removed from wishlist (API):', productListingId, 'ID:', wishlistItem.id);
        } else {
          console.log('Skipped API call for temporary item:', productListingId);
        }
      } catch (error) {
        console.error('Error removing from wishlist (API):', error);
        // Revert optimistic update on API failure
        set(state => {
          const newIds = new Set(state.wishlistItemIds);
          newIds.add(productListingId);
          return {
            wishlistItems: [...state.wishlistItems, wishlistItem],
            wishlistItemIds: newIds
          };
        });
      }
    }, 300);

    return {
      // State
      wishlistItems: [],
      wishlistItemIds: new Set(), // Keep track of product IDs for fast lookup
      isLoading: false,
      wishlistId: null,
      pendingOperations: new Set(), // Track pending operations to prevent duplicates

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
          estore_id: 2 // Use hardcoded estore_id
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
      
      // Deduplicate items by product_listing_id
      const uniqueItems = [];
      const seenIds = new Set();
      
      items.forEach(item => {
        if (item.product_listing_id && !seenIds.has(item.product_listing_id)) {
          uniqueItems.push(item);
          seenIds.add(item.product_listing_id);
        }
      });
      
      const itemIds = new Set(uniqueItems.map(item => item.product_listing_id));
      
      set({ 
        wishlistItems: uniqueItems,
        wishlistItemIds: itemIds,
        pendingOperations: new Set() // Clear pending operations on fresh fetch
      });
      
      console.log('Fetched wishlist items:', uniqueItems.length, 'unique items');
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      set({ 
        wishlistItems: [],
        wishlistItemIds: new Set(),
        pendingOperations: new Set()
      });
    } finally {
      set({ isLoading: false });
    }
  },

  // Add item to wishlist (OPTIMISTIC UPDATE - INSTANT UI)
  addToWishlist: (productListing) => {
    const { wishlistId, wishlistItems, wishlistItemIds, pendingOperations } = get();
    
    if (!wishlistId) {
      return { success: false, error: 'Wishlist not initialized' };
    }

    // Prevent duplicate operations
    const operationKey = `add_${productListing.id}`;
    if (pendingOperations.has(operationKey)) {
      return { success: false, error: 'Operation in progress' };
    }

    // Double check if item is already in wishlist (prevent duplicates)
    const existingItem = wishlistItems.find(item => item.product_listing_id === productListing.id);
    if (existingItem || wishlistItemIds.has(productListing.id)) {
      console.log('Item already in wishlist:', productListing.name);
      return { success: false, error: 'Item already in wishlist' };
    }

    // OPTIMISTIC UPDATE - Update UI immediately
    const newItem = {
      id: `temp_${Date.now()}_${productListing.id}`, // Unique temporary ID
      product_listing_id: productListing.id,
      product_listing: productListing,
      wishlist_id: wishlistId
    };
    
    set(state => {
      // Final deduplication check before adding
      const hasExisting = state.wishlistItems.some(item => item.product_listing_id === productListing.id);
      if (hasExisting) {
        return state; // Don't modify state if duplicate found
      }
      
      const newIds = new Set(state.wishlistItemIds);
      const newPendingOps = new Set(state.pendingOperations);
      newIds.add(productListing.id);
      newPendingOps.add(operationKey);
      
      return {
        wishlistItems: [...state.wishlistItems, newItem],
        wishlistItemIds: newIds,
        pendingOperations: newPendingOps
      };
    });

    // Async API call (debounced) - doesn't block UI
    debouncedAddToWishlist(productListing, wishlistId);
    
    // Remove pending operation after delay
    setTimeout(() => {
      set(state => {
        const newPendingOps = new Set(state.pendingOperations);
        newPendingOps.delete(operationKey);
        return { pendingOperations: newPendingOps };
      });
    }, 500);

    console.log('Added to wishlist (optimistic):', productListing.name);
    return { success: true, data: newItem };
  },

  // Remove item from wishlist (OPTIMISTIC UPDATE - INSTANT UI)
  removeFromWishlist: (productListingId) => {
    const { wishlistItems, wishlistItemIds, pendingOperations } = get();
    
    // Prevent duplicate operations
    const operationKey = `remove_${productListingId}`;
    if (pendingOperations.has(operationKey)) {
      return { success: false, error: 'Operation in progress' };
    }
    
    // Find the wishlist item to remove (check both regular items and any with temp IDs)
    const wishlistItem = wishlistItems.find(item => 
      item.product_listing_id === productListingId
    );

    // If item not found in wishlist items but exists in itemIds, remove it anyway (cleanup)
    if (!wishlistItem && !wishlistItemIds.has(productListingId)) {
      console.log('Item not found in wishlist:', productListingId);
      return { success: false, error: 'Item not found in wishlist' };
    }

    // OPTIMISTIC UPDATE - Update UI immediately
    set(state => {
      const newIds = new Set(state.wishlistItemIds);
      const newPendingOps = new Set(state.pendingOperations);
      newIds.delete(productListingId);
      newPendingOps.add(operationKey);
      
      return {
        wishlistItems: state.wishlistItems.filter(item => 
          item.product_listing_id !== productListingId
        ),
        wishlistItemIds: newIds,
        pendingOperations: newPendingOps
      };
    });
    
    // Only make API call if item has a real server ID
    if (wishlistItem && wishlistItem.id && !wishlistItem.id.toString().startsWith('temp_')) {
      // Async API call (debounced) - doesn't block UI
      debouncedRemoveFromWishlist(productListingId, wishlistItem);
    } else {
      console.log('Skipped API call for item that was never saved to server:', productListingId);
    }
    
    // Remove pending operation after delay
    setTimeout(() => {
      set(state => {
        const newPendingOps = new Set(state.pendingOperations);
        newPendingOps.delete(operationKey);
        return { pendingOperations: newPendingOps };
      });
    }, 500);
    
    console.log('Removed from wishlist (optimistic):', productListingId);
    return { success: true };
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
        wishlistItemIds: new Set(),
        pendingOperations: new Set() // Clear pending operations too
      });
      
      // Delete only items with real server IDs
      const realItems = originalItems.filter(item => 
        item.id && !item.id.toString().startsWith('temp_')
      );
      
      if (realItems.length > 0) {
        const deletePromises = realItems.map(item => 
          apiClient.delete(`${API_ENDPOINTS.WISHLIST_ITEMS}${item.id}/`)
        );
        await Promise.all(deletePromises);
      }
      
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

  // Toggle wishlist item (INSTANT UI RESPONSE)
  toggleWishlist: (productListing) => {
    const { isInWishlist, addToWishlist, removeFromWishlist, wishlistId } = get();
    
    // Check if wishlist is initialized
    if (!wishlistId) {
      return { success: false, error: 'Wishlist not initialized. Please try again.' };
    }
    
    if (isInWishlist(productListing.id)) {
      return removeFromWishlist(productListing.id);
    } else {
      return addToWishlist(productListing);
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
  },

  // Force sync with server (for manual refresh)
  syncWithServer: async () => {
    const { wishlistId } = get();
    if (!wishlistId) return;
    
    try {
      set({ isLoading: true });
      const response = await apiClient.get(`${API_ENDPOINTS.WISHLIST_ITEMS}?wishlist_id=${wishlistId}`);
      const items = response.data.results || [];
      const itemIds = new Set(items.map(item => item.product_listing_id).filter(id => id !== undefined && id !== null));
      
      set({ 
        wishlistItems: items,
        wishlistItemIds: itemIds,
        pendingOperations: new Set() // Clear pending operations on sync
      });
      
      console.log('Synced wishlist with server:', items.length, 'items');
      return { success: true };
    } catch (error) {
      console.error('Error syncing wishlist:', error);
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  }
    };
  })
)

export default useWishlistStore;
