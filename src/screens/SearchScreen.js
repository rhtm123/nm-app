import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Keyboard } from "react-native"
import { useState, useEffect, useRef } from "react"
import { useNavigation } from "@react-navigation/native"
import Ionicons from "react-native-vector-icons/Ionicons"
import ProductCard from "../components/ProductCard"
import LoadingSpinner from "../components/LoadingSpinner"
import ErrorMessage from "../components/ErrorMessage"
import { useSearchProducts } from "../hooks/useProducts"
import { searchService } from "../api/services/searchService"
import { colors, spacing, typography } from "../theme"

const SearchScreen = () => {
  const navigation = useNavigation()
  const searchInputRef = useRef(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  const { products, loading, error, searchProducts } = useSearchProducts(searchQuery)

  useEffect(() => {
    // Load recent searches from storage
    loadRecentSearches()
  }, [])

  useEffect(() => {
    // Auto-focus search input
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)
  }, [])

  useEffect(() => {
    // Fetch suggestions when user types
    if (searchQuery.length > 2) {
      fetchSuggestions(searchQuery)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchQuery])

  const loadRecentSearches = async () => {
    try {
      // Load from AsyncStorage - implement this
      setRecentSearches([])
    } catch (error) {
      console.error("Error loading recent searches:", error)
    }
  }

  const saveRecentSearch = async (query) => {
    try {
      // Save to AsyncStorage - implement this
      const updatedSearches = [query, ...recentSearches.filter((item) => item !== query)].slice(0, 10)
      setRecentSearches(updatedSearches)
    } catch (error) {
      console.error("Error saving recent search:", error)
    }
  }

  const fetchSuggestions = async (query) => {
    try {
      setLoadingSuggestions(true)
      const [productsResult, categoriesResult, brandsResult] = await Promise.all([
        searchService.autocompleteProducts(query),
        searchService.autocompleteCategories(query),
        searchService.autocompleteBrands(query),
      ])

      const allSuggestions = []

      if (productsResult.success) {
        productsResult.data.results?.forEach((item) => {
          allSuggestions.push({ type: "product", ...item })
        })
      }

      if (categoriesResult.success) {
        categoriesResult.data.results?.forEach((item) => {
          allSuggestions.push({ type: "category", ...item })
        })
      }

      if (brandsResult.success) {
        brandsResult.data.results?.forEach((item) => {
          allSuggestions.push({ type: "brand", ...item })
        })
      }

      setSuggestions(allSuggestions.slice(0, 10))
      setShowSuggestions(true)
    } catch (error) {
      console.error("Error fetching suggestions:", error)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const handleSearch = (query) => {
    if (!query.trim()) return

    setSearchQuery(query)
    setShowSuggestions(false)
    saveRecentSearch(query)
    Keyboard.dismiss()
  }

  const handleSuggestionPress = (suggestion) => {
    if (suggestion.type === "product") {
      setSearchQuery(suggestion.name)
      handleSearch(suggestion.name)
    } else if (suggestion.type === "category") {
      navigation.navigate("CategoryProducts", { category: suggestion })
    } else if (suggestion.type === "brand") {
      navigation.navigate("BrandProducts", { brand: suggestion })
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSuggestions([])
    setShowSuggestions(false)
    searchInputRef.current?.focus()
  }

  const renderSuggestionItem = ({ item }) => (
    <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSuggestionPress(item)}>
      <Ionicons
        name={item.type === "product" ? "cube-outline" : item.type === "category" ? "grid-outline" : "business-outline"}
        size={20}
        color={colors.text.secondary}
      />
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionText}>{item.name}</Text>
        <Text style={styles.suggestionType}>
          {item.type === "product" ? "Product" : item.type === "category" ? "Category" : "Brand"}
        </Text>
      </View>
      <Ionicons name="arrow-up-outline" size={16} color={colors.text.light} style={styles.suggestionArrow} />
    </TouchableOpacity>
  )

  const renderRecentSearchItem = ({ item }) => (
    <TouchableOpacity style={styles.recentItem} onPress={() => handleSearch(item)}>
      <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
      <Text style={styles.recentText}>{item}</Text>
      <TouchableOpacity
        onPress={() => {
          setRecentSearches(recentSearches.filter((search) => search !== item))
        }}
      >
        <Ionicons name="close" size={16} color={colors.text.light} />
      </TouchableOpacity>
    </TouchableOpacity>
  )

  const renderEmptyState = () => {
    if (searchQuery.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color={colors.text.light} />
          <Text style={styles.emptyTitle}>Search Products</Text>
          <Text style={styles.emptySubtitle}>Find products, categories, and brands</Text>

          {recentSearches.length > 0 && (
            <View style={styles.recentSection}>
              <Text style={styles.recentTitle}>Recent Searches</Text>
              <FlatList
                data={recentSearches}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderRecentSearchItem}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        </View>
      )
    }

    if (products.length === 0 && !loading) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color={colors.text.light} />
          <Text style={styles.emptyTitle}>No Results Found</Text>
          <Text style={styles.emptySubtitle}>Try searching with different keywords</Text>
        </View>
      )
    }

    return null
  }

  const renderProductItem = ({ item }) => (
    <ProductCard
      productListing={item}
      onPress={() => navigation.navigate('ProductDetail', { productListing: item })}
      style={styles.productCard}
    />
  )

  return (
    <View style={styles.container}>
      {/* Remove renderSearchHeader and any custom header usage, as the stack navigator will provide the header. */}

      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          {loadingSuggestions ? (
            <View style={styles.loadingContainer}>
              <LoadingSpinner size="small" />
            </View>
          ) : (
            <FlatList
              data={suggestions}
              keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
              renderItem={renderSuggestionItem}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      )}

      {!showSuggestions && (
        <View style={styles.resultsContainer}>
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage message={error} onRetry={() => searchProducts(searchQuery)} />
          ) : (
            <>
              {searchQuery.length > 0 && products.length > 0 && (
                <Text style={styles.resultsCount}>
                  {products.length} results for "{searchQuery}"
                </Text>
              )}

              <FlatList
                data={products}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderProductItem}
                numColumns={2}
                columnWrapperStyle={styles.productRow}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.productsList}
                ListEmptyComponent={renderEmptyState}
              />
            </>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Search Header
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    marginRight: spacing.md,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.xs,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  cancelText: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },

  // Suggestions
  suggestionsContainer: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    maxHeight: 300,
  },
  loadingContainer: {
    padding: spacing.md,
    alignItems: "center",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  suggestionText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  suggestionType: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textTransform: "capitalize",
  },
  suggestionArrow: {
    transform: [{ rotate: "45deg" }],
  },

  // Recent Searches
  recentSection: {
    marginTop: spacing.lg,
    width: "100%",
  },
  recentTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recentText: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },

  // Results
  resultsContainer: {
    flex: 1,
  },
  resultsCount: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
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
    marginBottom: spacing.lg,
  },
})

export default SearchScreen
