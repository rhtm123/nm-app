import React, { memo } from 'react'
import { View, Text, TouchableOpacity } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { colors } from '../theme'

const ErrorMessage = memo(({ message, onRetry }) => {
  return (
    <View className="flex-1 justify-center items-center p-6">
      <View className="items-center">
        <View 
          style={{ backgroundColor: colors.errorLight }} 
          className="w-16 h-16 rounded-full items-center justify-center mb-4"
        >
          <Ionicons name="alert-circle-outline" size={32} color={colors.error} />
        </View>
        <Text 
          style={{ color: colors.text.secondary }} 
          className="text-lg text-center mb-6 leading-6"
        >
          {message}
        </Text>
        {onRetry && (
          <TouchableOpacity 
            style={{ backgroundColor: colors.primary }}
            className="px-6 py-3 rounded-xl"
            onPress={onRetry}
            activeOpacity={0.8}
          >
            <Text style={{ color: colors.text.white }} className="font-semibold text-base">
              Try Again
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
})

ErrorMessage.displayName = 'ErrorMessage'

export default ErrorMessage
