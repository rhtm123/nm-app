import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, FlatList, Alert, Modal } from "react-native"
import { useState, useEffect, useRef } from "react"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Ionicons from "react-native-vector-icons/Ionicons"
import Header from "../components/Header"
import ProductCard from "../components/ProductCard"
import LoadingSpinner from "../components/LoadingSpinner"
import HtmlRenderer from "../components/ui/HtmlRenderer"
import { useProductVariants, useProductDetails, useRelatedProducts, useProductListingImages, useProductFeatures } from "../hooks/useProducts"
import useCartStore from "../stores/cartStore"
import useWishlistStore from "../stores/wishlistStore"
import useAuthStore from "../stores/authStore"
import { colors, spacing, typography } from "../theme"

const { width } = Dimensions.get("window")

const ProductDetailScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { productListing } = route.params
  const { isAuthenticated, user } = useAuthStore()
  const insets = useSafeAreaInsets()
  
  // Use Zustand selectors for optimal performance
  const addToCart = useCartStore((state) => state.addToCart)
  const getCartItemQuantity = useCartStore((state) => state.getCartItemQuantity)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const initializeCart = useCartStore((state) => state.initializeCart)
  
  // Initialize cart on mount
  useEffect(() => {
    initializeCart(user?.id)
  }, [user?.id, initializeCart])

  const [selectedVariant, setSelectedVariant] = useState(productListing)
  
  // Use selector to properly subscribe to wishlist state changes
  const isVariantInWishlist = useWishlistStore((state) => 
    selectedVariant?.id ? state.wishlistItemIds.has(selectedVariant.id) : false
  )
  const wishlistLoading = useWishlistStore((state) => state.isLoading)
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [imageModalVisible, setImageModalVisible] = useState(false)
  const [selectedFeatureGroup, setSelectedFeatureGroup] = useState(null)
  const imageSliderRef = useRef(null)

  // Fetch all product data
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
  const { data: imagesData, loading: imagesLoading } = useProductListingImages(selectedVariant?.id)
  const { data: featuresData, loading: featuresLoading } = useProductFeatures(selectedVariant?.id)

  const variants = variantsData?.results || []
  const relatedProducts = relatedData?.results || []
  const productImages = imagesData?.results || []
  const productFeatures = featuresData?.results || []
  
  // Group features by feature_group
  const groupedFeatures = productFeatures.reduce((acc, feature) => {
    if (!acc[feature.feature_group]) {
      acc[feature.feature_group] = []
    }
    acc[feature.feature_group].push(feature)
    return acc
  }, {})

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock <= 0) return
    const result = addToCart(selectedVariant, quantity, user?.id)
    if (result.success) {
      Alert.alert("Success", `Added ${quantity} item(s) to cart`)
    } else {
      Alert.alert("Error", result.error || "Failed to add to cart")
    }
  }
  
  const handleIncreaseQuantity = () => {
    addToCart(selectedVariant, 1, user?.id)
  }

  const handleDecreaseQuantity = () => {
    const currentQuantity = getCartItemQuantity(selectedVariant.id)
    if (currentQuantity > 1) {
      updateQuantity(selectedVariant.id, currentQuantity - 1, user?.id)
    } else {
      removeFromCart(selectedVariant.id, user?.id)
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
      const wasInWishlist = store.isInWishlist(selectedVariant?.id);
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
    if (selectedVariant?.mrp && selectedVariant?.price) {
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

  // Create comprehensive image list from all sources
  const getAllImages = () => {
    const images = []
    if (selectedVariant?.main_image) images.push(selectedVariant.main_image)
    if (selectedVariant?.thumbnail && selectedVariant.thumbnail !== selectedVariant.main_image) {
      images.push(selectedVariant.thumbnail)
    }
    productImages.forEach(img => {
      if (img.image && !images.includes(img.image)) {
        images.push(img.image)
      }
    })
    if (images.length === 0) {
      images.push("/placeholder.svg?height=400&width=400")
    }
    return images
  }

  const renderImageGallery = () => {
    if (!selectedVariant) return null
    const images = getAllImages()

    return (
      <View className="bg-gray-50">
        {/* Main Image Slider */}
        <View className="relative">
          <FlatList
            ref={imageSliderRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setImageModalVisible(true)} activeOpacity={0.9}>
                <Image 
                  source={{ uri: item }} 
                  style={{ width, height: 320 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(event.nativeEvent.contentOffset.x / width)
              setSelectedImageIndex(newIndex)
            }}
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
          />
          
          {/* Image Counter */}
          {images.length > 1 && (
            <View className="absolute bottom-4 right-4 bg-black/60 px-3 py-1 rounded-full">
              <Text className="text-white text-sm font-medium">
                {selectedImageIndex + 1} / {images.length}
              </Text>
            </View>
          )}
          
          {/* Badges */}
          <View className="absolute top-4 left-4 flex-row">
            {calculateDiscount() > 0 && (
              <View className="bg-red-500 px-3 py-1 rounded-full mr-2">
                <Text className="text-white text-xs font-bold">{calculateDiscount()}% OFF</Text>
              </View>
            )}
            {selectedVariant.is_service && (
              <View className="bg-purple-500 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-bold">SERVICE</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="px-4 py-3"
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {images.map((image, index) => (
              <TouchableOpacity
                key={index}
                className={`mr-3 rounded-lg overflow-hidden border-2 ${
                  index === selectedImageIndex ? 'border-blue-500' : 'border-gray-200'
                }`}
                onPress={() => {
                  setSelectedImageIndex(index)
                  imageSliderRef.current?.scrollToIndex({ index, animated: true })
                }}
                activeOpacity={0.8}
              >
                <Image source={{ uri: image }} className="w-16 h-16" resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    )
  }
  
  // Full screen image modal
  const renderImageModal = () => {
    const images = getAllImages()
    
    return (
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View className="flex-1 bg-black">
          <TouchableOpacity 
            className="absolute top-12 right-4 z-10 w-10 h-10 rounded-full bg-black/50 items-center justify-center"
            onPress={() => setImageModalVisible(false)}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={{ width }}>
                <Image
                  source={{ uri: item }}
                  style={{ width, height: '100%' }}
                  resizeMode="contain"
                />
              </View>
            )}
            initialScrollIndex={selectedImageIndex}
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
          />
        </View>
      </Modal>
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
    if (!selectedVariant) return null;
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

  const renderProductInfo = () => {
    if (!selectedVariant) return null;
    return (
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
    );
  }

  const renderFeatures = () => {
    if (featuresLoading) return <LoadingSpinner />
    if (Object.keys(groupedFeatures).length === 0) return null

    return (
      <View className="bg-white px-4 py-5 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900 mb-4">Product Features</Text>
        
        {Object.entries(groupedFeatures).map(([group, features], groupIndex) => (
          <View key={group} className="mb-4">
            <TouchableOpacity
              className="flex-row items-center justify-between py-3 border-b border-gray-200"
              onPress={() => setSelectedFeatureGroup(
                selectedFeatureGroup === group ? null : group
              )}
              activeOpacity={0.7}
            >
              <Text className="text-lg font-semibold text-gray-800 capitalize">{group}</Text>
              <Ionicons 
                name={selectedFeatureGroup === group ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={colors.text.secondary} 
              />
            </TouchableOpacity>
            
            {selectedFeatureGroup === group && (
              <View className="mt-2">
                {features.map((feature, index) => (
                  <View key={feature.id} className="flex-row justify-between py-2 px-3 bg-gray-50 rounded-lg mb-2">
                    <Text className="text-gray-700 font-medium flex-1">{feature.name}</Text>
                    <Text className="text-gray-900 font-semibold">{feature.value}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    )
  }

  const renderProductDetails = () => {
    if (detailsLoading) return <LoadingSpinner />
    if (detailsError || !productDetails) return null

    return (
      <View className="bg-white px-4 py-5 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900 mb-4">Product Details</Text>

        {productDetails.description && (
          <View className="mb-4">
            <Text className="text-base font-semibold text-gray-800 mb-2">Description</Text>
            <HtmlRenderer htmlContent={productDetails.description} maxLines={4} />
          </View>
        )}

        {productDetails.about && (
          <View className="mb-4">
            <Text className="text-base font-semibold text-gray-800 mb-2">About This Product</Text>
            <HtmlRenderer htmlContent={productDetails.about} maxLines={3} />
          </View>
        )}

        {productDetails.important_info && (
          <View className="mb-4">
            <Text className="text-base font-semibold text-gray-800 mb-2">Important Information</Text>
            <HtmlRenderer htmlContent={productDetails.important_info} maxLines={3} />
          </View>
        )}

        {selectedVariant.box_items && (
          <View className="mb-4">
            <Text className="text-base font-semibold text-gray-800 mb-2">What's in the Box</Text>
            <Text className="text-gray-600 text-sm leading-5">{selectedVariant.box_items}</Text>
          </View>
        )}
        
        {/* Additional product info */}
        <View className="bg-gray-50 rounded-lg p-4 mt-4">
          <Text className="text-base font-semibold text-gray-800 mb-3">Product Information</Text>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Category:</Text>
            <Text className="text-gray-900 font-medium">{selectedVariant.category?.name}</Text>
          </View>
          
          {selectedVariant.brand && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Brand:</Text>
              <Text className="text-gray-900 font-medium">{selectedVariant.brand.name}</Text>
            </View>
          )}
          
          {productDetails.country_of_origin && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Country of Origin:</Text>
              <Text className="text-gray-900 font-medium">{productDetails.country_of_origin}</Text>
            </View>
          )}
          
          {selectedVariant.units_per_pack > 1 && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Pack Size:</Text>
              <Text className="text-gray-900 font-medium">{selectedVariant.units_per_pack} units</Text>
            </View>
          )}
          
          {selectedVariant.unit_size && selectedVariant.size_unit && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Unit Size:</Text>
              <Text className="text-gray-900 font-medium">{selectedVariant.unit_size} {selectedVariant.size_unit}</Text>
            </View>
          )}
          
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Purchase Limit:</Text>
            <Text className="text-gray-900 font-medium">{selectedVariant.buy_limit || 10} per order</Text>
          </View>
        </View>
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

  const cartQuantity = selectedVariant?.id ? getCartItemQuantity(selectedVariant.id) : 0
  const inStock = selectedVariant ? selectedVariant.stock > 0 : false

  return (
    <View style={styles.container}>
      {/* Remove custom Header usage at the top, as the stack navigator will provide the header. */}
      {/* In renderRelatedProducts, use navigation.navigate('ProductDetail', { productListing: item }) for related product navigation. */}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderImageGallery()}
        {renderProductInfo()}
        {renderVariants()}
        {renderFeatures()}
        {renderProductDetails()}
        {renderRelatedProducts()}
      </ScrollView>

      {/* Enhanced Bottom Action Bar */}
      <View className="bg-white border-t border-gray-200" style={{ 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
      }}>
        {/* Price Summary Bar */}
        <View className="flex-row items-center justify-between px-4 py-2 bg-gray-50">
          <View className="flex-row items-center">
            <Text className="text-lg font-bold text-gray-900">₹{selectedVariant?.price}</Text>
            {selectedVariant?.mrp && selectedVariant.mrp > selectedVariant.price && (
              <View className="flex-row items-center ml-2">
                <Text className="text-sm text-gray-400 line-through">₹{selectedVariant.mrp}</Text>
                <View className="bg-green-500 px-2 py-0.5 rounded-full ml-2">
                  <Text className="text-white text-xs font-bold">{calculateDiscount()}% OFF</Text>
                </View>
              </View>
            )}
          </View>
          <Text className="text-sm text-gray-600">
            {selectedVariant?.stock > 0 ? `${selectedVariant.stock} in stock` : 'Out of stock'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View 
          className="flex-row items-center px-4" 
          style={{
            paddingTop: 16,
            paddingBottom: Math.max(insets.bottom + 8, 16), // Dynamic bottom padding for gesture navigation
          }}
        >
          {/* Wishlist Button */}
          <TouchableOpacity
            className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${
              isVariantInWishlist ? 'bg-red-500' : 'bg-gray-200'
            }`}
            onPress={handleWishlistToggle}
            activeOpacity={0.8}
            disabled={wishlistLoading}
          >
            <Ionicons 
              name={isVariantInWishlist ? "heart" : "heart-outline"} 
              size={20} 
              color={isVariantInWishlist ? "white" : "#6b7280"} 
            />
          </TouchableOpacity>

          {cartQuantity > 0 ? (
            <View className="flex-1 flex-row items-center space-x-3">
              {/* Compact Quantity Controls */}
              <View className="flex-row items-center bg-blue-50 rounded-xl border border-blue-200">
                <TouchableOpacity
                  className="w-10 h-10 rounded-l-xl bg-blue-600 items-center justify-center"
                  onPress={handleDecreaseQuantity}
                  activeOpacity={0.8}
                >
                  {cartQuantity === 1 ? (
                    <Ionicons name="trash-outline" size={16} color="white" />
                  ) : (
                    <Ionicons name="remove" size={16} color="white" />
                  )}
                </TouchableOpacity>
                
                <Text className="text-base font-bold text-blue-900 px-4 py-2 min-w-[40px] text-center bg-blue-50">
                  {cartQuantity}
                </Text>
                
                <TouchableOpacity
                  className="w-10 h-10 rounded-r-xl bg-blue-600 items-center justify-center"
                  onPress={handleIncreaseQuantity}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={16} color="white" />
                </TouchableOpacity>
              </View>
              
              {/* Go to Cart Button */}
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center py-3 rounded-xl bg-green-600"
                onPress={() => navigation.navigate('MainTabs', { screen: 'Cart' })}
                activeOpacity={0.9}
                style={{
                  shadowColor: '#10b981',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Ionicons name="cart" size={20} color="white" />
                <Text className="ml-2 text-base font-bold text-white">Go to Cart</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Add to Cart Section */
            <View className="flex-1 flex-row items-center space-x-2">
              {/* Quantity Selector */}
              <View className="flex-row items-center bg-gray-100 rounded-xl border border-gray-300">
                <TouchableOpacity
                  className={`w-10 h-10 rounded-l-xl items-center justify-center ${
                    quantity <= 1 ? 'bg-gray-300' : 'bg-gray-600'
                  }`}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={16} color={quantity <= 1 ? "#9ca3af" : "white"} />
                </TouchableOpacity>
                
                <Text className="text-base font-bold text-gray-900 px-3 py-2 min-w-[40px] text-center bg-gray-100">
                  {quantity}
                </Text>
                
                <TouchableOpacity
                  className="w-10 h-10 rounded-r-xl bg-gray-600 items-center justify-center"
                  onPress={() => setQuantity(Math.min(
                    Math.min(selectedVariant?.buy_limit || 10, selectedVariant?.stock || 0), 
                    quantity + 1
                  ))}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={16} color="white" />
                </TouchableOpacity>
              </View>

              {/* Add to Cart Button */}
              <TouchableOpacity
                className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${
                  !inStock ? 'bg-gray-400' : 'bg-blue-600'
                }`}
                onPress={handleAddToCart}
                disabled={!inStock}
                activeOpacity={0.9}
                style={!inStock ? {} : {
                  shadowColor: '#2563eb',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Ionicons 
                  name={!inStock ? "close-circle" : "bag-add"} 
                  size={20} 
                  color={!inStock ? "#6b7280" : "white"} 
                />
                <Text className={`ml-2 text-base font-bold ${
                  !inStock ? 'text-gray-600' : 'text-white'
                }`}>
                  {!inStock ? "Out of Stock" : "Add to Cart"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      
      {/* Image Modal */}
      {renderImageModal()}
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
