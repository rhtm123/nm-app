import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from "react-native"
import { useState } from "react"
import { useNavigation, useRoute } from "@react-navigation/native"
import Ionicons from "react-native-vector-icons/Ionicons"
import Header from "../components/Header"
import ProductCard from "../components/ProductCard"
import LoadingSpinner from "../components/LoadingSpinner"
import ErrorMessage from "../components/ErrorMessage"
import { useProductsByCategory } from "../hooks/useProducts"
import { colors, spacing, typography } from "../theme"

const CategoryProductsScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { category } = route.params

  const [refreshing, setRefreshing] = useState(false)
  const [sortBy, setSortBy] = useState("popularity")

  const {
    data: productsData,
    loading,
    error,
    refetch,
  } = useProductsByCategory(category.id, {
    ordering: sortBy === "price_low" ? "price" : sortBy === "price_high" ? "-price" : "-popularity",
    page_size: 20,
  })

  const products = productsData?.results || []

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  const sortOptions = [
    { key: "popularity", label: "Popularity" },
    { key: "price_low", label: "Price: Low to High" },
    { key: "price_high", label: "Price: High to Low" },
    { key: "rating", label: "Rating" },
  ]

  const renderSortOption = ({ item }) => (
    <TouchableOpacity
      style={[styles.sortOption, sortBy === item.key && styles.selectedSortOption]}
      onPress={() => setSortBy(item.key)}
    >
      <Text style={[styles.sortOptionText, sortBy === item.key && styles.selectedSortOptionText]}>{item.label}</Text>
    </TouchableOpacity>
  )

  const renderProductItem = ({ item }) => (
    <ProductCard
      productListing={item}
      onPress={() => navigation.navigate('ProductDetail', { productListing: item })}
      style={styles.productCard}
    />
  )

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={64} color={colors.text.light} />
      <Text style={styles.emptyTitle}>No Products Found</Text>
      <Text style={styles.emptySubtitle}>No products available in {category.name} category</Text>
    </View>
  )

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Category Info */}
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{category.name}</Text>
        {category.description && <Text style={styles.categoryDescription}>{category.description}</Text>}
        <Text style={styles.productsCount}>
          {products.length} {products.length === 1 ? "product" : "products"} found
        </Text>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <FlatList
          data={sortOptions}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          renderItem={renderSortOption}
          contentContainerStyle={styles.sortList}
        />
      </View>
    </View>
  )

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <Header navigation={navigation} title={category.name} showSearch={false} />
        <LoadingSpinner />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header navigation={navigation} title={category.name} showSearch={false} />
        <ErrorMessage message={error} onRetry={refetch} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Header navigation={navigation} title={category.name} showSearch={false} />

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductItem}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  headerContainer: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryHeader: {
    padding: spacing.md,
  },
  categoryTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  categoryDescription: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  productsCount: {
    fontSize: typography.sizes.sm,
    color: colors.text.light,
    fontWeight: typography.weights.medium,
  },

  // Sort
  sortContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  sortLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  sortList: {
    paddingRight: spacing.md,
  },
  sortOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  selectedSortOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortOptionText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  selectedSortOptionText: {
    color: colors.background,
  },

  // Products
  productsList: {
    padding: spacing.md,
  },
  productRow: {
    justifyContent: "space-between",
  },
  productCard: {
    marginBottom: spacing.md,
  },

  // Empty State
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
  },
})

export default CategoryProductsScreen
