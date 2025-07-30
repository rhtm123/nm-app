import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/endpoints';
import { colors, spacing, typography } from '../theme';

const OrdersScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
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
    <TouchableOpacity style={styles.orderCard} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>Order #{item.order_number}</Text>
        <Text style={styles.orderStatus}>{item.payment_status}</Text>
      </View>
      <Text style={styles.orderDate}>{new Date(item.created).toLocaleString()}</Text>
      <Text style={styles.orderTotal}>Total: ₹{item.total_amount}</Text>
      <FlatList
        data={item.items}
        keyExtractor={itm => itm.id.toString()}
        renderItem={({ item: orderItem }) => (
          <Text style={styles.orderItem}>{orderItem.product_listing_name} x{orderItem.quantity}</Text>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 4 }}
      />
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />;
  }

  if (!orders.length) {
    return <View style={styles.empty}><Text>No orders found.</Text></View>;
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={item => item.id.toString()}
      renderItem={renderOrder}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: spacing.md,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  orderNumber: {
    fontWeight: 'bold',
    color: colors.text.primary,
    fontSize: typography.sizes.md,
  },
  orderStatus: {
    color: colors.primary,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  orderDate: {
    color: colors.text.secondary,
    fontSize: typography.sizes.sm,
    marginBottom: 2,
  },
  orderTotal: {
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  orderItem: {
    backgroundColor: colors.background,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
});

export default OrdersScreen; 