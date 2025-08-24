import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

const CART_STORAGE_KEY = "naigaon_market_cart"

// Debounce utility for AsyncStorage operations
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

const useCartStore = create((set, get) => {
  // Debounced save function to prevent excessive AsyncStorage calls
  const debouncedSave = debounce(async (items, userId) => {
    try {
      const cartKey = userId ? `${CART_STORAGE_KEY}_${userId}` : CART_STORAGE_KEY
      await AsyncStorage.setItem(cartKey, JSON.stringify(items))
    } catch (error) {
      console.error('Error saving cart to storage:', error)
    }
  }, 500) // 500ms debounce

  return {
    // State
    items: [],
    loading: false,
    error: null,
    initialized: false,

    // Actions
    setLoading: (loading) => set({ loading }),
    
    setError: (error) => set({ error, loading: false }),

    // Initialize cart from storage
    initializeCart: async (userId = null) => {
      if (get().initialized) return
      
      try {
        set({ loading: true })
        const cartKey = userId ? `${CART_STORAGE_KEY}_${userId}` : CART_STORAGE_KEY
        const storedCart = await AsyncStorage.getItem(cartKey)
        
        if (storedCart) {
          const cartItems = JSON.parse(storedCart)
          set({ items: cartItems, loading: false, initialized: true })
        } else {
          set({ items: [], loading: false, initialized: true })
        }
      } catch (error) {
        console.error('Error loading cart from storage:', error)
        set({ error: 'Failed to load cart', loading: false, initialized: true })
      }
    },

    // Add item to cart (optimistic update)
    addToCart: (productListing, quantity = 1, userId = null) => {
      const state = get()
      
      // Transform product listing to cart item format
      const cartItem = {
        id: productListing.id,
        product_id: productListing.product_id,
        name: productListing.name,
        price: productListing.price,
        mrp: productListing.mrp,
        image: productListing.main_image || productListing.thumbnail,
        brand: productListing.brand,
        category: productListing.category,
        variant_name: productListing.variant_name,
        slug: productListing.slug,
        stock: productListing.stock,
        buy_limit: productListing.buy_limit,
        quantity: quantity,
        addedAt: new Date().toISOString(),
      }

      const existingItemIndex = state.items.findIndex((item) => item.id === productListing.id)
      let newItems

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = [...state.items]
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
        }
      } else {
        // Add new item
        newItems = [...state.items, cartItem]
      }

      // Optimistic update - immediate UI response
      set({ items: newItems, error: null })

      // Async save (debounced)
      debouncedSave(newItems, userId)

      return { success: true, message: 'Item added to cart' }
    },

    // Update item quantity (optimistic update)
    updateQuantity: (itemId, quantity, userId = null) => {
      const state = get()
      
      if (quantity <= 0) {
        return get().removeFromCart(itemId, userId)
      }

      const newItems = state.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )

      // Optimistic update
      set({ items: newItems, error: null })

      // Async save (debounced)
      debouncedSave(newItems, userId)

      return { success: true }
    },

    // Remove item from cart (optimistic update)
    removeFromCart: (itemId, userId = null) => {
      const state = get()
      const newItems = state.items.filter((item) => item.id !== itemId)

      // Optimistic update
      set({ items: newItems, error: null })

      // Async save (debounced)
      debouncedSave(newItems, userId)

      return { success: true }
    },

    // Clear entire cart
    clearCart: (userId = null) => {
      set({ items: [], error: null })
      debouncedSave([], userId)
    },

    // Computed values (getters)
    getCartTotal: () => {
      const state = get()
      return state.items.reduce((total, item) => {
        return total + (item.price * item.quantity)
      }, 0)
    },

    getCartItemsCount: () => {
      const state = get()
      return state.items.reduce((total, item) => total + item.quantity, 0)
    },

    getCartSavings: () => {
      const state = get()
      return state.items.reduce((savings, item) => {
        const itemSavings = (item.mrp - item.price) * item.quantity
        return savings + itemSavings
      }, 0)
    },

    isInCart: (productListingId) => {
      const state = get()
      return state.items.some((item) => item.id === productListingId)
    },

    getCartItemQuantity: (productListingId) => {
      const state = get()
      const item = state.items.find((item) => item.id === productListingId)
      return item ? item.quantity : 0
    },

    // Get cart item by ID
    getCartItem: (productListingId) => {
      const state = get()
      return state.items.find((item) => item.id === productListingId) || null
    },

    // Force save to storage (for manual saves)
    saveToStorage: async (userId = null) => {
      const state = get()
      try {
        const cartKey = userId ? `${CART_STORAGE_KEY}_${userId}` : CART_STORAGE_KEY
        await AsyncStorage.setItem(cartKey, JSON.stringify(state.items))
      } catch (error) {
        console.error('Error saving cart to storage:', error)
        set({ error: 'Failed to save cart' })
      }
    },

    // Reset initialization flag (for user logout)
    resetInitialization: () => {
      set({ initialized: false })
    }
  }
})

export default useCartStore
