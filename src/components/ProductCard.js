import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native"
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from "../theme"
import { useCart } from "../context/CartContext"

const { width } = Dimensions.get("window")
const cardWidth = (width - spacing.md * 3) / 2

const ProductCard = ({ product, onPress, style }) => {
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart(product)
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

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.8}>
      {/* Discount Badge */}
      {product.discount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{product.discount}</Text>
        </View>
      )}

      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} />
        {!product.inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Rating */}
        {product.rating && (
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>{renderStars(product.rating)}</View>
            <Text style={styles.ratingText}>({product.rating})</Text>
          </View>
        )}

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{product.price}</Text>
          {product.originalPrice && <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>}
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity
          style={[styles.addToCartButton, !product.inStock && styles.disabledButton]}
          onPress={handleAddToCart}
          disabled={!product.inStock}
        >
          <Ionicons name="bag-add-outline" size={16} color={product.inStock ? colors.background : colors.text.light} />
          <Text style={[styles.addToCartText, !product.inStock && styles.disabledText]}>
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    // width: cardWidth, // Remove this line
    width: undefined, // Let parent control width
    backgroundColor: colors.background,
    borderRadius: 12,
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
  productName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    lineHeight: 18,
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
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
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
