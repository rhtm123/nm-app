import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAuthStore from '../stores/authStore';
import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/endpoints';
import LoadingSpinner from '../components/LoadingSpinner';

const OrdersScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(API_ENDPOINTS.ORDERS, {
        params: { user_id: user?.id, items_needed: true, page_size: 20 },
      });
      setOrders(res.data.results || []);
    } catch (e) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity 
      className="bg-white rounded-2xl p-4 mb-4 shadow-lg shadow-gray-300/50 border border-gray-100"
      onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
      activeOpacity={0.8}
    >
      <View className="flex-row justify-between mb-1">
        <Text className="font-bold text-gray-800 text-base">Order #{item.order_number}</Text>
        <Text className="text-blue-600 font-bold capitalize">{item.payment_status}</Text>
      </View>
      <Text className="text-gray-600 text-sm mb-1">{new Date(item.created).toLocaleString()}</Text>
      <Text className="text-gray-800 font-bold mb-2">Total: ₹{item.total_amount}</Text>
      <FlatList
        data={item.items}
        keyExtractor={itm => itm.id.toString()}
        renderItem={({ item: orderItem }) => (
          <Text className="bg-gray-50 rounded-lg px-3 py-1 mr-2 text-sm text-gray-600">
            {orderItem.product_listing_name} x{orderItem.quantity}
          </Text>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-1"
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!orders.length) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
          <Text className="text-2xl">📦</Text>
        </View>
        <Text className="text-xl font-bold text-gray-800 mb-2">No Orders Yet</Text>
        <Text className="text-gray-600 text-center">Your order history will appear here</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={orders}
        keyExtractor={item => item.id.toString()}
        renderItem={renderOrder}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default OrdersScreen; 