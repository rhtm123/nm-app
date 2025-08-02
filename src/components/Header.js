import React from "react"
import { View, Text, TouchableOpacity, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Ionicons from "react-native-vector-icons/Ionicons"
import useAuthStore from "../stores/authStore"
import { useCart } from "../context/CartContext"
import InitialsAvatar from './InitialsAvatar';

const Header = ({ title, showBack = false, showCart = true, showProfile = true }) => {
  const navigation = useNavigation()
  const { user } = useAuthStore()
  const { getCartItemsCount } = useCart()
  const cartItemsCount = getCartItemsCount()

  return (
    <View className="flex-row items-center justify-between px-4 py-2 bg-white border-b border-gray-100 shadow-lg mt-10">
      {/* Logo and Title */}
      <View className="flex-row items-center flex-1">
        <Image 
          source={require('../../assets/img/logo.png')}
          className="w-12 h-12 mr-3"
          resizeMode="contain"
        />
        <Text className="text-gray-900 text-xl font-bold flex-1">
          {title || "Naigaon Market"}
        </Text>
      </View>

      {/* Right Actions */}
      <View className="flex-row items-center space-x-6">
        {/* Sign In/Profile */}
        {showProfile && (
          <TouchableOpacity 
            className="items-center" 
            onPress={() => navigation?.navigate("Profile")}
            activeOpacity={0.8}
          >
            {user ? (
              <View className="items-center">
                <InitialsAvatar 
                  name={user.name || user.username || ''} 
                  size={40} 
                  className="border-2 border-blue-500 rounded-full shadow-lg" 
                />
                <Text className="text-xs text-gray-600 mt-1 font-semibold">Profile</Text>
              </View>
            ) : (
              <View className="items-center">
                <View className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full items-center justify-center shadow-lg">
                  <Ionicons name="person-outline" size={22} color="#3b82f6" />
                </View>
                <Text className="text-xs text-gray-600 mt-1 font-semibold">Sign In</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Cart */}
        {showCart && (
          <TouchableOpacity 
            className="items-center" 
            onPress={() => navigation?.navigate("Cart")}
            activeOpacity={0.8}
          >
            <View className="relative">
              <View className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full items-center justify-center shadow-lg">
                <Ionicons name="bag-outline" size={22} color="#3b82f6" />
              </View>
              {cartItemsCount > 0 && (
                <View className="absolute -top-2 -right-2 bg-red-500 rounded-full min-w-[22px] h-6 items-center justify-center shadow-lg">
                  <Text className="text-white text-xs font-bold">
                    {cartItemsCount > 99 ? '99+' : cartItemsCount}
                  </Text>
                </View>
              )}
            </View>
            <Text className="text-xs text-gray-600 mt-1 font-semibold">Cart</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default Header
