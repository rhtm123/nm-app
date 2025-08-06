import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native'
import { useCart } from '../../context/CartContext'
import useOffersStore from '../../stores/offersStore'
import { offerApi } from '../../services/offerApi'
import Ionicons from 'react-native-vector-icons/Ionicons'

const AvailableOffers = () => {
  const { cartItems, getCartTotal } = useCart()
  const { appliedOffer, setAppliedOffer, removeAppliedOffer, appliedCoupon } = useOffersStore()
  const [loading, setLoading] = useState(false)
  const [availableOffers, setAvailableOffers] = useState([])
  const [isExpanded, setIsExpanded] = useState(false)

  const cartTotal = getCartTotal()

  useEffect(() => {
    if (cartItems.length > 0) {
      loadAvailableOffers()
    }
  }, [cartItems])

  const loadAvailableOffers = async () => {
    setLoading(true)
    try {
      const offers = await offerApi.getActiveOffers()
      const offersArray = Array.isArray(offers) ? offers : (offers?.results || [])
      const filteredOffers = offersArray.filter(offer => 
        offer.id !== appliedOffer?.id && 
        offer.offer_scope === 'cart' &&
        offer.is_active &&
        new Date(offer.valid_until) > new Date()
      )
      setAvailableOffers(filteredOffers)
    } catch (error) {
      Alert.alert('Error', 'Failed to load offers')
    } finally {
      setLoading(false)
    }
  }

  const applyOffer = async (offer) => {
    if (appliedCoupon) {
      Alert.alert('Error', 'Please remove the applied coupon before applying an offer')
      return
    }
    setLoading(true)
    try {
      if (!cartItems || cartItems.length === 0) {
        Alert.alert('Error', 'Your cart is empty')
        return
      }
      const productIds = cartItems.map(item => item.id)
      const quantities = cartItems.map(item => item.quantity)
      const validation = await offerApi.validateOffer(
        offer.id,
        productIds,
        quantities
      )
      if (validation?.is_valid) {
        const offerData = {
          ...offer,
          discount_amount: Math.round(parseFloat(validation.discount_amount)) || 0
        }
        setAppliedOffer(offerData)
        Alert.alert('Success', 'Offer applied successfully')
        setAvailableOffers(prev => prev.filter(o => o.id !== offer.id))
        setIsExpanded(false)
      } else {
        Alert.alert('Error', validation?.message || 'Offer cannot be applied')
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to apply offer. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const removeOffer = (offer) => {
    removeAppliedOffer()
    setAvailableOffers(prev => [...prev, offer])
    Alert.alert('Info', 'Offer removed')
  }

  const formatDiscount = (offer) => {
    if (offer.offer_type === 'discount') {
      return `${offer.get_discount_percent}% off on cart total`
    }
    return ''
  }
  const formatMinCartValue = (value) => `₹${parseFloat(value).toFixed(2)}`

  if (appliedOffer) {
    return (
      <View className="my-2">
        <Text className="text-base font-bold mb-2">Applied Cart Offer</Text>
        <View className="flex-row items-center justify-between bg-green-50 p-4 rounded-lg border border-green-200">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="bg-green-600 text-white text-xs font-medium rounded px-2 py-0.5 uppercase mr-2">Cart Offer</Text>
              <Text className="font-medium text-green-700">{appliedOffer.name}</Text>
            </View>
            <Text className="text-sm text-gray-600 mb-1">{appliedOffer.description}</Text>
            <Text className="text-green-700 text-sm font-bold">Discount: ₹{appliedOffer.discount_amount}</Text>
          </View>
          <TouchableOpacity className="px-4 py-2" onPress={() => removeOffer(appliedOffer)}>
            <Text className="text-red-500 text-sm font-medium">Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
  if (appliedCoupon) return null
  if (availableOffers.length === 0 && !loading) {
    return (
      <View className="my-2">
        <Text className="text-center text-gray-400 py-4">No cart offers available</Text>
      </View>
    )
  }
  return (
    <View className="my-2">
      {availableOffers.length > 0 && (
        <TouchableOpacity className="w-full p-4 flex-row justify-between items-center bg-white rounded-lg border border-gray-200 mb-2" onPress={() => setIsExpanded(!isExpanded)}>
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-semibold">Available Cart Offers</Text>
            <Text className="bg-blue-600 text-white text-xs font-bold rounded px-2 py-0.5">{availableOffers.length}</Text>
          </View>
          <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#1f2937" />
        </TouchableOpacity>
      )}
      {isExpanded && (
        <View className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
          <ScrollView showsVerticalScrollIndicator={false}>
            {availableOffers.map(offer => (
              <View key={offer.id} className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text className="bg-blue-600 text-white text-xs font-medium rounded px-2 py-0.5 uppercase mr-2">Cart Offer</Text>
                      <Text className="font-semibold text-blue-700">{offer.name}</Text>
                    </View>
                    <Text className="text-sm text-gray-600 mb-1">{offer.description}</Text>
                    <Text className="text-blue-700 text-sm font-bold mb-1">{formatDiscount(offer)}</Text>
                    {offer.min_cart_value > 0 && (
                      <Text className="text-xs text-gray-500 mb-1">Minimum cart value: {formatMinCartValue(offer.min_cart_value)}</Text>
                    )}
                    {offer.valid_until && (
                      <Text className="text-xs text-gray-500">Valid till: {new Date(offer.valid_until).toLocaleDateString()}</Text>
                    )}
                  </View>
                  <TouchableOpacity className={`bg-blue-600 px-4 py-2 rounded-md ml-2 ${loading ? 'opacity-60' : ''}`} disabled={loading} onPress={() => applyOffer(offer)}>
                    <Text className="text-white text-base font-medium">{loading ? 'Applying...' : 'Apply'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      {loading && (
        <View className="flex items-center py-4">
          <Text className="text-gray-400">Loading offers...</Text>
        </View>
      )}
    </View>
  )
}

export default AvailableOffers 