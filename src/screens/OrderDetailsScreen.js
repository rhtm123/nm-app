import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Modal, TextInput, RefreshControl } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import LoadingSpinner from '../components/LoadingSpinner'
import apiClient from '../config/apiClient'
import { API_ENDPOINTS } from '../config/endpoints'
import useAuthStore from '../stores/authStore'
import phonepeService from '../services/phonepeService'
import orderService from '../services/orderService'

const OrderDetailsScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { orderId } = route.params
  const { user } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [order, setOrder] = useState(null)
  const [error, setError] = useState(null)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [returnLoading, setReturnLoading] = useState(false)
  
  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])
  const [cancelReason, setCancelReason] = useState('')
  const [returnReason, setReturnReason] = useState('')

  useEffect(() => {
    fetchOrderDetails()
    // Warm up in-app browser
    phonepeService.warmup()
    
    return () => {
      // Cool down in-app browser
      phonepeService.cooldown()
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use order service to fetch order details
      const result = await orderService.getOrderById(orderId)
      
      if (result.success) {
        console.log('Order details fetched:', result.data);
        console.log('Order items:', result.data.items);
        console.log('Order payment method:', result.data.payment_method);
        console.log('Order payment status:', result.data.payment_status);
        setOrder(result.data)
      } else {
        setError(result.error)
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      setError('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchOrderDetails()
    setRefreshing(false)
  }

  const formatPaymentMethod = (method) => {
    if (!method) return 'Not specified';
    return method === "pg" ? "Online Payment" : "Cash on Delivery";
  }
  
  const formatDate = (dateString) => !dateString ? 'N/A' : new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  const formatPrice = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price)

  // Handle payment for pending orders
  const handlePayment = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to make payment", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => navigation.navigate('Profile') },
      ])
      return
    }

    try {
      setPaymentLoading(true)
      
      // Create payment request
      const paymentData = {
        order_id: order.id,
        amount: order.total_amount,
        estore_id: process.env.EXPO_PUBLIC_ESTORE_ID || 1,
        payment_method: "pg"
      }

      console.log('Creating payment for order:', paymentData)

      const paymentResponse = await apiClient.post(API_ENDPOINTS.PAYMENTS, paymentData)
      const payment = paymentResponse.data

      console.log('Payment created successfully:', payment)

      if (payment.payment_url) {
        // Open PhonePe payment URL in in-app browser
        const openResult = await phonepeService.openPhonePeUrl(payment.payment_url, order.id)
        
        if (openResult.success) {
          Alert.alert(
            "Payment Successful",
            "Your payment has been processed successfully!",
            [
              {
                text: "OK",
                onPress: () => {
                  fetchOrderDetails() // Refresh order details
                  navigation.navigate('Orders') // Go back to orders list
                },
              },
            ]
          )
        } else {
          Alert.alert("Payment Error", openResult.error || "Failed to process payment. Please try again.")
        }
      } else {
        Alert.alert("Payment Error", "Payment URL not received from server.")
      }
    } catch (error) {
      console.error('Payment error:', error)
      Alert.alert("Payment Error", "Failed to initiate payment. Please try again.")
    } finally {
      setPaymentLoading(false)
    }
  }

  // Helper functions using orderService
  const isOrderDelivered = () => orderService.isOrderDelivered(order)
  const canCancelOrder = () => orderService.canCancelOrder(order)
  const canReturnOrder = () => orderService.canReturnOrder(order)
  const hasPendingCancelRequest = () => orderService.hasPendingCancelRequest(order)
  const hasApprovedCancelRequest = () => orderService.hasApprovedCancelRequest(order)
  const hasPendingReturnRequest = () => orderService.hasPendingReturnRequest(order)
  const hasApprovedReturnRequest = () => orderService.hasApprovedReturnRequest(order)
  const getAllOrderItems = () => {
    const items = orderService.getAllOrderItems(order);
    console.log('getAllOrderItems called, found:', items.length, 'items');
    console.log('Order object keys:', Object.keys(order || {}));
    console.log('Order items direct:', order?.items);
    console.log('Order packages:', order?.packages);
    console.log('Order items_without_package:', order?.items_without_package);
    return items;
  }

  const toggleItemSelection = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId))
    } else {
      setSelectedItems([...selectedItems, itemId])
    }
  }

  const handleCancelRequest = async () => {
    if (selectedItems.length === 0) {
      Alert.alert("Error", "Please select at least one item to cancel")
      return
    }

    if (!cancelReason.trim()) {
      Alert.alert("Error", "Please provide a reason for cancellation")
      return
    }

    try {
      setCancelLoading(true)
      
      // Use order service to request cancellation
      const result = await orderService.requestCancellation(selectedItems, cancelReason)
      
      if (result.success) {
        // Refresh order details
        await fetchOrderDetails()
        setShowCancelModal(false)
        setSelectedItems([])
        setCancelReason('')
        
        Alert.alert("Success", result.message)
      } else {
        Alert.alert("Error", result.error)
      }
      
    } catch (error) {
      console.error('Cancellation error:', error)
      Alert.alert("Error", "Failed to submit cancellation request. Please try again.")
    } finally {
      setCancelLoading(false)
    }
  }

  const handleReturnRequest = async () => {
    if (selectedItems.length === 0) {
      Alert.alert("Error", "Please select at least one item to return")
      return
    }

    if (!returnReason.trim()) {
      Alert.alert("Error", "Please provide a reason for return")
      return
    }

    try {
      setReturnLoading(true)
      
      // Use order service to request return
      const result = await orderService.requestReturn(selectedItems, returnReason)
      
      if (result.success) {
        // Refresh order details
        await fetchOrderDetails()
        setShowReturnModal(false)
        setSelectedItems([])
        setReturnReason('')
        
        Alert.alert("Success", result.message)
      } else {
        Alert.alert("Error", result.error)
      }
      
    } catch (error) {
      console.error('Return error:', error)
      Alert.alert("Error", "Failed to submit return request. Please try again.")
    } finally {
      setReturnLoading(false)
    }
  }

  const renderOrderItem = (item, index) => (
    <View key={index} className="flex-row items-center py-4 border-b border-gray-100 last:border-b-0">
      <Image 
        source={{ 
          uri: item.product_main_image || 'https://via.placeholder.com/80x80?text=Product' 
        }} 
        className="w-20 h-20 rounded-xl mr-4 bg-gray-100"
        resizeMode="cover"
      />
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900 mb-1 leading-5">
          {item.product_listing_name}
        </Text>
        <Text className="text-sm text-gray-500 mb-2">Quantity: {item.quantity}</Text>
        
        <View className="flex-row items-center gap-2 mb-2">
          {item.mrp && item.mrp > item.price && (
            <Text className="text-sm text-gray-400 line-through">
              {formatPrice(item.mrp)}
            </Text>
          )}
          <Text className="text-base font-bold text-gray-900">
            {formatPrice(item.price)}
          </Text>
        </View>
        
        {/* Status badges */}
        <View className="flex-row flex-wrap gap-1">
          {item.cancel_requested && (
            <View className={`px-2 py-1 rounded-full ${item.cancel_approved ? 'bg-green-100' : 'bg-yellow-100'}`}>
              <Text className={`text-xs font-medium ${item.cancel_approved ? 'text-green-800' : 'text-yellow-800'}`}>
                {item.cancel_approved ? '✓ Cancelled' : '⏳ Cancel Pending'}
              </Text>
            </View>
          )}
          {item.return_requested && (
            <View className={`px-2 py-1 rounded-full ${item.return_approved ? 'bg-green-100' : 'bg-blue-100'}`}>
              <Text className={`text-xs font-medium ${item.return_approved ? 'text-green-800' : 'text-blue-800'}`}>
                {item.return_approved ? '✓ Return Approved' : '⏳ Return Pending'}
              </Text>
            </View>
          )}
        </View>
      </View>
      <View className="items-end">
        <Text className="text-lg font-bold text-gray-900">
          {formatPrice(item.subtotal)}
        </Text>
        {item.discount_amount > 0 && (
          <Text className="text-xs text-green-600 font-medium">
            Saved {formatPrice(item.discount_amount)}
          </Text>
        )}
      </View>
    </View>
  )

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <LoadingSpinner size="large" />
        <Text className="mt-4 text-base text-gray-500">Loading order details...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center px-8 bg-gray-50">
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text className="text-2xl font-bold text-gray-900 mt-6 mb-2">Error</Text>
        <Text className="text-base text-gray-500 text-center mb-8">{error}</Text>
        <TouchableOpacity 
          className="bg-blue-600 px-8 py-4 rounded-xl shadow-lg" 
          onPress={fetchOrderDetails}
        >
          <Text className="text-white text-base font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!order) {
    return (
      <View className="flex-1 justify-center items-center px-8 bg-gray-50">
        <Ionicons name="document-outline" size={64} color="#6b7280" />
        <Text className="text-2xl font-bold text-gray-900 mt-6 mb-2">Order Not Found</Text>
        <Text className="text-base text-gray-500 text-center mb-8">The order you're looking for doesn't exist.</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Order Status Header */}
        <View className="items-center px-6 py-8 bg-white rounded-b-3xl shadow-lg mb-4">
          <View className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
            order.payment_status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
          }`}>
            <Ionicons 
              name={order.payment_status === 'completed' ? 'checkmark-circle' : 'time-outline'} 
              size={32} 
              color={order.payment_status === 'completed' ? '#10b981' : '#f59e0b'} 
            />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            {order.payment_status === 'completed' ? 'Order Confirmed!' : 'Order Placed!'}
          </Text>
          <Text className="text-base text-gray-500 text-center leading-6">
            {order.payment_status === 'completed' 
              ? 'Your order has been confirmed and will be delivered soon.' 
              : 'Your order has been placed successfully. Complete payment to confirm.'
            }
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-lg border border-gray-100 mx-4">
          <View className="flex-row flex-wrap gap-3">
            {order.payment_status === 'pending' && (
              <TouchableOpacity
                className={`flex-row items-center px-6 py-3 rounded-xl shadow-lg ${
                  paymentLoading ? 'bg-gray-300' : 'bg-blue-600'
                }`}
                onPress={handlePayment}
                disabled={paymentLoading}
              >
                {paymentLoading ? (
                  <LoadingSpinner size="small" color="#ffffff" />
                ) : (
                  <Ionicons name="card-outline" size={20} color="#ffffff" />
                )}
                <Text className="text-white font-semibold ml-2 text-base">
                  {paymentLoading ? 'Processing...' : 'Pay Now via PhonePe'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className="flex-row items-center px-4 py-2 rounded-lg bg-gray-100"
              onPress={fetchOrderDetails}
            >
              <Ionicons name="refresh-outline" size={16} color="#6b7280" />
              <Text className="text-gray-600 font-medium ml-2">Refresh</Text>
            </TouchableOpacity>

            {canCancelOrder() && !hasPendingCancelRequest() && !hasApprovedCancelRequest() && (
              <TouchableOpacity
                className="flex-row items-center px-6 py-3 rounded-xl bg-red-600 shadow-lg"
                onPress={() => setShowCancelModal(true)}
              >
                <Ionicons name="close-circle-outline" size={20} color="#ffffff" />
                <Text className="text-white font-semibold ml-2 text-base">Cancel Order</Text>
              </TouchableOpacity>
            )}

            {canReturnOrder() && !hasPendingReturnRequest() && !hasApprovedReturnRequest() && (
              <TouchableOpacity
                className="flex-row items-center px-6 py-3 rounded-xl bg-yellow-600 shadow-lg"
                onPress={() => setShowReturnModal(true)}
              >
                <Ionicons name="return-down-back-outline" size={20} color="#ffffff" />
                <Text className="text-white font-semibold ml-2 text-base">Return Request</Text>
              </TouchableOpacity>
            )}

            {hasPendingCancelRequest() && (
              <View className="flex-row items-center px-4 py-2 rounded-xl bg-yellow-100 border border-yellow-200">
                <Ionicons name="time-outline" size={18} color="#d97706" />
                <Text className="text-yellow-800 font-medium ml-2">Cancellation Pending</Text>
              </View>
            )}

            {hasApprovedCancelRequest() && (
              <View className="flex-row items-center px-4 py-2 rounded-xl bg-green-100 border border-green-200">
                <Ionicons name="checkmark-circle-outline" size={18} color="#059669" />
                <Text className="text-green-800 font-medium ml-2">Cancellation Approved</Text>
              </View>
            )}

            {hasPendingReturnRequest() && (
              <View className="flex-row items-center px-4 py-2 rounded-xl bg-blue-100 border border-blue-200">
                <Ionicons name="time-outline" size={18} color="#2563eb" />
                <Text className="text-blue-800 font-medium ml-2">Return Pending</Text>
              </View>
            )}

            {hasApprovedReturnRequest() && (
              <View className="flex-row items-center px-4 py-2 rounded-xl bg-green-100 border border-green-200">
                <Ionicons name="checkmark-circle-outline" size={18} color="#059669" />
                <Text className="text-green-800 font-medium ml-2">Return Approved</Text>
              </View>
            )}
          </View>
        </View>

        {/* Order Information */}
        <View className="bg-white rounded-2xl p-6 mb-4 shadow-lg border border-gray-100 mx-4">
          <Text className="text-xl font-bold mb-4 text-gray-900">Order Information</Text>
          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-base text-gray-600">Order Number:</Text>
              <Text className="text-base font-semibold text-gray-900">{order.order_number}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-base text-gray-600">Order Date:</Text>
              <Text className="text-base font-semibold text-gray-900">{formatDate(order.created)}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-base text-gray-600">Payment Method:</Text>
              <Text className="text-base font-semibold text-gray-900">
                {formatPaymentMethod(order.payment_method || order.payment_gateway)}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-base text-gray-600">Payment Status:</Text>
              <Text className={`text-base font-semibold ${
                order.payment_status === 'completed' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {order.payment_status === 'completed' ? 'Paid' : 'Pending'}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View className="bg-white rounded-2xl p-6 mb-4 shadow-lg border border-gray-100 mx-4">
          <Text className="text-xl font-bold mb-4 text-gray-900">Order Items</Text>
          {(() => {
            const items = getAllOrderItems();
            if (items.length > 0) {
              return items.map((item, index) => renderOrderItem(item, index));
            } else if (order?.items && Array.isArray(order.items) && order.items.length > 0) {
              console.log('Using fallback items from order.items');
              return order.items.map((item, index) => renderOrderItem(item, index));
            } else {
              return (
                <View className="py-8 items-center">
                  <Ionicons name="bag-outline" size={48} color="#6b7280" />
                  <Text className="text-gray-500 mt-2 text-center">No items found in this order</Text>
                  <Text className="text-xs text-gray-400 mt-1 text-center">Please contact support if this seems incorrect</Text>
                </View>
              );
            }
          })()}
        </View>

        {/* Applied Offers/Coupons */}
        {(order.coupon || order.offer) && (
          <View className="bg-white rounded-2xl p-6 mb-4 shadow-lg border border-gray-100 mx-4">
            <Text className="text-xl font-bold mb-4 text-gray-900">Applied Discounts</Text>
            {order.coupon && (
              <View className="flex-row items-center py-3 border-b border-gray-100">
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="pricetag-outline" size={20} color="#2563eb" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 mb-1">
                    Coupon: {order.coupon.code}
                  </Text>
                  <Text className="text-lg text-green-600 font-bold">
                    -{formatPrice(order.discount_amount_coupon || 0)}
                  </Text>
                </View>
              </View>
            )}
            {order.offer && (
              <View className="flex-row items-center py-3">
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="gift-outline" size={20} color="#2563eb" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 mb-1">
                    Offer: {order.offer.name}
                  </Text>
                  <Text className="text-lg text-green-600 font-bold">
                    -{formatPrice(order.discount_amount_offer || 0)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Order Summary */}
        <View className="bg-white rounded-2xl p-6 mb-4 shadow-lg border border-gray-100 mx-4">
          <Text className="text-xl font-bold mb-4 text-gray-900">Order Summary</Text>
          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-base text-gray-600">Subtotal</Text>
              <Text className="text-base font-semibold text-gray-900">
                {formatPrice(order.total_amount + (order.total_discount || 0))}
              </Text>
            </View>
            {(order.total_discount || 0) > 0 && (
              <View className="flex-row justify-between items-center">
                <Text className="text-base text-green-600 font-medium">Total Discount</Text>
                <Text className="text-base font-bold text-green-600">
                  -{formatPrice(order.total_discount || 0)}
                </Text>
              </View>
            )}
            <View className="h-px bg-gray-200 my-2" />
            <View className="flex-row justify-between items-center">
              <Text className="text-xl font-bold text-gray-900">Total Amount</Text>
              <Text className="text-xl font-bold text-gray-900">
                {formatPrice(order.total_amount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-4 px-4 pb-8">
          <TouchableOpacity 
            className="flex-1 flex-row items-center justify-center bg-blue-600 py-4 rounded-xl shadow-lg" 
            onPress={() => navigation.navigate('Orders')}
          >
            <Ionicons name="list-outline" size={20} color="#fff" />
            <Text className="text-white text-base font-semibold ml-2">View All Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="flex-1 flex-row items-center justify-center bg-white border-2 border-blue-600 py-4 rounded-xl shadow-lg" 
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="home-outline" size={20} color="#2563eb" />
            <Text className="text-blue-600 text-base font-semibold ml-2">Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Cancel Modal */}
      <Modal visible={showCancelModal} animationType="slide" transparent>
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center px-4">
          <View className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <Text className="text-xl font-bold mb-4 text-gray-900">Cancel Order Items</Text>
            <Text className="text-sm text-gray-600 mb-4 leading-5">
              Select the items you want to cancel and provide a reason.
            </Text>
            
            <TextInput
              className="border-2 border-gray-300 rounded-xl p-4 mb-4 text-base"
              placeholder="Reason for cancellation"
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
              numberOfLines={3}
            />
            
            <View className="max-h-48">
              <Text className="text-sm font-semibold mb-3 text-gray-900">Select Items to Cancel:</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {getAllOrderItems().map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`flex-row items-center p-3 rounded-xl mb-2 ${
                      selectedItems.includes(item.id) ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50 border-2 border-gray-200'
                    }`}
                    onPress={() => toggleItemSelection(item.id)}
                  >
                    <Ionicons
                      name={selectedItems.includes(item.id) ? "checkbox" : "square-outline"}
                      size={24}
                      color={selectedItems.includes(item.id) ? "#2563eb" : "#6b7280"}
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-sm font-semibold text-gray-900">{item.product_listing_name}</Text>
                      <Text className="text-xs text-gray-500">Qty: {item.quantity}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View className="flex-row gap-3 mt-6">
              <TouchableOpacity
                className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-xl"
                onPress={() => setShowCancelModal(false)}
              >
                <Text className="text-center text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 px-4 rounded-xl shadow-lg ${
                  selectedItems.length > 0 && cancelReason.trim() ? 'bg-red-600' : 'bg-gray-300'
                }`}
                onPress={handleCancelRequest}
                disabled={cancelLoading || selectedItems.length === 0 || !cancelReason.trim()}
              >
                {cancelLoading ? (
                  <LoadingSpinner size="small" color="#ffffff" />
                ) : (
                  <Text className="text-center text-white font-semibold">Submit Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Return Modal */}
      <Modal visible={showReturnModal} animationType="slide" transparent>
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center px-4">
          <View className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <Text className="text-xl font-bold mb-4 text-gray-900">Return Order Items</Text>
            <Text className="text-sm text-gray-600 mb-4 leading-5">
              Select the items you want to return and provide a reason.
            </Text>
            
            <TextInput
              className="border-2 border-gray-300 rounded-xl p-4 mb-4 text-base"
              placeholder="Reason for return"
              value={returnReason}
              onChangeText={setReturnReason}
              multiline
              numberOfLines={3}
            />
            
            <View className="max-h-48">
              <Text className="text-sm font-semibold mb-3 text-gray-900">Select Items to Return:</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {getAllOrderItems().map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`flex-row items-center p-3 rounded-xl mb-2 ${
                      selectedItems.includes(item.id) ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50 border-2 border-gray-200'
                    }`}
                    onPress={() => toggleItemSelection(item.id)}
                  >
                    <Ionicons
                      name={selectedItems.includes(item.id) ? "checkbox" : "square-outline"}
                      size={24}
                      color={selectedItems.includes(item.id) ? "#2563eb" : "#6b7280"}
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-sm font-semibold text-gray-900">{item.product_listing_name}</Text>
                      <Text className="text-xs text-gray-500">Qty: {item.quantity}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View className="flex-row gap-3 mt-6">
              <TouchableOpacity
                className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-xl"
                onPress={() => setShowReturnModal(false)}
              >
                <Text className="text-center text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 px-4 rounded-xl shadow-lg ${
                  selectedItems.length > 0 && returnReason.trim() ? 'bg-yellow-600' : 'bg-gray-300'
                }`}
                onPress={handleReturnRequest}
                disabled={returnLoading || selectedItems.length === 0 || !returnReason.trim()}
              >
                {returnLoading ? (
                  <LoadingSpinner size="small" color="#ffffff" />
                ) : (
                  <Text className="text-center text-white font-semibold">Submit Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default OrderDetailsScreen 