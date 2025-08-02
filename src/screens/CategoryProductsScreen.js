import { View, Text, FlatList, TouchableOpacity, RefreshControl, Image } from "react-native"
import { useState } from "react"
import { useNavigation, useRoute } from "@react-navigation/native"
import Ionicons from "react-native-vector-icons/Ionicons"
import Header from "../components/Header"
import { useCart } from "../context/CartContext"
import LoadingSpinner from "../components/LoadingSpinner"
import ErrorMessage from "../components/ErrorMessage"
import { useProductsByCategory } from "../hooks/useProducts"
import { colors, spacing, typography } from "../theme"

const ProductCard = ({ productListing, onPress }) => {
  const { addToCart, getCartItemQuantity } = useCart();
  const cartQuantity = getCartItemQuantity(productListing.id);
  const discount = productListing.mrp && productListing.price
    ? Math.round(((productListing.mrp - productListing.price) / productListing.mrp) * 100)
    : 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 m-2 flex-1 min-w-[46%] max-w-[48%] overflow-hidden"
      activeOpacity={0.9}
      style={{ flexBasis: "48%" }}
    >
      {/* Discount Badge */}
      {discount > 0 && (
        <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-md z-10">
          <Text className="text-white text-xs font-bold">{discount}% OFF</Text>
        </View>
      )}
      {/* Product Image */}
      <View className="w-full h-32 bg-gray-50 items-center justify-center">
        {productListing.main_image || productListing.thumbnail ? (
          <Image
            source={{ uri: productListing.main_image || productListing.thumbnail }}
            className="w-20 h-28"
            resizeMode="contain"
          />
        ) : (
          <View className="w-20 h-28 bg-gray-200 items-center justify-center">
            <Ionicons name="image-outline" size={32} color="#9ca3af" />
          </View>
        )}
      </View>
      {/* Product Info */}
      <View className="p-3">
        <Text className="text-xs font-bold text-gray-500 uppercase mb-1" numberOfLines={1}>
          {productListing.brand?.name}
        </Text>
        <Text className="text-sm font-semibold text-gray-900 mb-1" numberOfLines={2}>
          {productListing.name}
        </Text>
        {productListing.variant_name && (
          <Text className="text-xs text-gray-500 mb-1 italic">{productListing.variant_name}</Text>
        )}
        {/* Rating */}
        {productListing.rating > 0 && (
          <View className="flex-row items-center mb-1">
            <View className="flex-row mr-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= productListing.rating ? "star" : "star-outline"}
                  size={10}
                  color="#f59e0b"
                />
              ))}
            </View>
            <Text className="text-xs text-gray-500">({productListing.rating})</Text>
            {productListing.review_count > 0 && (
              <Text className="text-xs text-gray-400 ml-1">{productListing.review_count} reviews</Text>
            )}
          </View>
        )}
        {/* Price */}
        <View className="flex-row items-center mb-1">
          <Text className="text-lg font-bold text-gray-900 mr-2">₹{productListing.price}</Text>
          {productListing.mrp && productListing.mrp > productListing.price && (
            <Text className="text-sm text-gray-400 line-through">₹{productListing.mrp}</Text>
          )}
        </View>
        {/* Stock Info */}
        <Text className="text-xs text-gray-500 mb-2">
          {productListing.stock > 0 ? `${productListing.stock} in stock` : "Out of stock"}
        </Text>
        {/* Add to Cart Button */}
        <TouchableOpacity
          className={`flex-row items-center justify-center py-2 rounded-lg ${productListing.stock > 0 ? 'bg-blue-600' : 'bg-gray-300'}`}
          onPress={() => addToCart(productListing)}
          disabled={productListing.stock <= 0}
          activeOpacity={0.8}
        >
          <Ionicons name="bag-add-outline" size={16} color={productListing.stock > 0 ? "#fff" : "#9ca3af"} />
          <Text className={`text-sm font-medium ml-1 ${productListing.stock > 0 ? 'text-white' : 'text-gray-500'}`}>
            {cartQuantity > 0 ? `In Cart (${cartQuantity})` : "Add to Cart"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

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