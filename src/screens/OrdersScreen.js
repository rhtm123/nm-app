import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useAuthStore from '../stores/authStore';
import orderService from '../services/orderService';
import LoadingSpinner from '../components/LoadingSpinner';

const OrdersScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const result = await orderService.getOrders({
        user_id: user?.id, 
        items_needed: true, 
        page_size: 20
      });
      
      if (result.success) {
        setOrders(result.data.results || []);
      } else {
        console.error('Error fetching orders:', result.error);
        setOrders([]);
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR', 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'pending':
        return 'time-outline';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'ellipse-outline';
    }
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity 
      className="bg-white rounded-2xl p-4 mb-4 shadow-lg shadow-gray-300/50 border border-gray-100 mx-4"
      onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
      activeOpacity={0.8}
    >
      {/* Order Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="font-bold text-gray-800 text-lg">Order #{item.order_number}</Text>
          <Text className="text-gray-500 text-sm mt-1">{formatDate(item.created)}</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons 
            name={getStatusIcon(item.payment_status)} 
            size={20} 
            color={item.payment_status === 'completed' ? '#10b981' : '#f59e0b'} 
          />
          <Text className={`font-bold capitalize ml-1 ${getStatusColor(item.payment_status)}`}>
            {item.payment_status}
          </Text>
        </View>
      </View>

      {/* Order Items Preview */}
      <View className="mb-3">
        {item.items && item.items.slice(0, 3).map((orderItem, index) => (
          <View key={index} className="flex-row items-center py-2 border-b border-gray-50 last:border-b-0">
            <Image 
              source={{ 
                uri: orderItem.product_main_image || 'https://via.placeholder.com/60x60?text=Product' 
              }} 
              className="w-12 h-12 rounded-lg mr-3 bg-gray-100"
              resizeMode="cover"
            />
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-900 leading-4" numberOfLines={2}>
                {orderItem.product_listing_name}
              </Text>
              <Text className="text-xs text-gray-500 mt-1">
                Qty: {orderItem.quantity} • {formatPrice(orderItem.price)}
              </Text>
            </View>
          </View>
        ))}
        {item.items && item.items.length > 3 && (
          <Text className="text-xs text-gray-500 text-center mt-2">
            +{item.items.length - 3} more items
          </Text>
        )}
      </View>

      {/* Order Summary */}
      <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
        <View>
          <Text className="text-sm text-gray-600">Total Amount</Text>
          <Text className="text-lg font-bold text-gray-900">{formatPrice(item.total_amount)}</Text>
        </View>
        <TouchableOpacity 
          className="bg-blue-600 px-4 py-2 rounded-lg"
          onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
        >
          <Text className="text-white font-medium text-sm">View Details</Text>
        </TouchableOpacity>
      </View>

      {/* Payment Status Badge */}
      {item.payment_status === 'pending' && (
        <View className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
          <Text className="text-xs text-yellow-800 text-center font-medium">
            ⚠️ Payment pending - Complete payment to confirm your order
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <LoadingSpinner size="large" />
        <Text className="mt-4 text-base text-gray-500">Loading your orders...</Text>
      </View>
    );
  }

  if (!orders.length) {
    return (
      <View className="flex-1 justify-center items-center p-8 bg-gray-50">
        <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="bag-outline" size={40} color="#6b7280" />
        </View>
        <Text className="text-xl font-bold text-gray-800 mb-2">No Orders Yet</Text>
        <Text className="text-gray-600 text-center mb-8 leading-6">
          Your order history will appear here once you place your first order
        </Text>
        <TouchableOpacity 
          className="bg-blue-600 px-8 py-4 rounded-xl shadow-lg"
          onPress={() => navigation.navigate('Home')}
        >
          <Text className="text-white text-base font-semibold">Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={orders}
        keyExtractor={item => item.id.toString()}
        renderItem={renderOrder}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

export default OrdersScreen; 