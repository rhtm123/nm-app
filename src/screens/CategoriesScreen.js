import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl } from "react-native"
import { useState } from "react"
import { useNavigation } from "@react-navigation/native"
import Ionicons from "react-native-vector-icons/Ionicons"
import Header from "../components/Header"
import LoadingSpinner from "../components/LoadingSpinner"
import ErrorMessage from "../components/ErrorMessage"
import { useCategories } from "../hooks/useProducts"
import { colors, spacing, typography } from "../theme"

const CategoriesScreen = () => {
  const navigation = useNavigation()
  const [refreshing, setRefreshing] = useState(false)

  const { data: categoriesData, loading, error, refetch } = useCategories({ page_size: 50 })

  const categories = categoriesData?.results || []

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  const handleCategoryPress = (category) => {
    navigation.navigate('CategoryProducts', { category })
  }

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity style={styles.categoryCard} onPress={() => handleCategoryPress(item)} activeOpacity={0.8}>
      <View style={styles.categoryImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.categoryImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="grid-outline" size={32} color={colors.text.light} />
          </View>
        )}
      </View>

      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName} numberOfLines={2}>
          {item.name}
        </Text>

        {item.description && (
          <Text style={styles.categoryDescription} numberOfLines={3}>
            {item.description}
          </Text>
        )}

        <View style={styles.categoryMeta}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Level {item.level}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.text.light} />
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="grid-outline" size={64} color={colors.text.light} />
      <Text style={styles.emptyTitle}>No Categories Found</Text>
      <Text style={styles.emptySubtitle}>Categories will appear here when available</Text>
    </View>
  )

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <Header navigation={navigation} title="Categories" />
        <LoadingSpinner />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header navigation={navigation} title="Categories" />
        <ErrorMessage message={error} onRetry={refetch} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Header navigation={navigation} title="Categories" />

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCategoryItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
  categoriesList: {
    padding: spacing.md,
  },
  categoryCard: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: spacing.md,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryImageContainer: {
    marginRight: spacing.md,
  },
  categoryImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  categoryName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    lineHeight: 24,
  },
  categoryDescription: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  categoryMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  levelBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  levelText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
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

export default CategoriesScreen
