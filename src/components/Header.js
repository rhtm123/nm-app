import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView } from "react-native"
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from "../theme"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"

const Header = ({ navigation, showSearch = true, title = null }) => {
  const { getCartItemsCount } = useCart()
  const { user } = useAuth()
  const cartItemsCount = getCartItemsCount()

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Logo and Title */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>NM</Text>
          <Text style={styles.brandName}>{title || "Naigaon Market"}</Text>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products and services..."
              placeholderTextColor={colors.text.secondary}
              onFocus={() => navigation?.navigate("Search")}
            />
          </View>
        )}

        {/* Right Actions */}
        <View style={styles.rightActions}>
          {/* Sign In/Profile */}
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation?.navigate("Profile")}>
            <Ionicons name={user ? "person" : "person-outline"} size={24} color={colors.primary} />
            <Text style={styles.actionText}>{user ? "Profile" : "Sign In"}</Text>
          </TouchableOpacity>

          {/* Cart */}
          <TouchableOpacity style={styles.cartButton} onPress={() => navigation?.navigate("Cart")}>
            <View style={styles.cartIconContainer}>
              <Ionicons name="bag-outline" size={24} color={colors.primary} />
              {cartItemsCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItemsCount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.actionText}>Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    paddingTop: 40,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.md,
  },
  logo: {
    backgroundColor: colors.primary,
    color: colors.background,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  brandName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    marginHorizontal: spacing.sm,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.xs,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    alignItems: "center",
    marginRight: spacing.md,
  },
  actionText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  cartButton: {
    alignItems: "center",
  },
  cartIconContainer: {
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: colors.background,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
})

export default Header
