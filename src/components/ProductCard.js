import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { colors, spacing, typography } from "../theme"
import { useCart } from "../context/CartContext"

const { width } = Dimensions.get("window")
const cardWidth = (width - spacing.md * 3) / 2

const ProductCard = ({ productListing, onPress, style }) => {
  console.log('ProductCard render:', productListing);
  const { addToCart, isInCart, getCartItemQuantity } = useCart()

  const handleAddToCart = async () => {
    const result = await addToCart(productListing)
    if (result.success) {
      // You can show a toast or success message here
      console.log("Added to cart successfully")
    }
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={12} color={colors.warning} />)
    }

    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={12} color={colors.warning} />)
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
    <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.8}>
      {/* Discount Badge */}
      {discount > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{discount}% OFF</Text>
        </View>
      )}

      {/* Service Badge */}
      {productListing.is_service && (
        <View style={styles.serviceBadge}>
          <Text style={styles.serviceBadgeText}>SERVICE</Text>
        </View>
      )}

      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: productListing.main_image || productListing.thumbnail || "/placeholder.svg?height=200&width=200",
          }}
          style={styles.image}
        />
        {!inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        {/* Brand */}
        {productListing.brand && (
          <Text style={styles.brandName} numberOfLines={1}>
            {productListing.brand.name}
          </Text>
        )}

        {/* Product Name */}
        <Text style={styles.productName} numberOfLines={2}>
          {productListing.name}
        </Text>

        {/* Variant Name */}
        {productListing.variant_name && (
          <Text style={styles.variantName} numberOfLines={1}>
            {productListing.variant_name}
          </Text>
        )}

        {/* Rating */}
        {productListing.rating > 0 && (
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>{renderStars(productListing.rating)}</View>
            <Text style={styles.ratingText}>({productListing.rating})</Text>
            {productListing.review_count > 0 && (
              <Text style={styles.reviewCount}>{productListing.review_count} reviews</Text>
            )}
          </View>
        )}

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{productListing.price}</Text>
          {productListing.mrp && productListing.mrp > productListing.price && (
            <Text style={styles.originalPrice}>₹{productListing.mrp}</Text>
          )}
        </View>

        {/* Stock Info */}
        <Text style={styles.stockInfo}>{inStock ? `${productListing.stock} in stock` : "Out of stock"}</Text>

        {/* Add to Cart Button */}
        <TouchableOpacity
          style={[styles.addToCartButton, !inStock && styles.disabledButton]}
          onPress={handleAddToCart}
          disabled={!inStock}
        >
          <Ionicons name="bag-add-outline" size={16} color={inStock ? colors.background : colors.text.light} />
          <Text style={[styles.addToCartText, !inStock && styles.disabledText]}>
            {!inStock ? "Out of Stock" : cartQuantity > 0 ? `In Cart (${cartQuantity})` : "Add to Cart"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 16,
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  discountBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.deal,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  discountText: {
    color: colors.background,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  serviceBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  serviceBadgeText: {
    color: colors.background,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  imageContainer: {
    position: "relative",
    height: 150,
    backgroundColor: colors.surface,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  outOfStockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  outOfStockText: {
    color: colors.background,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  infoContainer: {
    padding: spacing.sm,
  },
  brandName: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  productName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  variantName: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    fontStyle: "italic",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  stars: {
    flexDirection: "row",
    marginRight: spacing.xs,
  },
  ratingText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginRight: spacing.xs,
  },
  reviewCount: {
    fontSize: typography.sizes.xs,
    color: colors.text.light,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginRight: spacing.xs,
  },
  originalPrice: {
    fontSize: typography.sizes.sm,
    color: colors.text.light,
    textDecorationLine: "line-through",
  },
  stockInfo: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  addToCartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  addToCartText: {
    color: colors.background,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginLeft: spacing.xs,
  },
  disabledText: {
    color: colors.text.light,
  },
})

export default ProductCard
