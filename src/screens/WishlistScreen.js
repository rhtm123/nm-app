import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useWishlistStore from '../stores/wishlistStore';
import useAuthStore from '../stores/authStore';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductCard from '../components/ProductCard';
import { colors } from '../theme';

const WishlistScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { wishlistItems, isLoading, fetchWishlistItems, removeFromWishlist, clearAllWishlistItems } = useWishlistStore();
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
    const result = await removeFromWishlist(productListingId);
    if (!result.success) {
      Alert.alert("Error", result.error || "Failed to remove from wishlist");
    }
  };

  const handleClearAllWishlist = () => {
    Alert.alert(
      "Clear All Wishlist",
      "Are you sure you want to remove all items from your wishlist? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            const result = await clearAllWishlistItems();
            if (result.success) {
              Alert.alert("Success", "All items removed from wishlist");
            } else {
              Alert.alert("Error", result.error || "Failed to clear wishlist");
            }
          }
        }
      ]
    );
  };

  const navigateToProduct = (productListing) => {
    navigation.navigate('ProductDetail', { productListing: productListing });
  };

  const renderWishlistItem = ({ item }) => {
    const productListing = item.product_listing;
    
    return (
      <View className="flex-1 mx-1 mb-3">
        <ProductCard 
          productListing={productListing}
          onPress={() => navigateToProduct(productListing)}
          onRemove={handleRemoveFromWishlist}
          isWishlistView={true}
          className=""
        />
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
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-lg font-bold text-gray-800">My Wishlist</Text>
          <Text className="text-sm text-gray-600">{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}</Text>
        </View>
        {/* Clear All Button */}
        {wishlistItems.length > 0 && (
          <TouchableOpacity
            style={{ backgroundColor: colors.error }}
            className="flex-row items-center justify-center py-2 px-4 rounded-lg self-end"
            onPress={handleClearAllWishlist}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={16} color="white" />
            <Text className="text-white font-semibold ml-2 text-sm">Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Wishlist Items */}
      <FlatList
        data={wishlistItems}
        renderItem={renderWishlistItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={{ 
          paddingVertical: 16, 
          paddingHorizontal: 8,
          paddingBottom: Math.max(insets.bottom + 16, 32)
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default WishlistScreen;
