import { View, Text, FlatList, TouchableOpacity, RefreshControl, Image } from "react-native"
import { useState } from "react"
import { useNavigation, useRoute } from "@react-navigation/native"
import Ionicons from "react-native-vector-icons/Ionicons"
import Header from "../components/Header"
import ProductCard from "../components/ProductCard"
import { useCart } from "../context/CartContext"
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
      className={`px-4 py-2 rounded-full border ${sortBy === item.key ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'} mr-2`}
      onPress={() => setSortBy(item.key)}
      activeOpacity={0.8}
    >
      <Text className={`text-sm font-semibold ${sortBy === item.key ? 'text-white' : 'text-gray-700'}`}>{item.label}</Text>
    </TouchableOpacity>
  )

  const renderProductItem = ({ item }) => (
    <ProductCard
      productListing={item}
      onPress={() => navigation.navigate('ProductDetail', { productListing: item })}
    />
  )

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center p-8">
      <Ionicons name="cube-outline" size={64} color="#9ca3af" />
      <Text className="text-xl font-bold text-gray-800 mt-4 mb-2">No Products Found</Text>
      <Text className="text-gray-600 text-center">No products available in {category.name} category</Text>
    </View>
  )

  const renderHeader = () => (
    <View className="bg-white px-4 pt-2 pb-2 border-b border-gray-100 mb-2">
      <View className="flex-row items-center mb-2">
        {/* <Image
          source={require('../../assets/img/logo.png')}
          className="w-8 h-8 mr-2"
          resizeMode="contain"
        /> */}
        <Text className="text-2xl font-bold text-gray-900">{category.name}</Text>
      </View>
      <View className="flex-row items-center mb-2">
        <Text className="text-gray-500 text-sm">{products.length} {products.length === 1 ? "product" : "products"} found</Text>
      </View>
      <View className="flex-row items-center mt-2">
        <Text className="text-base font-semibold text-gray-800 mr-2">Sort by:</Text>
        <FlatList
          data={sortOptions}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          renderItem={renderSortOption}
        />
      </View>
    </View>
  )

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-gray-50">
        {/* <Header navigation={navigation} title={category.name} showSearch={false} /> */}
        <LoadingSpinner />
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50">
        {/* <Header navigation={navigation} title={category.name} showSearch={false} /> */}
        <ErrorMessage message={error} onRetry={refetch} />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* <Header navigation={navigation} title="Naigaon Market" showSearch={false} /> */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 12, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  )
}

export default CategoryProductsScreen