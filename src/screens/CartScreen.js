import React, { useState } from "react"
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Ionicons from "react-native-vector-icons/Ionicons"
import Header from "../components/Header"
import { useCart } from "../context/CartContext"
import useAuthStore from "../stores/authStore"
import useOffersStore from "../stores/offersStore"
import LoadingSpinner from "../components/LoadingSpinner"
import CouponSection from '../components/checkout/CouponSection'
import AvailableOffers from '../components/checkout/AvailableOffers'

const CartScreen = () => {
  const navigation = useNavigation()
  const { user } = useAuthStore()
  const {
    cartItems,
    loading,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    getCartSavings,
  } = useCart()
  const { getTotalDiscount, clearAll } = useOffersStore()

  const [updatingItems, setUpdatingItems] = useState({})

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId)
      return
    }
    setUpdatingItems((prev) => ({ ...prev, [itemId]: true }))
    await updateQuantity(itemId, newQuantity)
    setUpdatingItems((prev) => ({ ...prev, [itemId]: false }))
  }

  const handleRemoveItem = (itemId) => {
    Alert.alert("Remove Item", "Are you sure you want to remove this item from your cart?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeFromCart(itemId) },
    ])
  }

  const handleClearCart = () => {
    Alert.alert("Clear Cart", "Are you sure you want to remove all items from your cart?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear All", style: "destructive", onPress: () => {
        clearCart()
        clearAll()
      }},
    ])
  }

  const handleCheckout = () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to proceed with checkout", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => navigation.navigate("Profile") },
      ])
      return
    }
    navigation.navigate("Checkout")
  }

  const renderCartItem = ({ item }) => {
    const isUpdating = updatingItems[item.id]
    const maxQuantity = Math.min(item.buy_limit || 10, item.stock)
    return (
      <View className="flex-row bg-white rounded-xl p-4 mb-4 shadow-lg border border-gray-100">
        <TouchableOpacity onPress={() => navigation.navigate("ProductDetail", { productListing: item })}>
          <Image source={{ uri: item.image || "/placeholder.svg?height=100&width=100" }} className="w-20 h-20 rounded-lg mr-4 bg-gray-100" />
        </TouchableOpacity>
        <View className="flex-1">
          <TouchableOpacity onPress={() => navigation.navigate("ProductDetail", { productListing: item })}>
            {item.brand && <Text className="text-xs text-gray-500 mb-1">{item.brand.name}</Text>}
            <Text className="text-base font-semibold text-gray-900 mb-1" numberOfLines={2}>{item.name}</Text>
            {item.variant_name && <Text className="text-xs text-gray-400 mb-2">{item.variant_name}</Text>}
          </TouchableOpacity>
          <View className="flex-row items-center mb-2">
            <Text className="text-lg font-bold text-gray-900">₹{item.price}</Text>
            {item.mrp && item.mrp > item.price && <Text className="text-sm text-gray-400 line-through ml-2">₹{item.mrp}</Text>}
          </View>
          <View className="flex-row items-center mb-2">
            <TouchableOpacity className={`w-8 h-8 rounded-full border border-gray-200 bg-gray-50 items-center justify-center ${item.quantity <= 1 || isUpdating ? 'opacity-50' : ''}`} onPress={() => handleQuantityChange(item.id, item.quantity - 1)} disabled={item.quantity <= 1 || isUpdating}>
              <Ionicons name="remove" size={16} color="#1f2937" />
            </TouchableOpacity>
            <Text className="mx-4 text-base font-medium min-w-[30px] text-center">{item.quantity}</Text>
            <TouchableOpacity className={`w-8 h-8 rounded-full border border-gray-200 bg-gray-50 items-center justify-center ${item.quantity >= maxQuantity || isUpdating ? 'opacity-50' : ''}`} onPress={() => handleQuantityChange(item.id, item.quantity + 1)} disabled={item.quantity >= maxQuantity || isUpdating}>
              <Ionicons name="add" size={16} color="#1f2937" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity className="flex-row items-center self-start mt-1" onPress={() => handleRemoveItem(item.id)}>
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
            <Text className="text-xs text-red-500 ml-1">Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const renderEmptyCart = () => (
    <View className="flex-1 justify-center items-center px-8">
      <Ionicons name="cart-outline" size={80} color="#6b7280" />
      <Text className="text-2xl font-bold text-gray-900 mt-6 mb-2">Your cart is empty</Text>
      <Text className="text-base text-gray-500 text-center mb-8">Add some products to get started</Text>
      <TouchableOpacity className="bg-blue-600 px-8 py-4 rounded-lg" onPress={() => navigation.navigate("Home")}> 
        <Text className="text-white text-base font-medium">Shop Now</Text>
      </TouchableOpacity>
    </View>
  )

  const renderCartSummary = () => {
    const subtotal = getCartTotal()
    const savings = getCartSavings()
    const totalDiscount = getTotalDiscount()
    const itemsCount = getCartItemsCount()
    const deliveryFee = subtotal < 200 ? 40 : 0
    const handlingFee = 0
    const finalTotal = Math.round(subtotal - totalDiscount + deliveryFee + handlingFee)
    return (
      <View className="bg-white p-6 border-t border-gray-200">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-base text-gray-500">Items ({itemsCount})</Text>
          <Text className="text-base font-bold text-gray-900">₹{subtotal}</Text>
        </View>
        {savings > 0 && (
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base text-green-600">Product Savings</Text>
            <Text className="text-base text-green-600 font-bold">-₹{savings}</Text>
          </View>
        )}
        {totalDiscount > 0 && (
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base text-green-600">Discount</Text>
            <Text className="text-base text-green-600 font-bold">-₹{totalDiscount}</Text>
          </View>
        )}
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-base text-gray-500">Delivery Fee</Text>
          <Text className="text-base font-bold text-gray-900">{deliveryFee > 0 ? `₹${deliveryFee}` : 'FREE'}</Text>
        </View>
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-base text-gray-500">Handling Fee</Text>
          <Text className="text-base font-bold text-gray-900">{handlingFee > 0 ? `₹${handlingFee}` : 'FREE'}</Text>
        </View>
        <View className="h-px bg-gray-200 my-4" />
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-bold text-gray-900">Total Amount</Text>
          <Text className="text-lg font-bold text-gray-900">₹{finalTotal}</Text>
        </View>
        {(savings + totalDiscount) > 0 && (
          <Text className="text-green-600 text-center mt-2">You will save ₹{savings + totalDiscount} on this order</Text>
        )}
      </View>
    )
  }

  if (cartItems.length === 0) {
    return (
      <View className="flex-1 bg-gray-50">
        <Header navigation={navigation} title="Shopping Cart" showSearch={false} />
        {renderEmptyCart()}
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      <Header navigation={navigation} title="Shopping Cart" showSearch={false} />
      <View className="flex-row justify-between items-center px-4 py-2 border-b border-gray-200 bg-white">
        <Text className="text-base text-gray-500">{getCartItemsCount()} items in cart</Text>
        <TouchableOpacity onPress={handleClearCart}>
          <Text className="text-base text-red-500 font-medium">Clear All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCartItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
        ListFooterComponent={() => (
          <View className="mt-4">
            <AvailableOffers />
            <CouponSection />
          </View>
        )}
      />
      {renderCartSummary()}
      <View className="px-6 py-4 bg-white border-t border-gray-200">
        <TouchableOpacity className="flex-row items-center justify-center bg-blue-600 py-4 rounded-lg" onPress={handleCheckout}>
          <Text className="text-white text-lg font-semibold mr-2">Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default CartScreen
