import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/endpoints';

const OrderDetailScreen = () => {
  const route = useRoute();
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(API_ENDPOINTS.ORDER_BY_ID(orderId));
      setOrder(res.data);
    } catch (e) {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }
  
  if (!order) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
          <Text className="text-2xl">❌</Text>
        </View>
        <Text className="text-xl font-bold text-gray-800 mb-2">Order Not Found</Text>
        <Text className="text-gray-600 text-center">The order you're looking for doesn't exist</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
      {/* Order Header */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow-lg shadow-gray-300/50 border border-gray-100">
        <Text className="font-bold text-blue-600 text-lg mb-1">Order #{order.order_number}</Text>
        <Text className="text-green-600 font-bold mb-1">Status: {order.payment_status}</Text>
        <Text className="text-gray-600 mb-1">Placed: {new Date(order.created).toLocaleString()}</Text>
        <Text className="text-gray-800 font-bold text-lg">Total: ₹{order.total_amount}</Text>
      </View>

      {/* Shipping Address */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow-lg shadow-gray-300/50 border border-gray-100">
        <Text className="font-bold text-gray-800 text-base mb-3">Shipping Address</Text>
        <Text className="text-gray-800 mb-1">{order.shipping_address?.name}</Text>
        <Text className="text-gray-600 mb-1">
          {order.shipping_address?.address?.line1}, {order.shipping_address?.address?.line2}
        </Text>
        <Text className="text-gray-600 mb-1">
          {order.shipping_address?.address?.city}, {order.shipping_address?.address?.state} - {order.shipping_address?.address?.pin}
        </Text>
        <Text className="text-gray-600">Mobile: {order.shipping_address?.mobile}</Text>
      </View>

      {/* Order Items */}
      <View className="bg-white rounded-2xl p-4 shadow-lg shadow-gray-300/50 border border-gray-100">
        <Text className="font-bold text-gray-800 text-base mb-3">Order Items</Text>
        <FlatList
          data={order.items}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View className="bg-gray-50 rounded-xl p-3 mb-3">
              <Text className="font-bold text-gray-800 mb-1">{item.product_listing_name}</Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">Qty: {item.quantity}</Text>
                <Text className="text-gray-800 font-bold">₹{item.price}</Text>
              </View>
              <Text className="text-blue-600 font-bold mt-1">Status: {item.status}</Text>
            </View>
          )}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
};

export default OrderDetailScreen; 