import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import useCartStore from '../../stores/cartStore'
import useOffersStore from '../../stores/offersStore'
import { offerApi } from '../../services/offerApi'
import useAlert from '../../hooks/useAlert'
import Ionicons from 'react-native-vector-icons/Ionicons'

const CouponSection = () => {
  const getCartTotal = useCartStore((state) => state.getCartTotal)
  const { appliedCoupon, setAppliedCoupon, removeAppliedCoupon } = useOffersStore()
  const [couponCode, setCouponCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCouponInput, setShowCouponInput] = useState(false)
  const { alert, showError, showSuccess, showInfo, hideAlert } = useAlert()

  const cartTotal = getCartTotal()

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      showError('Please enter a coupon code')
      return
    }
    setLoading(true)
    try {
      const validation = await offerApi.validateCoupon(
        couponCode.trim(),
        cartTotal
      )
      if (validation?.is_valid) {
        setAppliedCoupon({
          code: couponCode,
          discount_type: validation.discount_type,
          discount_value: validation.discount_value,
          discount: Math.round(parseFloat(validation.discount_amount)) || 0
        })
        showSuccess('Coupon applied successfully')
        setShowCouponInput(false)
        setCouponCode('')
      } else {
        showError(validation?.message || 'Invalid coupon code')
        setCouponCode('')
      }
    } catch (error) {
      showError('Failed to validate coupon. Please try again.')
      setCouponCode('')
    } finally {
      setLoading(false)
    }
  }

  const removeCoupon = () => {
    removeAppliedCoupon()
    showInfo('Offer removed')
  }

  if (appliedCoupon) {
    return (
      <View className="my-2">
        <View className="flex-row items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
          <View className="flex-1">
            <Text className="text-sm text-gray-500 mb-1">Applied Coupon:</Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-bold text-blue-600 mr-2">{appliedCoupon.code}</Text>
              <Text className="text-green-600 text-sm">
                {appliedCoupon.discount_type === 'percentage'
                  ? `(${appliedCoupon.discount_value}% off)`
                  : `(-₹${appliedCoupon.discount.toFixed(2)})`}
              </Text>
            </View>
          </View>
          <TouchableOpacity className="px-4 py-2" onPress={removeCoupon}>
            <Text className="text-red-500 text-sm font-medium">Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View className="my-2">
      {showCouponInput ? (
        <View className="bg-white p-4 rounded-lg border border-gray-200">
          <View className="flex-row gap-2">
            <TextInput
              className="flex-1 border border-gray-200 rounded-md px-4 py-2 text-base text-gray-900"
              value={couponCode}
              onChangeText={setCouponCode}
              placeholder="Enter coupon code"
              placeholderTextColor="#6b7280"
            />
            <TouchableOpacity
              className={`bg-blue-600 px-6 py-2 rounded-md justify-center ${loading ? 'opacity-60' : ''}`}
              onPress={applyCoupon}
              disabled={loading}
            >
              <Text className="text-white text-base font-medium">{loading ? 'Applying...' : 'Apply'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          className="bg-white p-4 rounded-lg border border-gray-200 items-center"
          onPress={() => setShowCouponInput(true)}
        >
          <Text className="text-blue-600 text-base font-medium">Have a coupon code?</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

export default CouponSection
