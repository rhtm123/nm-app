import React, { useState, useEffect } from "react"
import { View, Text, FlatList, TouchableOpacity, Image, SafeAreaView } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Ionicons from "react-native-vector-icons/Ionicons"
import Header from "../components/Header"
import useCartStore from "../stores/cartStore"
import useAuthStore from "../stores/authStore"
import useOffersStore from "../stores/offersStore"
import LoadingSpinner from "../components/LoadingSpinner"
import CouponSection from '../components/checkout/CouponSection'
import AvailableOffers from '../components/checkout/AvailableOffers'
import QuantityControls from '../components/ui/QuantityControls'
import CustomAlert from '../components/CustomAlert'
import useAlert from '../hooks/useAlert'
import { colors } from '../theme'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const CartScreen = () => {
  const navigation = useNavigation()
  const { user } = useAuthStore()
  const { alert, showDestructive, showConfirm, showInfo, hideAlert } = useAlert()
  
  // Use Zustand selectors for optimal performance
  const cartItems = useCartStore((state) => state.items)
  const loading = useCartStore((state) => state.loading)
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)
  const getCartTotal = useCartStore((state) => state.getCartTotal)
  const getCartItemsCount = useCartStore((state) => state.getCartItemsCount)
  const getCartSavings = useCartStore((state) => state.getCartSavings)
  const initializeCart = useCartStore((state) => state.initializeCart)
  
  const { getTotalDiscount, clearAll } = useOffersStore()
  const { bottom } = useSafeAreaInsets()
  
  // Initialize cart on mount
  useEffect(() => {
    initializeCart(user?.id)
  }, [user?.id, initializeCart])
  
  // Calculate dynamic bottom padding
  const bottomTabHeight = 60 // Bottom navigation height
  const bottomPadding = bottom + bottomTabHeight + 16 // Safe area + tabs + buffer
  
  // Debug logging
  console.log('CartScreen Bottom Padding:', {
    safeAreaBottom: bottom,
    bottomTabHeight,
    totalBottomPadding: bottomPadding
  })

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId)
      return
    }
    // Optimistic update - no need for loading states with Zustand
    updateQuantity(itemId, newQuantity, user?.id)
  }

  const handleRemoveItem = (itemId) => {
    showDestructive(
      "Remove Item", 
      "Are you sure you want to remove this item from your cart?",
      () => removeFromCart(itemId, user?.id),
      () => {},
      "Remove"
    )
  }

  const handleClearCart = () => {
    showDestructive(
      "Clear Cart", 
      "Are you sure you want to remove all items from your cart?",
      () => {
        clearCart(user?.id)
        clearAll()
      },
      () => {},
      "Clear All"
    )
  }

  const handleCheckout = () => {
    if (!user) {
      showConfirm(
        "Login Required", 
        "Please login to proceed with checkout",
        () => navigation.navigate("Profile"),
        () => {}
      )
      return
    }
    navigation.navigate("Checkout")
  }

  const renderCartItem = ({ item }) => {
    const maxQuantity = Math.min(item.buy_limit || 10, item.stock)
    const discountPercent = item.mrp && item.mrp > item.price ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0
    
    return (
      <View style={{ backgroundColor: colors.surface }} className="rounded-2xl p-4 mb-3 shadow-lg">
        <View className="flex-row">
          <TouchableOpacity onPress={() => navigation.navigate("ProductDetail", { productListing: item })}>
            <View style={{ backgroundColor: colors.gray[50] }} className="w-24 h-24 rounded-xl items-center justify-center p-2">
              <Image 
                source={{ uri: item.image || "/placeholder.svg?height=100&width=100" }} 
                className="w-full h-full rounded-lg" 
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
          
          <View className="flex-1 ml-4">
            <TouchableOpacity onPress={() => navigation.navigate("ProductDetail", { productListing: item })}>
              {item.brand && (
                <Text style={{ color: colors.text.muted }} className="text-xs mb-1 uppercase tracking-wide font-medium">
                  {item.brand.name}
                </Text>
              )}
              <Text style={{ color: colors.text.primary }} className="text-base font-semibold mb-1 leading-5" numberOfLines={2}>
                {item.name}
              </Text>
              {item.variant_name && (
                <Text style={{ color: colors.text.secondary }} className="text-sm mb-2">
                  {item.variant_name}
                </Text>
              )}
            </TouchableOpacity>
            
            <View className="flex-row items-center mb-3">
              <Text style={{ color: colors.text.primary }} className="text-lg font-bold">₹{item.price}</Text>
              {item.mrp && item.mrp > item.price && (
                <>
                  <Text style={{ color: colors.text.light }} className="text-sm line-through ml-2">₹{item.mrp}</Text>
                  <View style={{ backgroundColor: colors.success }} className="px-2 py-1 rounded-full ml-2">
                    <Text style={{ color: colors.text.white }} className="text-xs font-bold">{discountPercent}% OFF</Text>
                  </View>
                </>
              )}
            </View>
            
            {/* Quantity Controls */}
            <View className="flex-row items-center justify-between">
              <View style={{ backgroundColor: colors.gray[50] }} className="flex-row items-center rounded-xl p-1">
                <TouchableOpacity 
                  style={{
                    backgroundColor: item.quantity <= 1 ? colors.gray[200] : colors.primary,
                    opacity: item.quantity <= 1 ? 0.5 : 1
                  }}
                  className="w-9 h-9 rounded-lg items-center justify-center"
                  onPress={() => handleQuantityChange(item.id, item.quantity - 1)} 
                  disabled={item.quantity <= 1}
                  activeOpacity={0.7}
                >
                  {item.quantity === 1 ? (
                    <Ionicons name="trash-outline" size={14} color={colors.text.white} />
                  ) : (
                    <Ionicons name="remove" size={14} color={colors.text.white} />
                  )}
                </TouchableOpacity>
                
                <Text style={{ color: colors.text.primary }} className="text-lg font-bold mx-4 min-w-[30px] text-center">
                  {item.quantity}
                </Text>
                
                <TouchableOpacity 
                  style={{
                    backgroundColor: item.quantity >= maxQuantity ? colors.gray[200] : colors.primary,
                    opacity: item.quantity >= maxQuantity ? 0.5 : 1
                  }}
                  className="w-9 h-9 rounded-lg items-center justify-center"
                  onPress={() => handleQuantityChange(item.id, item.quantity + 1)} 
                  disabled={item.quantity >= maxQuantity}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={14} color={colors.text.white} />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                onPress={() => handleRemoveItem(item.id)}
                style={{ backgroundColor: colors.error + '10' }}
                className="flex-row items-center px-3 py-2 rounded-lg"
              >
                <Ionicons name="trash-outline" size={14} color={colors.error} />
                <Text style={{ color: colors.error }} className="text-sm ml-1 font-medium">Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    )
  }

  const renderEmptyCart = () => (
    <View className="flex-1 justify-center items-center px-8">
      <Ionicons name="cart-outline" size={80} color={colors.text.secondary} />
      <Text style={{ color: colors.text.primary }} className="text-2xl font-bold mt-6 mb-2">Your cart is empty</Text>
      <Text style={{ color: colors.text.secondary }} className="text-base text-center mb-8">Add some products to get started</Text>
      <TouchableOpacity style={{ backgroundColor: colors.primary }} className="px-8 py-4 rounded-lg" onPress={() => navigation.navigate("Home")}> 
        <Text style={{ color: colors.text.white }} className="text-base font-medium">Shop Now</Text>
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
    const totalSavings = savings + totalDiscount
    
    return (
      <View style={{ backgroundColor: colors.surface }} className="mx-4 mb-2 p-2 rounded-2xl shadow-lg">
        <Text style={{ color: colors.text.primary }} className="text-lg font-bold mb-4">Bill Details</Text>
        
        <View className="space-y-3">
          <View className="flex-row justify-between items-center">
            <Text style={{ color: colors.text.secondary }} className="text-base">Items ({itemsCount})</Text>
            <Text style={{ color: colors.text.primary }} className="text-base font-semibold">₹{subtotal}</Text>
          </View>
          
          {savings > 0 && (
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Ionicons name="pricetag" size={16} color={colors.success} />
                <Text style={{ color: colors.success }} className="text-base ml-1">Product Savings</Text>
              </View>
              <Text style={{ color: colors.success }} className="text-base font-semibold">-₹{savings}</Text>
            </View>
          )}
          
          {totalDiscount > 0 && (
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Ionicons name="gift" size={16} color={colors.success} />
                <Text style={{ color: colors.success }} className="text-base ml-1">Coupon Discount</Text>
              </View>
              <Text style={{ color: colors.success }} className="text-base font-semibold">-₹{totalDiscount}</Text>
            </View>
          )}
          
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="bicycle" size={16} color={deliveryFee > 0 ? colors.text.secondary : colors.success} />
              <Text style={{ color: colors.text.secondary }} className="text-base ml-1">Delivery Fee</Text>
            </View>
            <Text style={{ color: deliveryFee > 0 ? colors.text.primary : colors.success }} className="text-base font-semibold">
              {deliveryFee > 0 ? `₹${deliveryFee}` : 'FREE'}
            </Text>
          </View>
          
          {deliveryFee > 0 && subtotal < 200 && (
            <View style={{ backgroundColor: colors.primaryLight + '15' }} className="p-3 rounded-xl">
              <Text style={{ color: colors.primary }} className="text-sm font-medium text-center">
                Add ₹{200 - subtotal} more to get FREE delivery
              </Text>
            </View>
          )}
        </View>
        
        <View style={{ backgroundColor: colors.border.light }} className="h-px my-4" />
        
        <View className="flex-row justify-between items-center mb-3">
          <Text style={{ color: colors.text.primary }} className="text-lg font-bold">Total Amount</Text>
          <Text style={{ color: colors.text.primary }} className="text-xl font-bold">₹{finalTotal}</Text>
        </View>
        
        {totalSavings > 0 && (
          <View style={{ backgroundColor: colors.success + '15' }} className="p-3 rounded-xl">
            <View className="flex-row items-center justify-center">
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={{ color: colors.success }} className="text-sm font-bold ml-1">
                You saved ₹{totalSavings} on this order!
              </Text>
            </View>
          </View>
        )}
      </View>
    )
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={{ backgroundColor: colors.backgroundSecondary, flex: 1 }}>
        <Header navigation={navigation} title="Shopping Cart" showSearch={false} />
        {renderEmptyCart()}
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ backgroundColor: colors.backgroundSecondary, flex: 1 }}>
      <Header navigation={navigation} title="Shopping Cart" showSearch={false} />
      <View style={{ backgroundColor: colors.surface, borderBottomColor: colors.border.primary }} className="flex-row justify-between items-center px-4 py-2 border-b">
        <Text style={{ color: colors.text.secondary }} className="text-base">{getCartItemsCount()} items in cart</Text>
        <TouchableOpacity onPress={handleClearCart}>
          <Text style={{ color: colors.error }} className="text-base font-medium">Clear All</Text>
        </TouchableOpacity>
      </View>
      
      {/* Scrollable content area with proper flex management */}
      <View className="flex-1" style={{ paddingBottom: bottomPadding + 300 }}> {/* Dynamic padding based on device navigation */}
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCartItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            padding: 16,
            paddingBottom: 20 // Reduced padding
          }}
          ListFooterComponent={() => (
            <View className="mt-4">
              <AvailableOffers />
              <CouponSection />
            </View>
          )}
        />
      </View>
      
      {/* Fixed bottom section - Compact design */}
      <View 
        style={{ 
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border.primary,
          paddingBottom: bottomPadding, // Dynamic padding based on device navigation
        }}
      >
        {/* Single row with total and checkout button */}
        {renderCartSummary()}
        
        {/* Checkout Button - Full width */}
        <View className="px-4 pb-2">
          <TouchableOpacity 
            style={{ 
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8
            }} 
            className="flex-row items-center justify-center py-4 rounded-2xl" 
            onPress={handleCheckout}
            activeOpacity={0.9}
          >
            <Text style={{ color: colors.text.white }} className="text-lg font-bold mr-2">
              Proceed to Checkout
            </Text>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} className="w-8 h-8 rounded-full items-center justify-center">
              <Ionicons name="arrow-forward" size={18} color={colors.text.white} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        onClose={hideAlert}
        title={alert.title}
        message={alert.message}
        buttons={alert.buttons}
        type={alert.type}
      />
    </SafeAreaView>
  )
}

export default CartScreen
