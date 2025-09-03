import { View, Text, TouchableOpacity, Image, Dimensions, Alert } from "react-native"
import { memo, useCallback, useEffect } from "react"
import Ionicons from "react-native-vector-icons/Ionicons"
import useCartStore from "../stores/cartStore"
import useWishlistStore from "../stores/wishlistStore"
import useAuthStore from "../stores/authStore"
import { colors } from "../theme"
import StarRating from "./ui/StarRating"
import DiscountBadge from "./ui/DiscountBadge"
import QuantityControls from "./ui/QuantityControls"

const { width } = Dimensions.get("window")
const cardWidth = (width - 16 * 3) / 2

const ProductCard = ({ productListing, onPress, className = "", style = {}, width = null, isWishlistView = false, onRemove = null }) => {
  const { isAuthenticated, user } = useAuthStore()
  
  // Use Zustand selectors for optimal performance
  const cartItemQuantity = useCartStore((state) => state.getCartItemQuantity(productListing.id))
  const addToCart = useCartStore((state) => state.addToCart)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const initializeCart = useCartStore((state) => state.initializeCart)
  
  // Initialize cart on mount
  useEffect(() => {
    initializeCart(user?.id)
  }, [user?.id, initializeCart])
  
  // Use selector to properly subscribe to wishlist state changes
  const isProductInWishlist = useWishlistStore((state) => 
    state.wishlistItemIds.has(productListing.id)
  )
  const wishlistLoading = useWishlistStore((state) => state.isLoading)
  
  const handleAddToCart = useCallback(() => {
    addToCart(productListing, 1, user?.id)
  }, [addToCart, productListing, user?.id])

  const handleIncreaseQuantity = useCallback(() => {
    addToCart(productListing, 1, user?.id)
  }, [addToCart, productListing, user?.id])

  const handleDecreaseQuantity = useCallback(() => {
    if (cartItemQuantity > 1) {
      updateQuantity(productListing.id, cartItemQuantity - 1, user?.id)
    } else {
      removeFromCart(productListing.id, user?.id)
    }
  }, [cartItemQuantity, updateQuantity, removeFromCart, productListing.id, user?.id])

  const handleWishlistToggle = useCallback(async (e) => {
    e.stopPropagation(); // Prevent triggering onPress of the card
    
    // If this is wishlist view and has onRemove, use that instead
    if (isWishlistView && onRemove) {
      onRemove(productListing.id);
      return;
    }
    
    if (!isAuthenticated || !user) {
      Alert.alert("Login Required", "Please login to add items to wishlist");
      return;
    }
    
    // Prevent multiple clicks while loading
    if (wishlistLoading) {
      return;
    }

    // Note: We intentionally allow out-of-stock products to be added to wishlist
    // Stock status should not prevent wishlist operations
    
    try {
      // Get store methods directly
      const store = useWishlistStore.getState();
      
      // Ensure wishlist is initialized
      const initResult = await store.ensureWishlistInitialized(user.id);
      if (!initResult.success) {
        Alert.alert("Error", "Failed to initialize wishlist. Please try again.");
        return;
      }
      
      // Get current state and toggle (works regardless of stock status)
      const wasInWishlist = store.isInWishlist(productListing.id);
      const result = await store.toggleWishlist(productListing);
      
      if (!result.success && result.error && !result.error.includes('already in wishlist')) {
        Alert.alert("Error", result.error);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      Alert.alert("Error", "Failed to update wishlist");
    }
  }, [isAuthenticated, user, wishlistLoading, productListing, isWishlistView, onRemove])

  const inStock = productListing.stock > 0

  return (
    <TouchableOpacity 
      style={[{ backgroundColor: colors.surface, ...style }]}
      className={`rounded-xl mb-3 shadow-sm border border-gray-100 overflow-hidden ${className}`}
      onPress={onPress} 
      activeOpacity={0.9}
    >
      {/* Discount Badge */}
      <DiscountBadge mrp={productListing.mrp} price={productListing.price} />

      {/* Product Image */}
      <View style={{ backgroundColor: colors.gray[50] }} className="relative h-32">
        <Image
          source={{
            uri: productListing.main_image || productListing.thumbnail || "/placeholder.svg?height=200&width=200",
          }}
          className="w-full h-full p-2"
          resizeMode="contain"
        />
        
        {/* Wishlist Icon - Heart for normal view, Close for wishlist view */}
        <TouchableOpacity
          style={{ 
            backgroundColor: isWishlistView ? colors.error : 'rgba(255, 255, 255, 0.95)', 
            position: 'absolute', 
            top: 8, 
            right: 8,
            borderRadius: isWishlistView ? 12 : 18,
            width: isWishlistView ? 28 : 36,
            height: isWishlistView ? 28 : 36,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10, // Ensure it's above the out of stock overlay
            elevation: 5, // For Android
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            borderWidth: 1,
            borderColor: isProductInWishlist ? colors.error : 'rgba(0,0,0,0.1)'
          }}
          onPress={handleWishlistToggle}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isWishlistView ? "close" : (isProductInWishlist ? "heart" : "heart-outline")}
            size={isWishlistView ? 16 : 18}
            color={isWishlistView ? "white" : (isProductInWishlist ? colors.error : '#666666')}
          />
        </TouchableOpacity>
        
        {!inStock && (
          <View style={{ zIndex: 5 }} className="absolute inset-0 bg-black/40 items-center justify-center">
            <Text style={{ color: colors.text.white }} className="text-sm font-semibold bg-black/60 px-3 py-1 rounded-full">Out of Stock</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View className="p-3" style={{ minHeight: 140 }}>
        {/* Brand - Fixed height container */}
        <View style={{ height: 16, marginBottom: 4 }}>
          {productListing.brand && (
            <Text style={{ color: colors.text.secondary }} className="text-xs uppercase font-medium" numberOfLines={1}>
              {productListing.brand.name}
            </Text>
          )}
        </View>

        {/* Product Name - Fixed height container */}
        <View style={{ height: 32, marginBottom: 4 }}>
          <Text style={{ color: colors.text.primary }} className="text-sm font-medium leading-4" numberOfLines={2}>
            {productListing.name}
          </Text>
        </View>

        {/* Variant Name - Fixed height container */}
        <View style={{ height: 16, marginBottom: 8 }}>
          {productListing.variant_name && (
            <Text style={{ color: colors.text.muted }} className="text-xs" numberOfLines={1}>
              {productListing.variant_name}
            </Text>
          )}
        </View>

        {/* Rating - Fixed height container to ensure consistency */}
        <View style={{ height: 20, marginBottom: 8 }}>
          {productListing.rating > 0 ? (
            <View className="flex-row items-center">
              <View className="flex-row items-center mr-2">
                <StarRating rating={productListing.rating} size={12} />
                <Text style={{ color: colors.text.secondary }} className="text-xs ml-1">({productListing.rating})</Text>
              </View>
              {productListing.review_count > 0 && (
                <Text style={{ color: colors.text.light }} className="text-xs">{productListing.review_count}</Text>
              )}
            </View>
          ) : (
            <View />
          )}
        </View>

        {/* Price */}
        <View className="flex-row items-center mb-2">
          <Text style={{ color: colors.text.primary }} className="text-base font-bold mr-2">₹{productListing.price}</Text>
          {productListing.mrp && productListing.mrp > productListing.price && (
            <Text style={{ color: colors.text.light }} className="text-sm line-through">₹{productListing.mrp}</Text>
          )}
        </View>

        {/* Stock Info */}
        <Text style={{ color: inStock ? colors.success : colors.error }} className="text-xs mb-2 font-medium">
          {inStock ? `${productListing.stock} in stock` : "Out of stock"}
        </Text>

        {/* Add to Cart Button - Compact Blinkit Style */}
        {cartItemQuantity > 0 ? (
          <View className="flex-row items-center justify-between">
            {/* Decrease Button */}
            <TouchableOpacity
              style={{ backgroundColor: colors.primary }}
              className="w-8 h-8 rounded-lg items-center justify-center"
              onPress={handleDecreaseQuantity}
              activeOpacity={0.7}
            >
              {cartItemQuantity === 1 ? (
                <Ionicons name="trash-outline" size={16} color={colors.text.white} />
              ) : (
                <Ionicons name="remove" size={16} color={colors.text.white} />
              )}
            </TouchableOpacity>
            
            {/* Quantity Display - Compact */}
            <View style={{ backgroundColor: colors.surface, borderColor: colors.primary }} className="flex-1 mx-2 border rounded-lg py-1 items-center">
              <Text style={{ color: colors.primary }} className="text-sm font-bold">{cartItemQuantity}</Text>
            </View>
            
            {/* Increase Button */}
            <TouchableOpacity
              style={{ backgroundColor: colors.primary }}
              className="w-8 h-8 rounded-lg items-center justify-center"
              onPress={handleIncreaseQuantity}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={16} color={colors.text.white} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={{
              backgroundColor: inStock ? colors.surface : colors.gray[200],
              borderColor: inStock ? colors.primary : colors.gray[300],
            }}
            className="flex-row items-center justify-center py-2 rounded-lg border"
            onPress={handleAddToCart}
            disabled={!inStock}
            activeOpacity={0.8}
          >
            <Text style={{ color: inStock ? colors.primary : colors.text.light }} className="text-sm font-semibold">
              {!inStock ? "Out of Stock" : "ADD"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  )
}

export default memo(ProductCard)
