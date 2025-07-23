"use client"

import { useState, useRef } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { colors, spacing, typography } from "../theme"

const { width } = Dimensions.get("window")

const HeroCarousel = ({ products, onProductPress }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef(null)

  const renderHeroItem = ({ item }) => (
    <View style={styles.heroCard}>
      {/* Deal Badge */}
      {item.dealBadge && (
        <View style={styles.dealBadge}>
          <Text style={styles.dealBadgeText}>{item.dealBadge}</Text>
        </View>
      )}

      {/* Discount Badge */}
      {item.discount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{item.discount}</Text>
        </View>
      )}

      {/* Product Image */}
      <View style={styles.heroImageContainer}>
        <Image source={{ uri: item.image }} style={styles.heroImage} />
      </View>

      {/* Product Info */}
      <View style={styles.heroInfo}>
        <Text style={styles.heroProductName}>{item.name}</Text>

        {/* Rating */}
        <View style={styles.heroRating}>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= item.rating ? "star" : "star-outline"}
                size={16}
                color={colors.warning}
              />
            ))}
          </View>
          <Text style={styles.ratingText}>({item.rating})</Text>
          {item.reviews && <Text style={styles.reviewsText}>{item.reviews} reviews</Text>}
        </View>

        {/* Price */}
        <View style={styles.heroPriceContainer}>
          <Text style={styles.heroPrice}>₹{item.price}</Text>
          {item.originalPrice && <Text style={styles.heroOriginalPrice}>₹{item.originalPrice}</Text>}
        </View>

        {/* Stock Status */}
        <Text style={styles.stockStatus}>{item.inStock ? "✓ In Stock" : "✗ Out of Stock"}</Text>

        {/* Get This Deal Button */}
        <TouchableOpacity
          style={[styles.dealButton, !item.inStock && styles.disabledButton]}
          onPress={() => onProductPress(item)}
          disabled={!item.inStock}
        >
          <Ionicons name="bag-add" size={20} color={colors.background} />
          <Text style={styles.dealButtonText}>Get This Deal</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {products.map((_, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.dot, index === currentIndex && styles.activeDot]}
          onPress={() => {
            setCurrentIndex(index)
            flatListRef.current?.scrollToIndex({ index, animated: true })
          }}
        />
      ))}
    </View>
  )

  const onViewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index)
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={products}
        renderItem={renderHeroItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />
      {products.length > 1 && renderDots()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
  },
  heroCard: {
    width: width - spacing.md * 2,
    backgroundColor: colors.background,
    borderRadius: 12,
    margin: spacing.md,
    padding: spacing.md,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dealBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    zIndex: 1,
  },
  dealBadgeText: {
    color: colors.background,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  discountBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.deal,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    zIndex: 1,
  },
  discountText: {
    color: colors.background,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  heroImageContainer: {
    alignItems: "center",
    marginVertical: spacing.lg,
  },
  heroImage: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  heroInfo: {
    alignItems: "center",
  },
  heroProductName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  heroRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  stars: {
    flexDirection: "row",
    marginRight: spacing.xs,
  },
  ratingText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginRight: spacing.xs,
  },
  reviewsText: {
    fontSize: typography.sizes.sm,
    color: colors.text.light,
  },
  heroPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  heroPrice: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  heroOriginalPrice: {
    fontSize: typography.sizes.lg,
    color: colors.text.light,
    textDecorationLine: "line-through",
  },
  stockStatus: {
    fontSize: typography.sizes.sm,
    color: colors.success,
    marginBottom: spacing.md,
  },
  dealButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  dealButtonText: {
    color: colors.background,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.xs,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 24,
  },
})

export default HeroCarousel
