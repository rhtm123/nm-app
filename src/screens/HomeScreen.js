import { View, Text, ScrollView, FlatList, TouchableOpacity, RefreshControl, Image, Dimensions } from "react-native"
import { useState } from "react"
import { useNavigation } from "@react-navigation/native"
import Ionicons from "react-native-vector-icons/Ionicons"
import ProductCard from "../components/ProductCard"
import LoadingSpinner from "../components/LoadingSpinner"
import ErrorMessage from "../components/ErrorMessage"
import { useProductListings, useCategories, useFeaturedProducts } from "../hooks/useProducts"
import Header from '../components/Header';
import { useCart } from '../context/CartContext'; // Add this import at the top
import DeepLinkHandler from '../components/DeepLinkHandler';


const { width } = Dimensions.get("window")

// Simple Product Card for Home Screen
const HomeProductCard = ({ item, navigation }) => {
  const { addToCart, getCartItemQuantity } = useCart();
  const cartQuantity = getCartItemQuantity(item.id);

  const calculateDiscount = () => {
    if (item.mrp && item.price) {
      const discount = ((item.mrp - item.price) / item.mrp) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  const discount = calculateDiscount();

  return (
    <View className="w-44 mr-5">
      <TouchableOpacity 
        onPress={() => navigation.navigate('ProductDetail', { productListing: item })} 
        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
      >
        {/* Product Image Container */}
        <View className="relative h-48 bg-gray-100">
          {item.main_image || item.thumbnail ? (
      <Image
              source={{ uri: item.main_image || item.thumbnail }}
              className="w-full h-full"
        resizeMode="cover"
      />
          ) : (
            <View className="w-full h-full bg-gray-200 items-center justify-center">
              <Ionicons name="image-outline" size={48} color="#9ca3af" />
            </View>
          )}
          
          {/* Discount Badge */}
          {discount > 0 && (
            <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-md">
              <Text className="text-white text-xs font-bold">{discount}% OFF</Text>
            </View>
          )}

          {/* Brand Badge */}
          {item.brand && (
            <View className="absolute top-2 right-2 bg-black px-2 py-1 rounded-md">
              <Text className="text-white text-xs font-semibold">{item.brand.name}</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View className="p-3">
          {/* Product Name */}
          <Text className="text-sm font-semibold text-gray-900 mb-1" numberOfLines={2}>
            {item.name || "Product Name"}
          </Text>

          {/* Variant */}
          {item.variant_name && (
            <Text className="text-xs text-gray-500 mb-2">{item.variant_name}</Text>
          )}

          {/* Rating */}
          {item.rating > 0 && (
            <View className="flex-row items-center mb-2">
              <View className="flex-row mr-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= item.rating ? "star" : "star-outline"}
                    size={12}
                    color="#f59e0b"
                  />
                ))}
              </View>
              <Text className="text-xs text-gray-600">({item.rating})</Text>
            </View>
          )}

          {/* Price */}
          <View className="flex-row items-center mb-2">
            <Text className="text-lg font-bold text-gray-900 mr-2">₹{item.price || 0}</Text>
            {item.mrp && item.mrp > item.price && (
              <Text className="text-sm text-gray-400 line-through">₹{item.mrp}</Text>
            )}
          </View>

          {/* Stock Info */}
          <Text className="text-xs text-gray-500 mb-3">
            {item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}
          </Text>

          {/* Add Button */}
          <TouchableOpacity
            className={`bg-blue-600 py-2 rounded-lg items-center ${item.stock <= 0 ? 'opacity-50' : ''}`}
            disabled={item.stock <= 0}
            onPress={() => addToCart(item)}
          >
            <Text className="text-white font-bold text-sm">
              {cartQuantity > 0 ? `In Cart (${cartQuantity})` : 'ADD TO CART'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

// Simple Category Card
const HomeCategoryCard = ({ item, navigation }) => {
  return (
    <TouchableOpacity 
      onPress={() => navigation.navigate('CategoryProducts', { category: item })} 
      className="w-20 items-center mr-6"
    >
      <View className="w-16 h-16 bg-blue-100 rounded-2xl items-center justify-center mb-2 border border-blue-200">
        {item.image ? (
          <Image 
            source={{ uri: item.image }} 
            className="w-10 h-10 rounded-lg"
            resizeMode="cover"
          />
        ) : (
          <View className="w-10 h-10 bg-blue-500 rounded-lg items-center justify-center">
            <Ionicons name="cube" size={20} color="white" />
          </View>
        )}
      </View>
      <Text className="text-xs font-semibold text-gray-800 text-center" numberOfLines={2}>
        {item.name}
      </Text>
  </TouchableOpacity>
  );
};

// Simple Hero Carousel
const HeroCarousel = ({ featuredProducts, navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const renderHeroItem = ({ item }) => (
    <View style={{ width }} className="px-4">
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetail', { productListing: item })}
        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden items-center"
        activeOpacity={0.95}
      >
        {/* Product Image */}
        <View className="w-full items-center pt-6 pb-2 bg-white">
          {item.main_image || item.thumbnail ? (
            <Image
              source={{ uri: item.main_image || item.thumbnail }}
              className="w-32 h-32"
              resizeMode="contain"
            />
          ) : (
            <View className="w-32 h-32 bg-gray-200 items-center justify-center">
              <Ionicons name="image-outline" size={48} color="#9ca3af" />
            </View>
          )}
        </View>
        {/* Product Info */}
        <View className="p-4 w-full items-center bg-blue-600 ">
          <Text className="text-lg font-bold text-white mb-1 text-center">{item.name}</Text>
          <Text className="text-xs text-gray-200 mb-2 text-center">{item.brand?.name}</Text>
          <View className="flex-row items-center justify-center mb-2">
            <Text className="text-xl font-bold text-green-300 mr-2">₹{item.price}</Text>
            {item.mrp && item.mrp > item.price && (
              <Text className="text-sm text-gray-400 line-through">₹{item.mrp}</Text>
            )}
          </View>
          <TouchableOpacity className="bg-white px-6 py-2 rounded-full mt-2" activeOpacity={0.8}>
            <Text className="text-blue-800 font-bold">Shop Now</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderDots = () => (
    <View className="flex-row justify-center items-center mt-4">
      {featuredProducts.map((_, index) => (
        <View
          key={index}
          className={`h-2 rounded-full mx-1 ${
            index === currentIndex ? 'bg-blue-600 w-6' : 'bg-gray-300 w-2'
          }`}
        />
      ))}
    </View>
  );

  return (
    <View className="mb-6">
      <FlatList
        data={featuredProducts}
        renderItem={renderHeroItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />
      {renderDots()}
    </View>
  );
};


const HomeScreen = () => {
  const navigation = useNavigation()
  const [refreshing, setRefreshing] = useState(false)

  // Fetch data using custom hooks
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useProductListings({ page_size: 20 })
  
  const {
    data: categoriesData,
    loading: categoriesLoading,
    refetch: refetchCategories,
  } = useCategories({ page_size: 10 })
  
  const { featuredProducts, loading: featuredLoading, error: featuredError } = useFeaturedProducts()

  const products = productsData?.results || []
  const categories = categoriesData?.results || []

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([refetchProducts(), refetchCategories()])
    setRefreshing(false)
  }

  // Promotional Banners Data
  const promotionalBanners = [
    {
      id: 1,
      title: "Hariyali Teej",
      subtitle: "Celebrate with us",
      color: "bg-green-500",
      icon: "flower"
    },
    {
      id: 2,
      title: "MEGA SALE",
      subtitle: "Up to 50% off",
      color: "bg-red-500",
      icon: "flash"
    }
  ];

  const quickCategories = [
    { name: "Deals", icon: "pricetag", color: "bg-red-500" },
    { name: "Flash", icon: "flash", color: "bg-yellow-500" },
    { name: "Moments", icon: "heart", color: "bg-pink-500" },
    { name: "Beauty", icon: "sparkles", color: "bg-purple-500" },
    { name: "Moms", icon: "people", color: "bg-blue-500" },
    { name: "Gifts", icon: "gift", color: "bg-green-500" }
  ];

  if (productsLoading || categoriesLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <Header title="Naigaon Market" navigation={navigation} />
        <LoadingSpinner />
      </View>
    )
  }

  if (productsError || featuredError) {
    return (
      <View className="flex-1 bg-gray-50">
        <Header title="Naigaon Market" navigation={navigation} />
        <ErrorMessage message={productsError || featuredError} onRetry={onRefresh} />
    </View>
  )
  }

  return (
    <View className="flex-1 bg-gray-50">
      <DeepLinkHandler />
      <Header title="Naigaon Market" navigation={navigation} />
      
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Quick Categories */}
        <View className="px-4 py-6">
      <FlatList
            data={quickCategories}
        horizontal
        showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
              <TouchableOpacity className="items-center mr-6">
                <View className={`w-12 h-12 ${item.color} rounded-xl items-center justify-center mb-2`}>
                  <Ionicons name={item.icon} size={20} color="white" />
                </View>
                <Text className="text-xs font-semibold text-gray-800">{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Hero Carousel */}
        {featuredProducts && featuredProducts.length > 0 && (
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-900 px-4 mb-4">Featured Products</Text>
            <HeroCarousel featuredProducts={featuredProducts} navigation={navigation} />
          </View>
        )}

        {/* Promotional Banners */}
        <View className="px-4 mb-6">
          <FlatList
            data={promotionalBanners}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                className={`w-72 h-32 rounded-2xl mr-4 p-4 justify-between ${item.color}`}
              >
                <View>
                  <Text className="text-white text-xl font-bold mb-1">{item.title}</Text>
                  <Text className="text-white text-base">{item.subtitle}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <TouchableOpacity className="bg-white px-4 py-2 rounded-full">
                    <Text className="text-gray-800 font-bold">Shop Now</Text>
                  </TouchableOpacity>
                  <Ionicons name={item.icon} size={32} color="white" />
                </View>
              </TouchableOpacity>
            )}
      />
    </View>

        {/* Main Categories */}
        {categories && categories.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between px-4 mb-4">
              <Text className="text-xl font-bold text-gray-900">Categories</Text>
          <TouchableOpacity>
                <Text className="text-blue-600 font-semibold">See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
              data={categories.slice(0, 8)}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <HomeCategoryCard item={item} navigation={navigation} />}
              contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>
        )}

        {/* Debug Section - Show Product Data */}
        {/* <View className="px-4 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">Debug - Product Data</Text>
          <View className="bg-white p-4 rounded-lg border border-gray-200">
            <Text className="text-sm text-gray-700 mb-2">Products loaded: {products.length}</Text>
            {products.slice(0, 2).map((product, index) => (
              <View key={product.id} className="mb-3 p-3 bg-gray-50 rounded">
                <Text className="text-sm font-semibold text-gray-900">{product.name}</Text>
                <Text className="text-xs text-gray-600">Price: ₹{product.price}</Text>
                <Text className="text-xs text-gray-600">Brand: {product.brand?.name}</Text>
                <Text className="text-xs text-gray-600">Image: {product.main_image ? 'Yes' : 'No'}</Text>
              </View>
            ))}
          </View>
        </View> */}

        {/* Previously Bought */}
        {products && products.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between px-4 mb-4">
              <Text className="text-xl font-bold text-gray-900">Previously Bought</Text>
              <TouchableOpacity>
                <Text className="text-blue-600 font-semibold">See All</Text>
              </TouchableOpacity>
            </View>
      <FlatList
              data={products.slice(0, 6)}
        horizontal
        showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <HomeProductCard item={item} navigation={navigation} />}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            />
          </View>
        )}

        {/* Mega Sale Banner */}
        <View className="mx-4 mb-6">
          <View className="bg-blue-600 rounded-2xl p-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white text-2xl font-bold mb-2">MEGA CLEANING SALE</Text>
                <Text className="text-white text-lg mb-4">Powered by top brands</Text>
                <TouchableOpacity className="bg-white px-6 py-3 rounded-full self-start">
                  <Text className="text-blue-600 font-bold">Shop Now</Text>
        </TouchableOpacity>
      </View>
              <View className="w-20 h-20 bg-white rounded-full items-center justify-center">
                <Ionicons name="sparkles" size={32} color="#2563eb" />
    </View>
            </View>
          </View>
        </View>

        {/* Category Grid */}
        {categories && categories.length > 0 && (
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-900 px-4 mb-4">Shop by Category</Text>
            <View className="px-4">
              <View className="flex-row flex-wrap justify-between">
                {categories.slice(0, 8).map((category, index) => (
                  <TouchableOpacity 
                    key={category.id}
                    onPress={() => navigation.navigate('CategoryProducts', { category })}
                    className="w-[48%] bg-white rounded-2xl p-4 mb-4 shadow-lg border border-gray-200"
                  >
                    <View className="w-12 h-12 bg-blue-100 rounded-xl items-center justify-center mb-3">
                      {category.image ? (
                        <Image 
                          source={{ uri: category.image }} 
                          className="w-8 h-8 rounded-lg"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-8 h-8 bg-blue-500 rounded-lg items-center justify-center">
                          <Ionicons name="cube" size={16} color="white" />
        </View>
                      )}
      </View>
                    <Text className="text-sm font-semibold text-gray-900" numberOfLines={2}>
                      {category.name}
                    </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
          </View>
        )}

        {/* More Products */}
        {products && products.length > 0 && (
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-900 px-4 mb-4">Trending Now</Text>
        <FlatList
          data={products.slice(0, 6)}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <HomeProductCard item={item} navigation={navigation} />}
              contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>
        )}

        {/* Bottom Spacing */}
        <View className="h-20" />
      </ScrollView>
    </View>
  )
}

export default HomeScreen
