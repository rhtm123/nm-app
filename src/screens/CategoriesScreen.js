import { View, Text, FlatList, TouchableOpacity, RefreshControl, Animated } from "react-native"
import { useState, useMemo } from "react"
import { useNavigation } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Ionicons from "react-native-vector-icons/Ionicons"
import CategoryHeader from "../components/CategoryHeader"
import CategoryCard from "../components/CategoryCard"
import CategorySearch from "../components/CategorySearch"
import ViewToggle from "../components/ViewToggle"
import LoadingSpinner from "../components/LoadingSpinner"
import ErrorMessage from "../components/ErrorMessage"
import { useCategories } from "../hooks/useProducts"
import { colors } from "../theme"

const CategoriesScreen = () => {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const [refreshing, setRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'grid'
  const [searchQuery, setSearchQuery] = useState('')
  const scrollY = new Animated.Value(0)

  const { data: categoriesData, loading, error, refetch } = useCategories({ page_size: 50 })

  const categories = categoriesData?.results || []

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories
    return categories.filter(category => 
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [categories, searchQuery])

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  const handleCategoryPress = (category) => {
    navigation.navigate('CategoryProducts', { category })
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  const handleViewChange = (newViewMode) => {
    setViewMode(newViewMode)
  }

  const renderCategoryItem = ({ item, index }) => {
    return (
      <CategoryCard
        item={item}
        onPress={handleCategoryPress}
        variant={viewMode}
        showProductCount={false}
      />
    )
  }

  const renderEmptyState = () => {
    const isSearching = searchQuery.trim().length > 0
    return (
      <View className="flex-1 justify-center items-center p-8 mt-20">
        <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
          <Ionicons 
            name={isSearching ? "search-outline" : "grid-outline"} 
            size={40} 
            color={colors.gray[400]} 
          />
        </View>
        <Text className="text-xl font-bold text-gray-800 mb-2">
          {isSearching ? 'No Results Found' : 'No Categories Available'}
        </Text>
        <Text className="text-gray-600 text-center leading-6">
          {isSearching 
            ? `No categories match "${searchQuery}"\nTry a different search term`
            : 'Categories will appear here when available'}
        </Text>
        {isSearching && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            className="mt-4 bg-blue-50 px-6 py-3 rounded-2xl"
          >
            <Text className="text-blue-600 font-semibold">Clear Search</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  if (loading && !refreshing) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.backgroundSecondary }}>
        <CategoryHeader navigation={navigation} title="Categories" totalCount={0} />
        <LoadingSpinner />
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.backgroundSecondary }}>
        <CategoryHeader navigation={navigation} title="Categories" totalCount={0} />
        <ErrorMessage message={error} onRetry={refetch} />
      </View>
    )
  }

  const numColumns = viewMode === 'grid' ? 2 : 1
  const key = `${viewMode}-${numColumns}`

  return (
    <View className="flex-1 bg-white">
      <CategoryHeader 
        navigation={navigation} 
        title="Categories" 
        totalCount={categories.length}
      />
      
      {/* Search and Controls */}
      <View className="bg-white">
        <CategorySearch 
          onSearch={handleSearch} 
          showViewToggle={true}
          currentView={viewMode}
          onViewChange={handleViewChange}
        />
      </View>

      {/* Categories List/Grid */}
      <View className="flex-1" style={{ backgroundColor: colors.gray[50] }}>
        <Animated.FlatList
          key={key}
          data={filteredCategories}
          keyExtractor={(item) => `${viewMode}-${item.id}`}
          renderItem={renderCategoryItem}
          numColumns={numColumns}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingTop: 16,
            paddingHorizontal: viewMode === 'grid' ? 16 : 0,
            paddingBottom: Math.max(insets.bottom + 80, 100), // Increased padding for bottom tab bar
            ...(filteredCategories.length === 0 && { flexGrow: 1 })
          }}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        />
      </View>
    </View>
  )
}

export default CategoriesScreen
