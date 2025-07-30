import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/endpoints';
import { colors, spacing, typography } from '../theme';

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
    return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />;
  }
  if (!order) {
    return <View style={styles.empty}><Text>Order not found.</Text></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
      <Text style={styles.orderNumber}>Order #{order.order_number}</Text>
      <Text style={styles.status}>Status: {order.payment_status}</Text>
      <Text style={styles.date}>Placed: {new Date(order.created).toLocaleString()}</Text>
      <Text style={styles.total}>Total: ₹{order.total_amount}</Text>
      <Text style={styles.sectionTitle}>Shipping Address</Text>
      <Text style={styles.address}>{order.shipping_address?.name}</Text>
      <Text style={styles.address}>{order.shipping_address?.address?.line1}, {order.shipping_address?.address?.line2}</Text>
      <Text style={styles.address}>{order.shipping_address?.address?.city}, {order.shipping_address?.address?.state} - {order.shipping_address?.address?.pin}</Text>
      <Text style={styles.address}>Mobile: {order.shipping_address?.mobile}</Text>
      <Text style={styles.sectionTitle}>Items</Text>
      <FlatList
        data={order.items}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <Text style={styles.itemName}>{item.product_listing_name}</Text>
            <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
            <Text style={styles.itemPrice}>₹{item.price}</Text>
            <Text style={styles.itemStatus}>Status: {item.status}</Text>
          </View>
        )}
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  orderNumber: {
    fontWeight: 'bold',
    fontSize: typography.sizes.lg,
    color: colors.primary,
    marginBottom: 4,
  },
  status: {
    color: colors.success,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  date: {
    color: colors.text.secondary,
    marginBottom: 2,
  },
  total: {
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: typography.sizes.md,
    marginTop: 12,
    marginBottom: 4,
    color: colors.text.primary,
  },
  address: {
    color: colors.text.secondary,
    marginBottom: 2,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  itemName: {
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  itemQty: {
    color: colors.text.secondary,
  },
  itemPrice: {
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  itemStatus: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
});

export default OrderDetailScreen; 