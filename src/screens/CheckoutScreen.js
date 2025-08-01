import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { useCart } from "../context/CartContext"
import useAuthStore from "../stores/authStore"
import { colors, spacing, typography } from "../theme"
import LoadingSpinner from "../components/LoadingSpinner"
import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/endpoints';

const CheckoutScreen = () => {
  const navigation = useNavigation()
  const { cartItems, cartTotal, clearCart } = useCart()
  const { user } = useAuthStore()
  // Redirect to login if not logged in
  if (!user) {
    useEffect(() => {
      navigation.navigate('Profile');
    }, []);
    return null;
  }
  const [loading, setLoading] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState("cod")

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
      // Optionally show error
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartTotal + getCartSavings()
  const savings = getCartSavings()
  const deliveryFee = 50
  const total = cartTotal + deliveryFee

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert("Error", "Please select a delivery address")
      return
    }

    setLoading(true)

    // Simulate order placement
    setTimeout(() => {
      setLoading(false)
      clearCart()
      Alert.alert(
        "Order Placed!",
        "Your order has been placed successfully. You will receive a confirmation shortly.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Home"),
          },
        ],
      )
    }, 2000)
  }

  const renderOrderSummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Order Summary</Text>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Subtotal ({cartItems.length} items)</Text>
        <Text style={styles.summaryValue}>₹{subtotal}</Text>
      </View>

      {savings > 0 && (
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.success }]}>Savings</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>-₹{savings}</Text>
        </View>
      )}

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Delivery Fee</Text>
        <Text style={styles.summaryValue}>₹{deliveryFee}</Text>
      </View>

      <View style={styles.summaryDivider} />

      <View style={styles.summaryRow}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalValue}>₹{total}</Text>
      </View>
    </View>
  )

  const renderDeliveryAddress = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Delivery Address</Text>
      {addresses.length === 0 ? (
        <TouchableOpacity onPress={() => navigation.navigate('Addresses')} style={[styles.addressCard, { justifyContent: 'center' }]}>
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>+ Add Address</Text>
        </TouchableOpacity>
      ) : (
        addresses.map(addr => (
          <TouchableOpacity
            key={addr.id}
            style={[styles.addressCard, selectedAddress?.id === addr.id && { borderColor: colors.primary, backgroundColor: '#e6f0ff' }]}
            onPress={() => setSelectedAddress(addr)}
          >
            <Ionicons name="location-outline" size={24} color={colors.primary} />
            <View style={styles.addressInfo}>
              <Text style={styles.addressName}>{addr.name}</Text>
              <Text style={styles.addressText}>{addr.address?.line1}, {addr.address?.line2}, {addr.address?.city}, {addr.address?.state} - {addr.address?.pin}</Text>
              <Text style={styles.addressPhone}>{addr.mobile}</Text>
            </View>
            {selectedAddress?.id === addr.id && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
          </TouchableOpacity>
        ))
      )}
      <TouchableOpacity onPress={() => navigation.navigate('Addresses')} style={{ marginTop: 8 }}>
        <Text style={{ color: colors.primary }}>Manage Addresses</Text>
      </TouchableOpacity>
    </View>
  )

  const renderPaymentMethod = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Payment Method</Text>

      <TouchableOpacity
        style={[styles.paymentOption, paymentMethod === "cod" && styles.selectedPaymentOption]}
        onPress={() => setPaymentMethod("cod")}
      >
        <Ionicons
          name={paymentMethod === "cod" ? "radio-button-on" : "radio-button-off"}
          size={20}
          color={colors.primary}
        />
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentTitle}>Cash on Delivery</Text>
          <Text style={styles.paymentSubtitle}>Pay when you receive your order</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.paymentOption, paymentMethod === "online" && styles.selectedPaymentOption]}
        onPress={() => setPaymentMethod("online")}
      >
        <Ionicons
          name={paymentMethod === "online" ? "radio-button-on" : "radio-button-off"}
          size={20}
          color={colors.primary}
        />
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentTitle}>Online Payment</Text>
          <Text style={styles.paymentSubtitle}>Pay using UPI, Card, or Net Banking</Text>
        </View>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Remove custom Header usage at the top, as the stack navigator will provide the header. */}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderDeliveryAddress()}
        {renderPaymentMethod()}
        {renderOrderSummary()}
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total: ₹{total}</Text>
          {savings > 0 && <Text style={styles.savingsText}>You save ₹{savings}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.placeOrderButton, loading && styles.disabledButton]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <LoadingSpinner size="small" color={colors.background} />
          ) : (
            <>
              <Text style={styles.placeOrderText}>Place Order</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.background} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },

  // Section
  section: {
    backgroundColor: colors.background,
    marginBottom: spacing.sm,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },

  // Address
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  addressInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  addressName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  addressText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  addressPhone: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },

  // Payment
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  selectedPaymentOption: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  paymentInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  paymentTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  paymentSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },

  // Summary
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  totalLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },

  // Bottom
  bottomContainer: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
  },
  totalContainer: {
    marginBottom: spacing.md,
  },
  totalText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: "center",
  },
  savingsText: {
    fontSize: typography.sizes.sm,
    color: colors.success,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  placeOrderButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  placeOrderText: {
    color: colors.background,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    marginRight: spacing.sm,
  },
})

export default CheckoutScreen
