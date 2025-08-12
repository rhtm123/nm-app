import { View, Text, TouchableOpacity, Image, Dimensions, Alert } from "react-native"
import { memo, useCallback } from "react"
import Ionicons from "react-native-vector-icons/Ionicons"
import { useCart } from "../context/CartContext"
import useWishlistStore from "../stores/wishlistStore"
import { colors } from "../theme"

const { width } = Dimensions.get("window")

const WishlistProductCard = ({ productListing, onPress, onRemove, className = "", style = {} }) => {
  const { addToCart, getCartItemQuantity, updateQuantity, removeFromCart } = useCart()
  
  const handleAddToCart = useCallback(async () => {
    await addToCart(productListing)
  }, [addToCart, productListing])

  const handleIncreaseQuantity = useCallback(async () => {
    await addToCart(productListing, 1)
  }, [addToCart, productListing])

  const handleDecreaseQuantity = useCallback(async () => {
    const currentQuantity = getCartItemQuantity(productListing.id)
    if (currentQuantity > 1) {
      await updateQuantity(productListing.id, currentQuantity - 1)
    } else {
      await removeFromCart(productListing.id)
    }
  }, [getCartItemQuantity, updateQuantity, removeFromCart, productListing.id])

  const handleRemoveFromWishlist = useCallback((e) => {
    e.stopPropagation()
    onRemove(productListing.id)
  }, [onRemove, productListing.id])

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={12} color={colors.rating} />)
    }

    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={12} color={colors.rating} />)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={12} color={colors.text.light} />)
    }

    return stars
  }

  const calculateDiscount = () => {
    if (productListing.mrp && productListing.price) {
      const discount = ((productListing.mrp - productListing.price) / productListing.mrp) * 100
      return Math.round(discount)
    }
    return 0
  }

  const discount = calculateDiscount()
  const inStock = productListing.stock > 0
  const cartQuantity = getCartItemQuantity(productListing.id)

  return (
    <TouchableOpacity 
      style={[{ backgroundColor: colors.surface, ...style }]}
      className={`rounded-xl mb-3 shadow-sm border border-gray-100 overflow-hidden ${className}`}
      onPress={onPress} 
      activeOpacity={0.9}
    >
      {/* Discount Badge */}
      {discount > 0 && (
        <View style={{ backgroundColor: colors.orange, position: 'absolute', top: 6, left: 6, zIndex: 10 }} className="px-1.5 py-0.5 rounded">
          <Text style={{ color: colors.text.white }} className="text-xs font-bold">{discount}% OFF</Text>
        </View>
      )}

      {/* Remove from Wishlist Cross Icon */}
      <TouchableOpacity
        style={{ 
          backgroundColor: colors.error, 
          position: 'absolute', 
          top: 6, 
          right: 6, 
          zIndex: 10,
          borderRadius: 12,
          width: 24,
          height: 24,
          justifyContent: 'center',
          alignItems: 'center'
        }}
        onPress={handleRemoveFromWishlist}
        activeOpacity={0.8}
      >
        <Ionicons
          name="close"
          size={14}
          color="white"
        />
      </TouchableOpacity>

      {/* Product Image */}
      <View style={{ backgroundColor: colors.gray[50] }} className="relative h-32">
        <Image
          source={{
            uri: productListing.main_image || productListing.thumbnail || "/placeholder.svg?height=200&width=200",
          }}
          className="w-full h-full p-2"
          resizeMode="contain"
        />
        
        {!inStock && (
          <View className="absolute inset-0 bg-black/50 items-center justify-center">
            <Text style={{ color: colors.text.white }} className="text-xs font-medium">Out of Stock</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View className="p-3">
        {/* Brand */}
        {productListing.brand && (
          <Text style={{ color: colors.text.secondary }} className="text-xs mb-1 uppercase font-medium" numberOfLines={1}>
            {productListing.brand.name}
          </Text>
        )}

        {/* Product Name */}
        <Text style={{ color: colors.text.primary }} className="text-sm font-medium mb-1 leading-4" numberOfLines={2}>
          {productListing.name}
        </Text>

        {/* Variant Name */}
        {productListing.variant_name && (
          <Text style={{ color: colors.text.muted }} className="text-xs mb-2" numberOfLines={1}>
            {productListing.variant_name}
          </Text>
        )}

        {/* Rating */}
        {productListing.rating > 0 && (
          <View className="flex-row items-center mb-2">
            <View className="flex-row items-center mr-2">
              <View className="flex-row mr-1">{renderStars(productListing.rating)}</View>
              <Text style={{ color: colors.text.secondary }} className="text-xs">({productListing.rating})</Text>
            </View>
            {productListing.review_count > 0 && (
              <Text style={{ color: colors.text.light }} className="text-xs">{productListing.review_count}</Text>
            )}
          </View>
        )}

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
        {cartQuantity > 0 ? (
          <View className="flex-row items-center justify-between">
            {/* Decrease Button */}
            <TouchableOpacity
              style={{ backgroundColor: colors.primary }}
              className="w-8 h-8 rounded-lg items-center justify-center"
              onPress={handleDecreaseQuantity}
              activeOpacity={0.7}
            >
              {cartQuantity === 1 ? (
                <Ionicons name="trash-outline" size={16} color={colors.text.white} />
              ) : (
                <Ionicons name="remove" size={16} color={colors.text.white} />
              )}
            </TouchableOpacity>
            
            {/* Quantity Display - Compact */}
            <View style={{ backgroundColor: colors.surface, borderColor: colors.primary }} className="flex-1 mx-2 border rounded-lg py-1 items-center">
              <Text style={{ color: colors.primary }} className="text-sm font-bold">{cartQuantity}</Text>
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

export default memo(WishlistProductCard)
