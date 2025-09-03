import React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Ionicons from "react-native-vector-icons/Ionicons"
import useAuthStore from "../stores/authStore"
import { colors } from "../theme"

const Header = ({ title, showBack = false, showSearch = true, route, options }) => {
  const navigation = useNavigation()
  const { user } = useAuthStore()
  
  // Get title from navigation options or fallback
  const headerTitle = options?.title || title || (route?.name === 'Checkout' ? 'Checkout' : route?.name === 'Search' ? 'Search Products' : 'Naigaon Market')
  
  // Auto-detect if we should show back button based on route
  const shouldShowBack = showBack || (route && route.name !== 'MainTabs')

  return (
    <View className="bg-white px-4 py-4 shadow-sm" style={{ paddingTop: 50 }}>
      <View className="flex-row items-center justify-between">
        {/* Left side - Back button or Logo */}
        {shouldShowBack ? (
          <View className="flex-row items-center flex-1">
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              className="w-10 h-10 bg-blue-50 rounded-lg items-center justify-center mr-3"
            >
              <Ionicons name="arrow-back" size={20} color={colors.primary} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">
                {headerTitle}
              </Text>
            </View>
          </View>
        ) : (
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center mr-3">
              <Text className="text-blue-600 font-bold text-lg">NM</Text>
            </View>
            <View>
              <Text className="text-lg font-bold text-gray-900">
                {route && route.name !== 'MainTabs' ? headerTitle : (title || "Naigaon Market")}
              </Text>
              {(!route || route.name === 'MainTabs') && (
                <Text className="text-xs text-gray-500">Delivering to your doorstep</Text>
              )}
            </View>
          </View>
        )}

        {/* Right Actions */}
        <View className="flex-row items-center space-x-3">
          {/* Search */}
          {showSearch && route?.name !== 'Search' && (
            <TouchableOpacity 
              onPress={() => navigation?.navigate("Search")}
              className="w-10 h-10 bg-blue-50 rounded-lg items-center justify-center"
            >
              <Ionicons name="search" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}

          {/* Notifications */}
          <TouchableOpacity 
            className="w-10 h-10 bg-blue-50 rounded-lg items-center justify-center relative"
          >
            <Ionicons name="notifications-outline" size={20} color={colors.primary} />
            <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default Header
