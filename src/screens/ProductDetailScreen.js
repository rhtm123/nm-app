import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, FlatList, Alert } from "react-native"
import { useState } from "react"
import { useNavigation, useRoute } from "@react-navigation/native"
import Ionicons from "react-native-vector-icons/Ionicons"
import Header from "../components/Header"
import ProductCard from "../components/ProductCard"
import LoadingSpinner from "../components/LoadingSpinner"
import { useProductVariants, useProductDetails, useRelatedProducts } from "../hooks/useProducts"
import { useCart } from "../context/CartContext"
import useWishlistStore from "../stores/wishlistStore"
import useAuthStore from "../stores/authStore"
import { colors, spacing, typography } from "../theme"

const { width } = Dimensions.get("window")

const ProductDetailScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { productListing } = route.params
  const { addToCart, isInCart, getCartItemQuantity } = useCart()
  const { isAuthenticated, user } = useAuthStore()

  const [selectedVariant, setSelectedVariant] = useState(productListing)
  
  // Use selector to properly subscribe to wishlist state changes
  const isVariantInWishlist = useWishlistStore((state) => 
    state.wishlistItemIds.has(selectedVariant.id)
  )
  const wishlistLoading = useWishlistStore((state) => state.isLoading)
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Fetch product variants and details
  const {
    data: variantsData,
    loading: variantsLoading,
    error: variantsError,
  } = useProductVariants(productListing.product_id)
  const {
    data: productDetails,
    loading: detailsLoading,
    error: detailsError,
  } = useProductDetails(productListing.product_id)
  const { data: relatedData, loading: relatedLoading } = useRelatedProducts(productListing.id, { page_size: 10 })

  const variants = variantsData?.results || []
  const relatedProducts = relatedData?.results || []

  const handleAddToCart = async () => {
    const result = await addToCart(selectedVariant, quantity)
    if (result.success) {
      // Show success message or navigate to cart
      console.log("Added to cart successfully")
    }
  }

  const handleWishlistToggle = async () => {
    if (!isAuthenticated || !user) {
      Alert.alert("Login Required", "Please login to add items to wishlist");
      return;
    }
    
    // Prevent multiple clicks while loading
    if (wishlistLoading) {
      return;
    }

    try {
      // Get store methods directly
      const store = useWishlistStore.getState();
      
      // Ensure wishlist is initialized
      const initResult = await store.ensureWishlistInitialized(user.id);
      if (!initResult.success) {
        Alert.alert("Error", "Failed to initialize wishlist. Please try again.");
        return;
      }
      
      // Get current state and toggle
      const wasInWishlist = store.isInWishlist(selectedVariant.id);
      const result = await store.toggleWishlist(selectedVariant);
      
      if (result.success) {
        const message = wasInWishlist ? "Removed from wishlist" : "Added to wishlist";
        console.log(message);
      } else {
        // Only show alert for meaningful errors, not "already in wishlist"
        if (result.error && !result.error.includes('already in wishlist')) {
          Alert.alert("Error", result.error);
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      Alert.alert("Error", "Failed to update wishlist");
    }
  }

  const calculateDiscount = () => {
    if (selectedVariant.mrp && selectedVariant.price) {
      const discount = ((selectedVariant.mrp - selectedVariant.price) / selectedVariant.mrp) * 100
      return Math.round(discount)
    }
    return 0
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={16} color={colors.warning} />)
    }

    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={16} color={colors.warning} />)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={16} color={colors.text.light} />)
    }

    return stars
  }

  const renderImageGallery = () => {
    const images = [selectedVariant.main_image, selectedVariant.thumbnail].filter(Boolean)

    if (images.length === 0) {
      images.push("/placeholder.svg?height=400&width=400")
    }

    return (
      <View className="bg-gray-50">
        <View className="relative">
          <Image 
            source={{ uri: images[selectedImageIndex] }} 
            className="w-full h-80"
            resizeMode="contain"
          />
          {/* Discount Badge Overlay */}
          {calculateDiscount() > 0 && (
            <View className="absolute top-4 left-4 bg-red-500 px-3 py-2 rounded-lg">
              <Text className="text-white text-sm font-bold">{calculateDiscount()}% OFF</Text>
            </View>
          )}
          {/* Service Badge Overlay */}
          {selectedVariant.is_service && (
            <View className="absolute top-4 right-4 bg-purple-500 px-3 py-2 rounded-lg">
              <Text className="text-white text-xs font-bold">SERVICE</Text>
            </View>
          )}
        </View>
        {images.length > 1 && (
          <FlatList
            data={images}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                className={`m-2 rounded-xl overflow-hidden border-2 ${
                  index === selectedImageIndex ? 'border-blue-500' : 'border-transparent'
                }`}
                onPress={() => setSelectedImageIndex(index)}
              >
                <Image source={{ uri: item }} className="w-16 h-16" resizeMode="cover" />
              </TouchableOpacity>
            )}
            className="px-2 py-3"
          />
        )}
      </View>
    )
  }

  const renderVariants = () => {
    if (variants.length <= 1) return null

    return (
      <View style={styles.variantsSection}>
        <Text style={styles.sectionTitle}>Available Variants</Text>
        <FlatList
          data={variants}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.variantCard, item.id === selectedVariant.id && styles.selectedVariant]}
              onPress={() => setSelectedVariant(item)}
            >
              <Image
                source={{ uri: item.main_image || "/placeholder.svg?height=80&width=80" }}
                style={styles.variantImage}
              />
              <Text style={styles.variantName} numberOfLines={2}>
                {item.variant_name || item.name}
              </Text>
              <Text style={styles.variantPrice}>₹{item.price}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.variantsList}
        />
      </View>
    )
  }

  const renderQuantitySelector = () => {
    const maxQuantity = Math.min(selectedVariant.buy_limit || 10, selectedVariant.stock);
    
    return (
      <View className="bg-white px-4 py-5 border-b border-gray-100">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Select Quantity</Text>
        <View className="flex-row items-center justify-center bg-blue-50 rounded-2xl p-2 self-start">
          <TouchableOpacity
            className={`w-12 h-12 rounded-xl items-center justify-center shadow-sm ${quantity <= 1 ? 'bg-gray-200' : 'bg-blue-600'}`}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            activeOpacity={0.7}
          >
            {quantity === 1 ? (
              <Ionicons name="trash-outline" size={20} color={quantity <= 1 ? "#9ca3af" : "#ffffff"} />
            ) : (
              <Ionicons name="remove" size={20} color={quantity <= 1 ? "#9ca3af" : "#ffffff"} />
            )}
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900 mx-6 min-w-[50px] text-center">{quantity}</Text>
          <TouchableOpacity
            className={`w-12 h-12 rounded-xl items-center justify-center shadow-sm ${quantity >= maxQuantity ? 'bg-gray-200' : 'bg-blue-600'}`}
            onPress={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
            disabled={quantity >= maxQuantity}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={20} color={quantity >= maxQuantity ? "#9ca3af" : "#ffffff"} />
          </TouchableOpacity>
        </View>
        {maxQuantity <= 5 && (
          <Text className="text-sm text-orange-600 mt-2">Only {maxQuantity} left in stock!</Text>
        )}
      </View>
    );
  }

  const renderProductInfo = () => (
    <View className="bg-white px-4 py-5 border-b border-gray-100">
      {/* Brand */}
      {selectedVariant.brand && (
        <Text className="text-sm text-blue-600 font-medium mb-2 uppercase tracking-wide">
          {selectedVariant.brand.name}
        </Text>
      )}

      {/* Product Name */}
      <Text className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
        {selectedVariant.name}
      </Text>

      {/* Rating */}
      {selectedVariant.rating > 0 && (
        <View className="flex-row items-center mb-4">
          <View className="flex-row bg-green-50 px-2 py-1 rounded-lg mr-3">
            <View className="flex-row mr-1">{renderStars(selectedVariant.rating)}</View>
            <Text className="text-sm font-semibold text-green-700">({selectedVariant.rating})</Text>
          </View>
          {selectedVariant.review_count > 0 && (
            <Text className="text-sm text-gray-500">{selectedVariant.review_count} reviews</Text>
          )}
        </View>
      )}

      {/* Price */}
      <View className="flex-row items-center mb-4">
        <Text className="text-3xl font-bold text-gray-900 mr-3">₹{selectedVariant.price}</Text>
        {selectedVariant.mrp && selectedVariant.mrp > selectedVariant.price && (
          <>
            <Text className="text-lg text-gray-400 line-through mr-3">₹{selectedVariant.mrp}</Text>
            <View className="bg-orange-500 px-3 py-1 rounded-full">
              <Text className="text-white text-sm font-bold">{calculateDiscount()}% OFF</Text>
            </View>
          </>
        )}
      </View>

      {/* Stock Status */}
      <View className="flex-row items-center mb-3">
        <Ionicons
          name={selectedVariant.stock > 0 ? "checkmark-circle" : "close-circle"}
          size={20}
          color={selectedVariant.stock > 0 ? "#10b981" : "#ef4444"}
        />
        <Text className={`ml-2 text-base font-medium ${
          selectedVariant.stock > 0 ? 'text-green-600' : 'text-red-500'
        }`}>
          {selectedVariant.stock > 0 ? `${selectedVariant.stock} in stock` : "Out of stock"}
        </Text>
      </View>

      {/* Service Badge */}
      {selectedVariant.is_service && (
        <View className="bg-purple-100 px-4 py-2 rounded-full self-start">
          <Text className="text-purple-800 text-sm font-bold">SERVICE AVAILABLE</Text>
        </View>
      )}
    </View>
  )

  const renderProductDetails = () => {
    if (detailsLoading) return <LoadingSpinner />
    if (detailsError || !productDetails) return null

    return (
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Product Details</Text>

        {productDetails.description && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Description:</Text>
            <Text style={styles.detailText}>{productDetails.description}</Text>
          </View>
        )}

        {productDetails.about && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>About:</Text>
            <Text style={styles.detailText}>{productDetails.about}</Text>
          </View>
        )}

        {productDetails.important_info && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Important Information:</Text>
            <Text style={styles.detailText}>{productDetails.important_info}</Text>
          </View>
        )}

        {productDetails.country_of_origin && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Country of Origin:</Text>
            <Text style={styles.detailText}>{productDetails.country_of_origin}</Text>
          </View>
        )}

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Category:</Text>
          <Text style={styles.detailText}>{selectedVariant.category?.name}</Text>
        </View>

        {selectedVariant.units_per_pack > 1 && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Units per Pack:</Text>
            <Text style={styles.detailText}>{selectedVariant.units_per_pack}</Text>
          </View>
        )}
      </View>
    )
  }

  const renderRelatedProducts = () => {
    if (relatedLoading || relatedProducts.length === 0) return null

    return (
      <View style={styles.relatedSection}>
        <Text style={styles.sectionTitle}>Related Products</Text>
        <FlatList
          data={relatedProducts}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ProductCard
              productListing={item}
              onPress={() => navigation.navigate("ProductDetail", { productListing: item })}
              style={styles.relatedProductCard}
            />
          )}
          contentContainerStyle={styles.relatedList}
        />
      </View>
    )
  }

  const cartQuantity = getCartItemQuantity(selectedVariant.id)
  const inStock = selectedVariant.stock > 0

  return (
    <View style={styles.container}>
      {/* Remove custom Header usage at the top, as the stack navigator will provide the header. */}
      {/* In renderRelatedProducts, use navigation.navigate('ProductDetail', { productListing: item }) for related product navigation. */}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderImageGallery()}
        {renderProductInfo()}
        {renderVariants()}
        {renderQuantitySelector()}
        {renderProductDetails()}
        {renderRelatedProducts()}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="flex-row items-center px-4 py-3 bg-white border-t border-gray-200 shadow-lg">
        <TouchableOpacity
          className="w-14 h-14 rounded-2xl border-2 border-blue-600 items-center justify-center mr-4"
          onPress={handleWishlistToggle}
          activeOpacity={0.8}
        >
          <Ionicons 
            name={isVariantInWishlist ? "heart" : "heart-outline"} 
            size={26} 
            color={isVariantInWishlist ? "#ef4444" : "#2563eb"} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center py-4 rounded-2xl ${
            !inStock ? 'bg-gray-300' : 'bg-blue-600'
          }`}
          onPress={handleAddToCart}
          disabled={!inStock}
          activeOpacity={0.9}
        >
          <Ionicons 
            name="bag-add" 
            size={22} 
            color={!inStock ? "#9ca3af" : "#ffffff"} 
          />
          <Text className={`ml-2 text-lg font-semibold ${
            !inStock ? 'text-gray-500' : 'text-white'
          }`}>
            {!inStock ? "Out of Stock" : cartQuantity > 0 ? `Update Cart (${cartQuantity})` : "Add to Cart"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },

  // Image Gallery
  imageGallery: {
    backgroundColor: colors.surface,
    paddingBottom: spacing.md,
  },
  mainImage: {
    width: width,
    height: 300,
    resizeMode: "contain",
  },
  thumbnailList: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  thumbnailContainer: {
    marginRight: spacing.sm,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedThumbnail: {
    borderColor: colors.primary,
  },
  thumbnail: {
    width: 60,
    height: 60,
    resizeMode: "cover",
  },

  // Product Info
  productInfo: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brandName: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  productName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    lineHeight: 28,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  stars: {
    flexDirection: "row",
    marginRight: spacing.sm,
  },
  ratingText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    marginRight: spacing.sm,
  },
  reviewCount: {
    fontSize: typography.sizes.md,
    color: colors.text.light,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  price: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginRight: spacing.md,
  },
  originalPrice: {
    fontSize: typography.sizes.lg,
    color: colors.text.light,
    textDecorationLine: "line-through",
    marginRight: spacing.sm,
  },
  discountBadge: {
    backgroundColor: colors.deal,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  discountText: {
    color: colors.background,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  stockContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  stockText: {
    fontSize: typography.sizes.md,
    marginLeft: spacing.xs,
    fontWeight: typography.weights.medium,
  },
  serviceBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginTop: spacing.sm,
  },
  serviceBadgeText: {
    color: colors.background,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },

  // Variants
  variantsSection: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  variantsList: {
    paddingRight: spacing.md,
  },
  variantCard: {
    width: 100,
    marginRight: spacing.md,
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  selectedVariant: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  variantImage: {
    width: 60,
    height: 60,
    resizeMode: "cover",
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  variantName: {
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  variantPrice: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },

  // Quantity
  quantitySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  quantityLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    borderColor: colors.border,
  },
  quantityText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginHorizontal: spacing.lg,
    minWidth: 30,
    textAlign: "center",
  },

  // Details
  detailsSection: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailItem: {
    marginBottom: spacing.md,
  },
  detailLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  detailText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    lineHeight: 22,
  },

  // Related Products
  relatedSection: {
    padding: spacing.md,
  },
  relatedList: {
    paddingRight: spacing.md,
  },
  relatedProductCard: {
    marginRight: spacing.md,
    width: 180,
  },

  // Bottom Bar
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  wishlistButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  addToCartText: {
    color: colors.background,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.xs,
  },
  disabledText: {
    color: colors.text.light,
  },
})

export default ProductDetailScreen
