"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import useAuthStore from "../stores/authStore"

const CartContext = createContext()

const CART_STORAGE_KEY = "naigaon_market_cart"

const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_CART_ITEMS":
      return {
        ...state,
        items: action.payload,
        loading: false,
      }

    case "ADD_TO_CART": {
      const existingItemIndex = state.items.findIndex((item) => item.id === action.payload.id)

      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedItems = [...state.items]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + (action.payload.quantity || 1),
        }
        return {
          ...state,
          items: updatedItems,
        }
      } else {
        // New item, add to cart
        return {
          ...state,
          items: [
            ...state.items,
            {
              ...action.payload,
              quantity: action.payload.quantity || 1,
              addedAt: new Date().toISOString(),
            },
          ],
        }
      }
    }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      }

    case "UPDATE_QUANTITY": {
      const updatedItems = state.items.map((item) =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item,
      )
      return {
        ...state,
        items: updatedItems,
      }
    }

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
      }

    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      }

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      }

    default:
      return state
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    loading: false,
    error: null,
  })

  const { user, isAuthenticated } = useAuthStore()

  // Load cart from storage when app starts or user changes
  useEffect(() => {
    loadCartFromStorage()
  }, [user])

  // Save cart to storage whenever cart items change
  useEffect(() => {
    saveCartToStorage()
  }, [state.items])

  const loadCartFromStorage = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })

      const cartKey = user ? `${CART_STORAGE_KEY}_${user.id}` : CART_STORAGE_KEY
      const storedCart = await AsyncStorage.getItem(cartKey)

      if (storedCart) {
        const cartItems = JSON.parse(storedCart)
        dispatch({ type: "SET_CART_ITEMS", payload: cartItems })
      } else {
        dispatch({ type: "SET_CART_ITEMS", payload: [] })
      }
    } catch (error) {
      console.error("Error loading cart from storage:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to load cart" })
    }
  }

  const saveCartToStorage = async () => {
    try {
      const cartKey = user ? `${CART_STORAGE_KEY}_${user.id}` : CART_STORAGE_KEY
      await AsyncStorage.setItem(cartKey, JSON.stringify(state.items))
    } catch (error) {
      console.error("Error saving cart to storage:", error)
    }
  }

  const addToCart = async (productListing, quantity = 1) => {
    try {
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
      }

      dispatch({ type: "ADD_TO_CART", payload: cartItem })
      return { success: true, message: "Item added to cart" }
    } catch (error) {
      const errorMessage = error.message || "Failed to add item to cart"
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  const updateQuantity = async (itemId, quantity) => {
    try {
      if (quantity <= 0) {
        return removeFromCart(itemId)
      }

      dispatch({ type: "UPDATE_QUANTITY", payload: { id: itemId, quantity } })
      return { success: true }
    } catch (error) {
      const errorMessage = error.message || "Failed to update quantity"
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  const removeFromCart = async (itemId) => {
    try {
      dispatch({ type: "REMOVE_FROM_CART", payload: itemId })
      return { success: true }
    } catch (error) {
      const errorMessage = error.message || "Failed to remove item"
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  const getCartTotal = () => {
    return state.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  const getCartItemsCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }

  const getCartSavings = () => {
    return state.items.reduce((savings, item) => {
      const itemSavings = (item.mrp - item.price) * item.quantity
      return savings + itemSavings
    }, 0)
  }

  const isInCart = (productListingId) => {
    return state.items.some((item) => item.id === productListingId)
  }

  const getCartItemQuantity = (productListingId) => {
    const item = state.items.find((item) => item.id === productListingId)
    return item ? item.quantity : 0
  }

  return (
    <CartContext.Provider
      value={{
        cartItems: state.items,
        loading: state.loading,
        error: state.error,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount,
        getCartSavings,
        isInCart,
        getCartItemQuantity,
        loadCartFromStorage,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
