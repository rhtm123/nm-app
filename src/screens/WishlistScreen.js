import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import useWishlistStore from '../stores/wishlistStore';
import useAuthStore from '../stores/authStore';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';

const WishlistScreen = () => {
  const navigation = useNavigation();
  const { wishlistItems, isLoading, fetchWishlistItems, removeFromWishlist } = useWishlistStore();
  const { user, isAuthenticated } = useAuthStore();
  const { addToCart, getCartItemQuantity } = useCart();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchWishlistItems();
    }
  }, [isAuthenticated, user]);

  const handleAddToCart = async (productListing) => {
    try {
      const result = await addToCart(productListing);
      if (result.success) {
        // Remove from wishlist after adding to cart
        await removeFromWishlist(productListing.id);
        Alert.alert("Success", "Item added to cart and removed from wishlist");
      } else {
        Alert.alert("Error", result.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert("Error", "Failed to add to cart");
    }
  };

  const handleRemoveFromWishlist = async (productListingId) => {
    Alert.alert(
      "Remove from Wishlist",
      "Are you sure you want to remove this item from your wishlist?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const result = await removeFromWishlist(productListingId);
            if (!result.success) {
              Alert.alert("Error", result.error || "Failed to remove from wishlist");
            }
          }
        }
      ]
    );
  };

  const navigateToProduct = (productListing) => {
    navigation.navigate('ProductDetail', { productId: productListing.id });
  };

  const renderWishlistItem = ({ item }) => {
    const productListing = item.product_listing;
    const cartQuantity = getCartItemQuantity(productListing.id);
    const inStock = productListing.stock > 0;

    const calculateDiscount = () => {
      if (productListing.mrp && productListing.price) {
        const discount = ((productListing.mrp - productListing.price) / productListing.mrp) * 100;
        return Math.round(discount);
      }
      return 0;
    };

    const discount = calculateDiscount();

    return (
      <View className="bg-white mx-4 mb-3 rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <TouchableOpacity
          onPress={() => navigateToProduct(productListing)}
          activeOpacity={0.8}
        >
          <View className="flex-row">
            {/* Product Image */}
            <View className="relative">
              <Image
                source={{
                  uri: productListing.main_image || productListing.thumbnail || "/placeholder.svg?height=120&width=120",
                }}
                className="w-24 h-24"
                resizeMode="cover"
              />
              {discount > 0 && (
                <View className="absolute top-1 left-1 bg-red-500 px-1 py-0.5 rounded">
                  <Text className="text-white text-xs font-bold">{discount}%</Text>
                </View>
              )}
            </View>

            {/* Product Info */}
            <View className="flex-1 p-3">
              {/* Brand */}
              {productListing.brand && (
                <Text className="text-xs text-gray-500 mb-1 uppercase font-medium" numberOfLines={1}>
                  {productListing.brand.name}
                </Text>
              )}

              {/* Product Name */}
              <Text className="text-sm font-medium text-gray-800 mb-1" numberOfLines={2}>
                {productListing.name}
              </Text>

              {/* Variant Name */}
              {productListing.variant_name && (
                <Text className="text-xs text-gray-500 mb-1 italic" numberOfLines={1}>
                  {productListing.variant_name}
                </Text>
              )}

              {/* Price */}
              <View className="flex-row items-center mb-2">
                <Text className="text-lg font-bold text-gray-800 mr-2">₹{productListing.price}</Text>
                {productListing.mrp && productListing.mrp > productListing.price && (
                  <Text className="text-sm text-gray-400 line-through">₹{productListing.mrp}</Text>
                )}
              </View>

              {/* Stock Info */}
              <Text className="text-xs text-gray-500 mb-2">
                {inStock ? `${productListing.stock} in stock` : "Out of stock"}
              </Text>

              {/* Action Buttons */}
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className={`flex-1 flex-row items-center justify-center py-2 rounded ${
                    inStock ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  onPress={() => handleAddToCart(productListing)}
                  disabled={!inStock}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="bag-add-outline"
                    size={14}
                    color={inStock ? "#ffffff" : "#9ca3af"}
                  />
                  <Text className={`text-xs font-medium ml-1 ${
                    inStock ? 'text-white' : 'text-gray-500'
                  }`}>
                    {!inStock ? "Out of Stock" : cartQuantity > 0 ? `In Cart (${cartQuantity})` : "Add to Cart"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-red-50 border border-red-200 px-3 py-2 rounded"
                  onPress={() => handleRemoveFromWishlist(productListing.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="heart" size={14} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (!isAuthenticated || !user) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Ionicons name="heart-outline" size={64} color="#9ca3af" />
        <Text className="text-xl font-bold text-gray-800 mt-4 mb-2">Login Required</Text>
        <Text className="text-gray-600 text-center px-8 mb-6">
          Please login to view and manage your wishlist
        </Text>
        <TouchableOpacity
          className="bg-blue-600 px-6 py-3 rounded-lg"
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold">Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <LoadingSpinner size="large" />
        <Text className="text-gray-600 mt-4">Loading your wishlist...</Text>
      </View>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Ionicons name="heart-outline" size={64} color="#9ca3af" />
        <Text className="text-xl font-bold text-gray-800 mt-4 mb-2">Your Wishlist is Empty</Text>
        <Text className="text-gray-600 text-center px-8 mb-6">
          Add products to your wishlist by tapping the heart icon on any product
        </Text>
        <TouchableOpacity
          className="bg-blue-600 px-6 py-3 rounded-lg"
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold">Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-gray-800">My Wishlist</Text>
          <Text className="text-sm text-gray-600">{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      {/* Wishlist Items */}
      <FlatList
        data={wishlistItems}
        renderItem={renderWishlistItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default WishlistScreen;
