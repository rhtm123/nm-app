import { View, Text, TouchableOpacity, Image, Dimensions, Alert } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { useCart } from "../context/CartContext"
import useWishlistStore from "../stores/wishlistStore"
import useAuthStore from "../stores/authStore"

const { width } = Dimensions.get("window")
const cardWidth = (width - 16 * 3) / 2

const ProductCard = ({ productListing, onPress, className = "" }) => {
  console.log('ProductCard render:', productListing);
  const { addToCart, isInCart, getCartItemQuantity } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlistStore()
  const { isAuthenticated, user } = useAuthStore()

  const handleAddToCart = async () => {
    const result = await addToCart(productListing)
    if (result.success) {
      // You can show a toast or success message here
      console.log("Added to cart successfully")
    }
  }

  const handleWishlistToggle = async (e) => {
    e.stopPropagation(); // Prevent triggering onPress of the card
    
    if (!isAuthenticated || !user) {
      Alert.alert("Login Required", "Please login to add items to wishlist");
      return;
    }

    try {
      const result = await toggleWishlist(productListing);
      if (result.success) {
        // Optional: Show success message
        console.log(isInWishlist(productListing.id) ? "Removed from wishlist" : "Added to wishlist");
      } else {
        Alert.alert("Error", result.error || "Failed to update wishlist");
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      Alert.alert("Error", "Failed to update wishlist");
    }
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={12} color="#f59e0b" />)
    }

    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={12} color="#f59e0b" />)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={12} color="#9ca3af" />)
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
      className={`bg-white rounded-2xl mb-4 shadow-lg shadow-gray-300/50 overflow-hidden border border-gray-100 ${className}`} 
      onPress={onPress} 
      activeOpacity={0.8}
    >
      {/* Discount Badge */}
      {discount > 0 && (
        <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-md z-10">
          <Text className="text-white text-xs font-bold">{discount}% OFF</Text>
        </View>
      )}

      {/* Service Badge */}
      {productListing.is_service && (
        <View className="absolute top-2 right-2 bg-green-500 px-2 py-1 rounded-md z-10">
          <Text className="text-white text-xs font-bold">SERVICE</Text>
        </View>
      )}

      {/* Product Image */}
      <View className="relative h-40 bg-gray-50">
        <Image
          source={{
            uri: productListing.main_image || productListing.thumbnail || "/placeholder.svg?height=200&width=200",
          }}
          className="w-full h-full"
          resizeMode="cover"
        />
        
        {/* Wishlist Heart Icon */}
        <TouchableOpacity
          className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg"
          onPress={handleWishlistToggle}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isInWishlist(productListing.id) ? "heart" : "heart-outline"}
            size={20}
            color={isInWishlist(productListing.id) ? "#ef4444" : "#6b7280"}
          />
        </TouchableOpacity>
        
        {!inStock && (
          <View className="absolute inset-0 bg-black/50 items-center justify-center">
            <Text className="text-white text-sm font-semibold">Out of Stock</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View className="p-3">
        {/* Brand */}
        {productListing.brand && (
          <Text className="text-xs text-gray-500 mb-1 uppercase font-medium" numberOfLines={1}>
            {productListing.brand.name}
          </Text>
        )}

        {/* Product Name */}
        <Text className="text-sm font-medium text-gray-800 mb-1 leading-5" numberOfLines={2}>
          {productListing.name}
        </Text>

        {/* Variant Name */}
        {productListing.variant_name && (
          <Text className="text-xs text-gray-500 mb-2 italic" numberOfLines={1}>
            {productListing.variant_name}
          </Text>
        )}

        {/* Rating */}
        {productListing.rating > 0 && (
          <View className="flex-row items-center mb-2">
            <View className="flex-row mr-1">{renderStars(productListing.rating)}</View>
            <Text className="text-xs text-gray-500 mr-1">({productListing.rating})</Text>
            {productListing.review_count > 0 && (
              <Text className="text-xs text-gray-400">{productListing.review_count} reviews</Text>
            )}
          </View>
        )}

        {/* Price */}
        <View className="flex-row items-center mb-2">
          <Text className="text-lg font-bold text-gray-800 mr-2">₹{productListing.price}</Text>
          {productListing.mrp && productListing.mrp > productListing.price && (
            <Text className="text-sm text-gray-400 line-through">₹{productListing.mrp}</Text>
          )}
        </View>

        {/* Stock Info */}
        <Text className="text-xs text-gray-500 mb-3">
          {inStock ? `${productListing.stock} in stock` : "Out of stock"}
        </Text>

        {/* Add to Cart Button */}
        <TouchableOpacity
          className={`flex-row items-center justify-center py-2 rounded-lg ${
            inStock ? 'bg-blue-600' : 'bg-gray-300'
          }`}
          onPress={handleAddToCart}
          disabled={!inStock}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="bag-add-outline" 
            size={16} 
            color={inStock ? "#ffffff" : "#9ca3af"} 
          />
          <Text className={`text-sm font-medium ml-1 ${
            inStock ? 'text-white' : 'text-gray-500'
          }`}>
            {!inStock ? "Out of Stock" : cartQuantity > 0 ? `In Cart (${cartQuantity})` : "Add to Cart"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

export default ProductCard
