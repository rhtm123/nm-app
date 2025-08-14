import React, { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Linking } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { useCart } from "../context/CartContext"
import useAuthStore from "../stores/authStore"
import AsyncStorage from '@react-native-async-storage/async-storage'
import useOffersStore from "../stores/offersStore"
import LoadingSpinner from "../components/LoadingSpinner"
import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/endpoints';
import CouponSection from '../components/checkout/CouponSection'
import AvailableOffers from '../components/checkout/AvailableOffers'
import phonepeService from '../services/phonepeService'
import { colors } from '../theme'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const CheckoutScreen = () => {
  const navigation = useNavigation()
  const { cartItems, getCartTotal, clearCart, getCartSavings } = useCart()
  const { user, isAuthenticated, checkAuthStatus } = useAuthStore()
  const { appliedCoupon, appliedOffer, getTotalDiscount, clearAll } = useOffersStore()
  const { bottom } = useSafeAreaInsets()
  
  // Calculate bottom padding - minimal approach
  const bottomTabHeight = 60 // Bottom navigation height
  const bottomPadding = Math.max(bottom, 10) + bottomTabHeight // Minimal but safe padding
  
  // Debug logging
  console.log('CheckoutScreen Bottom Padding:', {
    safeAreaBottom: bottom,
    bottomTabHeight,
    totalBottomPadding: bottomPadding
  })
  
  // Redirect to login if not logged in
  if (!isAuthenticated || !user) {
    useEffect(() => {
      Alert.alert("Login Required", "Please login to proceed with checkout", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => navigation.navigate('Profile') },
      ])
      navigation.navigate('Profile');
    }, []);
    return null;
  }
  
  const [loading, setLoading] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [termsAccepted, setTermsAccepted] = useState(false)

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(API_ENDPOINTS.SHIPPING_ADDRESSES + `?user_id=${user?.id}`);
      setAddresses(res.data.results || []);
      if (res.data.results && res.data.results.length > 0) {
        setSelectedAddress(res.data.results[0]);
      }
    } catch (e) {
      console.error('Error fetching addresses:', e);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals similar to Svelte app
  const cartTotal = getCartTotal() // Call the function directly
  const subtotal = cartTotal || 0
  const savings = getCartSavings() || 0
  const totalDiscount = getTotalDiscount() || 0
  const deliveryFee = subtotal < 200 ? 40 : 0
  const handlingFee = 0
  const finalTotal = Math.round((subtotal - totalDiscount + deliveryFee + handlingFee) || 0)

  // Debug logging
  console.log('CheckoutScreen Debug:', {
    cartTotal,
    subtotal,
    savings,
    totalDiscount,
    deliveryFee,
    handlingFee,
    finalTotal,
    cartItemsCount: cartItems.length,
    cartItems: cartItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity
    }))
  });

  // Test function to verify calculations
  const testCalculations = () => {
    const testSubtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const testSavings = cartItems.reduce((savings, item) => {
      const itemSavings = ((item.mrp || 0) - item.price) * item.quantity;
      return savings + itemSavings;
    }, 0);
    
    console.log('Test Calculations:', {
      testSubtotal,
      testSavings,
      actualSubtotal: subtotal,
      actualSavings: savings,
      difference: testSubtotal - subtotal
    });
  };

  // Run test calculations
  useEffect(() => {
    if (cartItems.length > 0) {
      testCalculations();
    }
  }, [cartItems]);

  // Force recalculation when cart items change
  useEffect(() => {
    console.log('Cart items changed:', cartItems);
    console.log('Cart total from context:', cartTotal);
  }, [cartItems, cartTotal]);

  const checkDailyOrderLimit = async () => {
    try {
      const url = `${API_ENDPOINTS.ORDERS}?user_id=${user.id}`;
      const response = await apiClient.get(url);
      const today = new Date().toISOString().split('T')[0];
      
      const todayOrdersCount = response.data.results.filter(order => {
        const orderDate = new Date(order.created).toISOString().split('T')[0];
        return orderDate === today;
      }).length;
      
      return todayOrdersCount;
    } catch (error) {
      console.error('Error checking daily order limit:', error);
      return 0;
    }
  };

  const validateAuthentication = async () => {
    try {
      // Check if token exists in AsyncStorage
      const token = await AsyncStorage.getItem("authToken")
      if (!token) {
        console.log('No auth token found in AsyncStorage')
        return false
      }
      
      // Check auth status in store
      if (!isAuthenticated || !user) {
        console.log('User not authenticated in store')
        // Try to refresh auth status
        await checkAuthStatus()
        
        // Check again after refresh
        if (!isAuthenticated || !user) {
          console.log('Still not authenticated after refresh')
          return false
        }
      }
      
      // Test token by making a simple API call
      try {
        const testResponse = await apiClient.get(`${API_ENDPOINTS.USERS}?id=${user.id}&page_size=1`)
        console.log('Token validation successful')
        return true
      } catch (tokenError) {
        console.log('Token validation failed:', tokenError.response?.status)
        if (tokenError.response?.status === 401) {
          return false
        }
        // If it's not a 401, assume token is valid but there's another issue
        return true
      }
    } catch (error) {
      console.error('Error validating authentication:', error)
      return false
    }
  }

  const handlePlaceOrder = async () => {
    console.log('Starting order placement process...')
    
    if (!selectedAddress) {
      Alert.alert("Error", "Please select a delivery address")
      return
    }

    if (!termsAccepted) {
      Alert.alert("Error", "Please accept the terms and conditions")
      return
    }

    if (cartItems.length === 0) {
      Alert.alert("Error", "Your cart is empty")
      return
    }

    if (finalTotal <= 0) {
      Alert.alert("Error", "Invalid order total")
      return
    }

    // Validate authentication more thoroughly
    const isAuthValid = await validateAuthentication()
    if (!isAuthValid) {
      Alert.alert("Authentication Required", "Please login to place order", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => navigation.navigate('Profile') },
      ])
      return
    }

    const dailyOrderCount = await checkDailyOrderLimit();
    if (dailyOrderCount >= 10) {
      Alert.alert("Error", "You cannot place more than 10 orders in a single day.")
      return
    }

    setLoading(true)

    try {
      // Double-check auth token before making the API call
      const token = await AsyncStorage.getItem("authToken")
      console.log('Auth token exists:', !!token)
      console.log('User object:', user)
      
      console.log('Placing order with data:', {
        user_id: user?.id,
        estore_id: process.env.EXPO_PUBLIC_ESTORE_ID || 1,
        shipping_address_id: selectedAddress.id,
        offer_id: appliedOffer?.id || null,
        coupon_id: appliedCoupon?.id || null,
        total_amount: finalTotal,
        cart_items_count: cartItems.length
      });

      // Create order
      const orderData = {
        user_id: user?.id,
        estore_id: process.env.EXPO_PUBLIC_ESTORE_ID || 1,
        shipping_address_id: selectedAddress.id,
        offer_id: appliedOffer?.id || null,
        coupon_id: appliedCoupon?.id || null,
        total_amount: finalTotal,
      };

      const orderResponse = await apiClient.post(API_ENDPOINTS.ORDERS, orderData);
      const order = orderResponse.data;

      console.log('Order created successfully:', order.id);

      // Create order items
      for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        const itemData = {
          order_id: order.id,
          product_listing_id: item.id,
          quantity: item.quantity,
          price: Number((item.originalPrice || item.price).toFixed(2)),
          offer_id: item.productOffer?.id || null,
          subtotal: Number((Number(item.discountedPrice || item.price) * Number(item.quantity)).toFixed(2))
        };

        console.log('Creating order item:', itemData);

        try {
          await apiClient.post(API_ENDPOINTS.ORDER_ITEMS, itemData);
        } catch (error) {
          console.error('Error creating order item:', error);
          // If an order item fails, delete the order and show error
          try {
            await apiClient.delete(`${API_ENDPOINTS.ORDERS}${order.id}/`);
          } catch (deleteError) {
            console.error('Error deleting order after item creation failure:', deleteError);
          }
          Alert.alert("Error", "Error creating order: Some items are out of stock")
          setLoading(false)
          return
        }
      }

      // Create payment
      const paymentData = {
        order_id: order.id,
        amount: finalTotal,
        payment_gateway: paymentMethod === "pg" ? "PhonePe" : null,
        estore_id: process.env.EXPO_PUBLIC_ESTORE_ID || 1,
        payment_method: paymentMethod,
      };

      console.log('Creating payment:', paymentData);

      try {
        const paymentResponse = await apiClient.post(API_ENDPOINTS.PAYMENTS, paymentData);
        const payment = paymentResponse.data;

        console.log('Payment created successfully:', payment);

        if (payment.payment_method === "pg") {
          // Handle PhonePe payment
          await handlePhonePePayment(order, payment);
        } else {
          // Cash on delivery - order completed
          clearCart()
          clearAll()
          Alert.alert(
            "Order Placed!",
            "Your order has been placed successfully. You will receive a confirmation shortly.",
            [
              {
                text: "OK",
                onPress: () => navigation.navigate("OrderDetails", { orderId: order.id }),
              },
            ],
          )
        }
      } catch (paymentError) {
        console.error('Error creating payment:', paymentError);
        Alert.alert("Payment Error", "Failed to create payment. Please try again.");
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error placing order:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = "Error placing order: Please try again";
      
      if (error.response?.status === 401) {
        console.log('401 Unauthorized - clearing auth data');
        // Clear authentication data
        await AsyncStorage.removeItem("authToken")
        await AsyncStorage.removeItem("user")
        
        // Update auth store
        checkAuthStatus()
        
        errorMessage = "Authentication failed. Please login again.";
        Alert.alert("Authentication Failed", errorMessage, [
          { text: "OK", onPress: () => navigation.navigate('Profile') }
        ]);
        return;
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later or contact support.";
        // Show retry option for server errors
        Alert.alert(
          "Server Error",
          "There was a server error. Would you like to try again?",
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            {
              text: "Retry",
              onPress: () => handlePlaceOrder()
            }
          ]
        );
        setLoading(false);
        return;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      Alert.alert("Error", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handlePhonePePayment = async (order, payment) => {
    try {
      console.log('Starting PhonePe payment for order:', order.id);
      console.log('Payment data from POST response:', payment);
      
      // Get the payment URL directly from the payment response
      const paymentUrl = payment.payment_url;
      
      if (paymentUrl) {
        console.log('Payment URL received:', paymentUrl);
        
        // Open PhonePe payment URL
        const openResult = await phonepeService.openPhonePeUrl(paymentUrl, order.id);
        
        if (openResult.success) {
          Alert.alert(
            "Payment Initiated",
            "PhonePe payment has been initiated. Please complete the payment.",
            [
              {
                text: "OK",
                onPress: () => navigation.navigate("OrderDetails", { orderId: order.id }),
              },
            ]
          );
        } else {
          Alert.alert("Payment Error", "Failed to open PhonePe payment. Please try again.");
        }
      } else {
        console.error('No payment URL received from server');
        Alert.alert("Payment Error", "Payment URL not received from server.");
      }
    } catch (error) {
      console.error('PhonePe payment error:', error);
      Alert.alert("Payment Error", "Failed to initiate PhonePe payment. Please try again.");
    }
  }

  const openPhonePeWebUrl = async (paymentUrl, orderId) => {
    try {
      const supported = await Linking.canOpenURL(paymentUrl);
      
      if (supported) {
        await Linking.openURL(paymentUrl);
        Alert.alert(
          "Payment Gateway",
          "PhonePe payment gateway opened. Please complete your payment.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("OrderDetails", { orderId }),
            },
          ]
        );
      } else {
        Alert.alert("Error", "Cannot open PhonePe payment URL");
      }
    } catch (error) {
      console.error('Error opening PhonePe URL:', error);
      Alert.alert("Error", "Failed to open payment gateway");
    }
  }

  const renderOrderSummary = () => (
    <View className="bg-white p-4 rounded-lg shadow-sm mb-4">
      <Text className="text-lg font-bold mb-2">Order Summary</Text>

      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-md text-gray-600">Subtotal ({cartItems.length} items)</Text>
        <Text className="text-md font-medium text-gray-900">₹{subtotal}</Text>
      </View>

      {savings > 0 && (
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-md text-green-600">Product Savings</Text>
          <Text className="text-md font-medium text-green-600">-₹{savings}</Text>
        </View>
      )}

      {totalDiscount > 0 && (
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-md text-green-600">Discount</Text>
          <Text className="text-md font-medium text-green-600">-₹{totalDiscount}</Text>
        </View>
      )}

      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-md text-gray-600">Delivery Fee</Text>
        <Text className="text-md font-medium text-gray-900">
          {deliveryFee > 0 ? `₹${deliveryFee}` : 'FREE'}
        </Text>
      </View>

      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-md text-gray-600">Handling Fee</Text>
        <Text className="text-md font-medium text-gray-900">
          {handlingFee > 0 ? `₹${handlingFee}` : 'FREE'}
        </Text>
      </View>

      <View className="h-px bg-gray-200 my-2" />

      <View className="flex-row justify-between items-center">
        <Text className="text-lg font-bold text-gray-900">Total Amount</Text>
        <Text className="text-lg font-bold text-gray-900">₹{finalTotal}</Text>
      </View>
    </View>
  )

  const renderDeliveryAddress = () => (
    <View className="bg-white p-4 rounded-lg shadow-sm mb-4">
      <Text className="text-lg font-bold mb-2">Delivery Address</Text>
      {addresses.length === 0 ? (
        <TouchableOpacity onPress={() => navigation.navigate('Addresses')} className="flex-row items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Text className="text-blue-600 font-semibold">+ Add Address</Text>
        </TouchableOpacity>
      ) : (
        addresses.map(addr => (
          <TouchableOpacity
            key={addr.id}
            className={`flex-row items-center p-4 rounded-lg border ${selectedAddress?.id === addr.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} mb-2`}
            onPress={() => setSelectedAddress(addr)}
          >
            <Ionicons name="location-outline" size={24} color="#2563eb" />
            <View className="ml-3">
              <Text className="text-md font-semibold text-gray-900">{addr.name}</Text>
              <Text className="text-sm text-gray-600">{addr.address?.line1}, {addr.address?.line2}, {addr.address?.city}, {addr.address?.state} - {addr.address?.pin}</Text>
              <Text className="text-sm text-gray-600">{addr.mobile}</Text>
            </View>
            {selectedAddress?.id === addr.id && <Ionicons name="checkmark-circle" size={20} color="#2563eb" />}
          </TouchableOpacity>
        ))
      )}
      <TouchableOpacity onPress={() => navigation.navigate('Addresses')} className="mt-2">
        <Text className="text-blue-600 text-sm">Manage Addresses</Text>
      </TouchableOpacity>
    </View>
  )

  const renderPaymentMethod = () => (
    <View className="bg-white p-4 rounded-lg shadow-sm mb-4">
      <Text className="text-lg font-bold mb-2">Payment Method</Text>

      <TouchableOpacity
        className={`flex-row items-center p-4 rounded-lg border ${paymentMethod === "cod" ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} mb-2`}
        onPress={() => setPaymentMethod("cod")}
      >
        <Ionicons
          name={paymentMethod === "cod" ? "radio-button-on" : "radio-button-off"}
          size={20}
          color="#2563eb"
        />
        <View className="ml-3">
          <Text className="text-md font-medium text-gray-900">Cash on Delivery</Text>
          <Text className="text-sm text-gray-600">Pay when you receive your order</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        className={`flex-row items-center p-4 rounded-lg border ${paymentMethod === "pg" ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
        onPress={() => setPaymentMethod("pg")}
      >
        <Ionicons
          name={paymentMethod === "pg" ? "radio-button-on" : "radio-button-off"}
          size={20}
          color="#2563eb"
        />
        <View className="ml-3">
          <Text className="text-md font-medium text-gray-900">PhonePe Payment</Text>
          <Text className="text-sm text-gray-600">Pay using UPI, Card, or Net Banking</Text>
        </View>
      </TouchableOpacity>
    </View>
  )

  const renderOffersAndCoupons = () => (
    <View className="bg-white p-4 rounded-lg shadow-sm mb-4">
      <Text className="text-lg font-bold mb-2">Offers & Coupons</Text>
      <AvailableOffers />
      <CouponSection />
    </View>
  )

  const renderTermsAndConditions = () => (
    <View className="bg-white p-4 rounded-lg shadow-sm mb-4">
      <TouchableOpacity
        className="flex-row items-start gap-2"
        onPress={() => setTermsAccepted(!termsAccepted)}
      >
        <Ionicons
          name={termsAccepted ? "checkbox" : "square-outline"}
          size={20}
          color={termsAccepted ? "#2563eb" : "#6b7280"}
        />
        <Text className="text-sm text-gray-600">
          I have read and agree to the website's{" "}
          <Text className="text-blue-600">terms and conditions</Text>
        </Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={{ backgroundColor: colors.backgroundSecondary }} className="flex-1">
      {/* Scrollable content area with dynamic padding */}
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          padding: 16,
          paddingBottom: bottomPadding + 10 // Minimal extra padding
        }}
      >
        {renderDeliveryAddress()}
        {renderOffersAndCoupons()}
        {renderPaymentMethod()}
        {renderOrderSummary()}
        {renderTermsAndConditions()}
      </ScrollView>

      {/* Fixed Bottom Section - stick to bottom */}
      <View 
        style={{ 
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border.primary,
          paddingBottom: Math.max(bottom, 10), // Only safe area padding, no extra
        }}
      >
        {/* Compact Total Summary */}
        {/* <View className="px-4 py-2 border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-gray-600">Total ({cartItems.length} items)</Text>
              {(savings + totalDiscount) > 0 && (
                <Text className="text-xs text-green-600">
                  You save ₹{savings + totalDiscount}
                </Text>
              )}
            </View>
            <Text className="text-lg font-bold text-gray-900">₹{finalTotal}</Text>
          </View>
        </View> */}

        {/* Place Order Button */}
        <View className="px-4 py-3">
          <TouchableOpacity
            style={{
              backgroundColor: loading ? colors.gray[300] : colors.primary,
              shadowColor: loading ? 'transparent' : colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: loading ? 0 : 8
            }}
            className="flex-row items-center justify-center py-4 rounded-2xl"
            onPress={handlePlaceOrder}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <LoadingSpinner size="small" color={colors.text.white} />
            ) : (
              <>
                <Text style={{ color: colors.text.white }} className="text-lg font-bold mr-2">Place Order</Text>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} className="w-8 h-8 rounded-full items-center justify-center">
                  <Ionicons name="arrow-forward" size={18} color={colors.text.white} />
                </View>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default CheckoutScreen
