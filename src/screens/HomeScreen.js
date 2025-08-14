import React, { useState } from "react"
import { View, Text, ScrollView, FlatList, TouchableOpacity, RefreshControl, Image, Dimensions } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Ionicons from "react-native-vector-icons/Ionicons"
import ProductCard from "../components/ProductCard"
import LoadingSpinner from "../components/LoadingSpinner"
import ErrorMessage from "../components/ErrorMessage"
import HeroCarousel from "../components/HeroCarousel"
import { useProductListings, useCategories, useFeaturedProducts } from "../hooks/useProducts"
import Header from '../components/Header';
import { useCart } from '../context/CartContext';
import DeepLinkHandler from '../components/DeepLinkHandler';
import { colors } from '../theme';


const { width } = Dimensions.get("window")


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



const HomeScreen = () => {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
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
      backgroundColor: colors.success,
      icon: "flower"
    },
    {
      id: 2,
      title: "MEGA SALE",
      subtitle: "Up to 50% off",
      backgroundColor: colors.error,
      icon: "flash"
    }
  ];

  const quickCategories = [
    { name: "Deals", icon: "pricetag", backgroundColor: colors.error },
    { name: "Flash", icon: "flash", backgroundColor: colors.warning },
    { name: "Moments", icon: "heart", backgroundColor: "#ec4899" },
    { name: "Beauty", icon: "sparkles", backgroundColor: "#8b5cf6" },
    { name: "Moms", icon: "people", backgroundColor: colors.primary },
    { name: "Gifts", icon: "gift", backgroundColor: colors.success }
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
    <View style={{ backgroundColor: colors.backgroundSecondary }} className="flex-1">
      <DeepLinkHandler />
      <Header title="Naigaon Market" navigation={navigation} showSearch={true} />
      
      {/* Search Bar and Location */}
      <View style={{ backgroundColor: colors.surface }} className="px-4 py-3 shadow-sm">
        <TouchableOpacity 
          style={{ backgroundColor: colors.infoLight, borderColor: colors.info }}
          className="flex-row items-center rounded-xl px-4 py-3 mb-3 border"
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search" size={20} color={colors.primary} />
          <Text style={{ color: colors.primary }} className="ml-3 flex-1">Search "milk" "bread" "eggs"</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity className="flex-row items-center">
          <Ionicons name="location" size={18} color={colors.success} />
          <View className="flex-1 ml-2">
            <Text style={{ color: colors.text.primary }} className="text-sm font-semibold">Deliver to Home</Text>
            <Text style={{ color: colors.text.secondary }} className="text-xs">• Naigaon, Maharashtra 401208</Text>
          </View>
          <Ionicons name="chevron-down" size={16} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 16, 32) }}
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
                <View 
                  style={{ backgroundColor: item.backgroundColor }}
                  className="w-12 h-12 rounded-xl items-center justify-center mb-2"
                >
                  <Ionicons name={item.icon} size={20} color={colors.text.white} />
                </View>
                <Text style={{ color: colors.text.primary }} className="text-xs font-semibold">{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Hero Carousel */}
        {featuredProducts && featuredProducts.length > 0 && (
          <View className="mb-6">
            <Text style={{ color: colors.text.primary }} className="text-xl font-bold px-4 mb-4">Featured Products</Text>
            <HeroCarousel 
              products={featuredProducts} 
              onProductPress={(item) => navigation.navigate('ProductDetail', { productListing: item })} 
            />
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
                style={{ backgroundColor: item.backgroundColor }}
                className="w-72 h-32 rounded-2xl mr-4 p-4 justify-between"
              >
                <View>
                  <Text style={{ color: colors.text.white }} className="text-xl font-bold mb-1">{item.title}</Text>
                  <Text style={{ color: colors.text.white }} className="text-base">{item.subtitle}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <TouchableOpacity style={{ backgroundColor: colors.surface }} className="px-4 py-2 rounded-full">
                    <Text style={{ color: colors.text.primary }} className="font-bold">Shop Now</Text>
                  </TouchableOpacity>
                  <Ionicons name={item.icon} size={32} color={colors.text.white} />
                </View>
              </TouchableOpacity>
            )}
      />
    </View>

        {/* Main Categories */}
        {categories && categories.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between px-4 mb-4">
              <Text style={{ color: colors.text.primary }} className="text-xl font-bold">Categories</Text>
          <TouchableOpacity>
                <Text style={{ color: colors.primary }} className="font-semibold">See All</Text>
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
              <Text style={{ color: colors.text.primary }} className="text-xl font-bold">Previously Bought</Text>
              <TouchableOpacity>
                <Text style={{ color: colors.primary }} className="font-semibold">See All</Text>
              </TouchableOpacity>
            </View>
      <FlatList
              data={products.slice(0, 6)}
        horizontal
        showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <View style={{ width: 180 }}><ProductCard productListing={item} onPress={() => navigation.navigate('ProductDetail', { productListing: item })} className="mr-3" /></View>}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            />
          </View>
        )}

        {/* Mega Sale Banner */}
        <View className="mx-4 mb-6">
          <View style={{ backgroundColor: colors.primary }} className="rounded-2xl p-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white text-2xl font-bold mb-2">MEGA CLEANING SALE</Text>
                <Text className="text-white text-lg mb-4">Powered by top brands</Text>
                <TouchableOpacity style={{ backgroundColor: colors.surface }} className="px-6 py-3 rounded-full self-start">
                  <Text style={{ color: colors.primary }} className="font-bold">Shop Now</Text>
        </TouchableOpacity>
      </View>
              <View style={{ backgroundColor: colors.surface }} className="w-20 h-20 rounded-full items-center justify-center">
                <Ionicons name="sparkles" size={32} color={colors.primary} />
    </View>
            </View>
          </View>
        </View>

        {/* Category Grid */}
        {categories && categories.length > 0 && (
          <View className="mb-6">
            <Text style={{ color: colors.text.primary }} className="text-xl font-bold px-4 mb-4">Shop by Category</Text>
            <View className="px-4">
              <View className="flex-row flex-wrap justify-between">
                {categories.slice(0, 8).map((category, index) => (
                  <TouchableOpacity 
                    key={category.id}
                    onPress={() => navigation.navigate('CategoryProducts', { category })}
                    style={{ backgroundColor: colors.surface, borderColor: colors.border.primary }}
                    className="w-[48%] rounded-2xl p-4 mb-4 shadow-lg border"
                  >
                    <View style={{ backgroundColor: colors.infoLight }} className="w-12 h-12 rounded-xl items-center justify-center mb-3">
                      {category.image ? (
                        <Image 
                          source={{ uri: category.image }} 
                          className="w-8 h-8 rounded-lg"
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={{ backgroundColor: colors.primary }} className="w-8 h-8 rounded-lg items-center justify-center">
                          <Ionicons name="cube" size={16} color={colors.text.white} />
        </View>
                      )}
      </View>
                    <Text style={{ color: colors.text.primary }} className="text-sm font-semibold" numberOfLines={2}>
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
            <Text style={{ color: colors.text.primary }} className="text-xl font-bold px-4 mb-4">Trending Now</Text>
        <FlatList
          data={products.slice(0, 6)}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <View style={{ width: 180 }}><ProductCard productListing={item} onPress={() => navigation.navigate('ProductDetail', { productListing: item })} className="mr-3" /></View>}
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
