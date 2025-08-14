import React, { memo } from 'react'
import { View, ActivityIndicator } from "react-native"
import { colors } from '../theme'

const LoadingSpinner = memo(({ size = "large", color = colors.primary }) => {
  return (
    <View className="flex-1 justify-center items-center p-6">
      <ActivityIndicator size={size} color={color} />
    </View>
  )
})

LoadingSpinner.displayName = 'LoadingSpinner'

export default LoadingSpinner
