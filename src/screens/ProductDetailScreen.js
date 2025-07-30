import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, FlatList } from "react-native"
import { useState } from "react"
import { useNavigation, useRoute } from "@react-navigation/native"
import Ionicons from "react-native-vector-icons/Ionicons"
import Header from "../components/Header"
import ProductCard from "../components/ProductCard"
import LoadingSpinner from "../components/LoadingSpinner"
import { useProductVariants, useProductDetails, useRelatedProducts } from "../hooks/useProducts"
import { useCart } from "../context/CartContext"
import { colors, spacing, typography } from "../theme"

const { width } = Dimensions.get("window")

const ProductDetailScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { productListing } = route.params
  const { addToCart, isInCart, getCartItemQuantity } = useCart()

  const [selectedVariant, setSelectedVariant] = useState(productListing)
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
      <View style={styles.imageGallery}>
        <Image source={{ uri: images[selectedImageIndex] }} style={styles.mainImage} />
        {images.length > 1 && (
          <FlatList
            data={images}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[styles.thumbnailContainer, index === selectedImageIndex && styles.selectedThumbnail]}
                onPress={() => setSelectedImageIndex(index)}
              >
                <Image source={{ uri: item }} style={styles.thumbnail} />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.thumbnailList}
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

  const renderQuantitySelector = () => (
    <View style={styles.quantitySection}>
      <Text style={styles.quantityLabel}>Quantity:</Text>
      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={[styles.quantityButton, quantity <= 1 && styles.disabledButton]}
          onPress={() => setQuantity(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
        >
          <Ionicons name="remove" size={20} color={quantity <= 1 ? colors.text.light : colors.primary} />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{quantity}</Text>
        <TouchableOpacity
          style={[styles.quantityButton, quantity >= selectedVariant.buy_limit && styles.disabledButton]}
          onPress={() => setQuantity(Math.min(selectedVariant.buy_limit, quantity + 1))}
          disabled={quantity >= selectedVariant.buy_limit}
        >
          <Ionicons
            name="add"
            size={20}
            color={quantity >= selectedVariant.buy_limit ? colors.text.light : colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderProductInfo = () => (
    <View style={styles.productInfo}>
      {/* Brand */}
      {selectedVariant.brand && <Text style={styles.brandName}>{selectedVariant.brand.name}</Text>}

      {/* Product Name */}
      <Text style={styles.productName}>{selectedVariant.name}</Text>

      {/* Rating */}
      {selectedVariant.rating > 0 && (
        <View style={styles.ratingContainer}>
          <View style={styles.stars}>{renderStars(selectedVariant.rating)}</View>
          <Text style={styles.ratingText}>({selectedVariant.rating})</Text>
          {selectedVariant.review_count > 0 && (
            <Text style={styles.reviewCount}>{selectedVariant.review_count} reviews</Text>
          )}
        </View>
      )}

      {/* Price */}
      <View style={styles.priceContainer}>
        <Text style={styles.price}>₹{selectedVariant.price}</Text>
        {selectedVariant.mrp && selectedVariant.mrp > selectedVariant.price && (
          <>
            <Text style={styles.originalPrice}>₹{selectedVariant.mrp}</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{calculateDiscount()}% OFF</Text>
            </View>
          </>
        )}
      </View>

      {/* Stock Status */}
      <View style={styles.stockContainer}>
        <Ionicons
          name={selectedVariant.stock > 0 ? "checkmark-circle" : "close-circle"}
          size={16}
          color={selectedVariant.stock > 0 ? colors.success : colors.error}
        />
        <Text style={[styles.stockText, { color: selectedVariant.stock > 0 ? colors.success : colors.error }]}>
          {selectedVariant.stock > 0 ? `${selectedVariant.stock} in stock` : "Out of stock"}
        </Text>
      </View>

      {/* Service Badge */}
      {selectedVariant.is_service && (
        <View style={styles.serviceBadge}>
          <Text style={styles.serviceBadgeText}>SERVICE</Text>
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
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={() => {
            /* Add to wishlist logic */
          }}
        >
          <Ionicons name="heart-outline" size={24} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addToCartButton, !inStock && styles.disabledButton]}
          onPress={handleAddToCart}
          disabled={!inStock}
        >
          <Ionicons name="bag-add" size={20} color={inStock ? colors.background : colors.text.light} />
          <Text style={[styles.addToCartText, !inStock && styles.disabledText]}>
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
