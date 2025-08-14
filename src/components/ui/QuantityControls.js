import React, { memo } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { colors } from '../../theme'

const QuantityControls = memo(({ 
  quantity = 0, 
  onIncrease, 
  onDecrease, 
  maxQuantity = 10, 
  isLoading = false,
  size = 'normal' // 'small' | 'normal' | 'large'
}) => {
  const sizeConfig = {
    small: { button: 'w-6 h-6', icon: 12, text: 'text-xs' },
    normal: { button: 'w-9 h-9', icon: 14, text: 'text-lg' },
    large: { button: 'w-12 h-12', icon: 16, text: 'text-xl' }
  }

  const config = sizeConfig[size]
  const canDecrease = quantity > 0 && !isLoading
  const canIncrease = quantity < maxQuantity && !isLoading

  return (
    <View style={{ backgroundColor: colors.gray[50] }} className="flex-row items-center rounded-xl p-1">
      <TouchableOpacity 
        style={{
          backgroundColor: canDecrease ? colors.primary : colors.gray[200],
          opacity: canDecrease ? 1 : 0.5
        }}
        className={`${config.button} rounded-lg items-center justify-center`}
        onPress={onDecrease} 
        disabled={!canDecrease}
        activeOpacity={0.7}
      >
        {quantity === 1 ? (
          <Ionicons name="trash-outline" size={config.icon} color={colors.text.white} />
        ) : (
          <Ionicons name="remove" size={config.icon} color={colors.text.white} />
        )}
      </TouchableOpacity>
      
      <Text style={{ color: colors.text.primary }} className={`${config.text} font-bold mx-4 min-w-[30px] text-center`}>
        {quantity}
      </Text>
      
      <TouchableOpacity 
        style={{
          backgroundColor: canIncrease ? colors.primary : colors.gray[200],
          opacity: canIncrease ? 1 : 0.5
        }}
        className={`${config.button} rounded-lg items-center justify-center`}
        onPress={onIncrease} 
        disabled={!canIncrease}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={config.icon} color={colors.text.white} />
      </TouchableOpacity>
    </View>
  )
})

QuantityControls.displayName = 'QuantityControls'

export default QuantityControls
