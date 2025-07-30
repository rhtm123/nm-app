import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from "react-native"
import { useState } from "react"
import { useNavigation } from "@react-navigation/native"
import Ionicons from "react-native-vector-icons/Ionicons"
import Header from "../components/Header"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { colors, spacing, typography } from "../theme"

const CartScreen = () => {
  const navigation = useNavigation()
  const { user } = useAuth()
  const {
    cartItems,
    loading,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    getCartSavings,
  } = useCart()

  const [updatingItems, setUpdatingItems] = useState({})

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId)
      return
    }

    setUpdatingItems((prev) => ({ ...prev, [itemId]: true }))
    await updateQuantity(itemId, newQuantity)
    setUpdatingItems((prev) => ({ ...prev, [itemId]: false }))
  }

  const handleRemoveItem = (itemId) => {
    Alert.alert("Remove Item", "Are you sure you want to remove this item from your cart?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeFromCart(itemId) },
    ])
  }

  const handleClearCart = () => {
    Alert.alert("Clear Cart", "Are you sure you want to remove all items from your cart?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear All", style: "destructive", onPress: clearCart },
    ])
  }

  const handleCheckout = () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to proceed with checkout", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => navigation.navigate("Profile") },
      ])
      return
    }
    navigation.navigate("Checkout")
  }

  const renderCartItem = ({ item }) => {
    const isUpdating = updatingItems[item.id]
    const maxQuantity = Math.min(item.buy_limit || 10, item.stock)

    return (
      <View style={styles.cartItem}>
        {/* Product Image */}
        <TouchableOpacity onPress={() => navigation.navigate("ProductDetail", { productListing: item })}>
          <Image source={{ uri: item.image || "/placeholder.svg?height=100&width=100" }} style={styles.productImage} />
        </TouchableOpacity>

        {/* Product Details */}
        <View style={styles.productDetails}>
          <TouchableOpacity onPress={() => navigation.navigate("ProductDetail", { productListing: item })}>
            {/* Brand */}
            {item.brand && <Text style={styles.brandName}>{item.brand.name}</Text>}

            {/* Product Name */}
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>

            {/* Variant */}
            {item.variant_name && <Text style={styles.variantName}>{item.variant_name}</Text>}
          </TouchableOpacity>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{item.price}</Text>
            {item.mrp && item.mrp > item.price && <Text style={styles.originalPrice}>₹{item.mrp}</Text>}
          </View>

          {/* Quantity Controls */}
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[styles.quantityButton, (item.quantity <= 1 || isUpdating) && styles.disabledButton]}
              onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1 || isUpdating}
            >
              <Ionicons
                name="remove"
                size={16}
                color={item.quantity <= 1 || isUpdating ? colors.text.light : colors.primary}
              />
            </TouchableOpacity>

            <Text style={styles.quantityText}>{item.quantity}</Text>

            <TouchableOpacity
              style={[styles.quantityButton, (item.quantity >= maxQuantity || isUpdating) && styles.disabledButton]}
              onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
              disabled={item.quantity >= maxQuantity || isUpdating}
            >
              <Ionicons
                name="add"
                size={16}
                color={item.quantity >= maxQuantity || isUpdating ? colors.text.light : colors.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Stock Warning */}
          {item.stock < item.quantity && <Text style={styles.stockWarning}>Only {item.stock} items available</Text>}
        </View>

        {/* Remove Button */}
        <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveItem(item.id)}>
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    )
  }

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bag-outline" size={80} color={colors.text.light} />
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptySubtitle}>Add some products to get started</Text>
      <TouchableOpacity style={styles.shopNowButton} onPress={() => navigation.navigate("Home")}>
        <Text style={styles.shopNowText}>Shop Now</Text>
      </TouchableOpacity>
    </View>
  )

  const renderCartSummary = () => {
    const total = getCartTotal()
    const savings = getCartSavings()
    const itemsCount = getCartItemsCount()

    return (
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items ({itemsCount})</Text>
          <Text style={styles.summaryValue}>₹{total + savings}</Text>
        </View>

        {savings > 0 && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.success }]}>Savings</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>-₹{savings}</Text>
          </View>
        )}

        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>₹{total}</Text>
        </View>

        {savings > 0 && <Text style={styles.savingsText}>You will save ₹{savings} on this order</Text>}
      </View>
    )
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <Header navigation={navigation} title="Shopping Cart" showSearch={false} />
        {renderEmptyCart()}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Header navigation={navigation} title="Shopping Cart" showSearch={false} />

      {/* Clear Cart Button */}
      <View style={styles.headerActions}>
        <Text style={styles.itemsCount}>{getCartItemsCount()} items in cart</Text>
        <TouchableOpacity onPress={handleClearCart}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Cart Items */}
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCartItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cartList}
      />

      {/* Cart Summary */}
      {renderCartSummary()}

      {/* Checkout Button */}
      <View style={styles.checkoutContainer}>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.background} />
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

  // Header Actions
  headerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemsCount: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  clearText: {
    fontSize: typography.sizes.md,
    color: colors.error,
    fontWeight: typography.weights.medium,
  },

  // Cart Items
  cartList: {
    paddingBottom: spacing.md,
  },
  cartItem: {
    flexDirection: "row",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  productDetails: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  brandName: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  productName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  variantName: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontStyle: "italic",
    marginBottom: spacing.xs,
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
    marginRight: spacing.sm,
  },
  originalPrice: {
    fontSize: typography.sizes.md,
    color: colors.text.light,
    textDecorationLine: "line-through",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    borderColor: colors.border,
  },
  quantityText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginHorizontal: spacing.md,
    minWidth: 20,
    textAlign: "center",
  },
  stockWarning: {
    fontSize: typography.sizes.sm,
    color: colors.warning,
    marginTop: spacing.xs,
  },
  removeButton: {
    padding: spacing.sm,
  },

  // Empty Cart
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  shopNowButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  shopNowText: {
    color: colors.background,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },

  // Summary
  summaryContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  savingsText: {
    fontSize: typography.sizes.sm,
    color: colors.success,
    textAlign: "center",
    marginTop: spacing.xs,
    fontWeight: typography.weights.medium,
  },

  // Checkout
  checkoutContainer: {
    padding: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  checkoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  checkoutText: {
    color: colors.background,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    marginRight: spacing.sm,
  },
})

export default CartScreen
