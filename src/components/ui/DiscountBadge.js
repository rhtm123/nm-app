import React, { memo } from 'react'
import { View, Text } from 'react-native'
import { colors } from '../../theme'

const DiscountBadge = memo(({ mrp, price, className = "", style = {} }) => {
  if (!mrp || !price || mrp <= price) return null

  const discount = Math.round(((mrp - price) / mrp) * 100)
  
  if (discount <= 0) return null

  return (
    <View 
      style={{ 
        backgroundColor: colors.orange, 
        position: 'absolute', 
        top: 6, 
        left: 6, 
        zIndex: 10,
        ...style 
      }} 
      className={`px-1.5 py-0.5 rounded ${className}`}
    >
      <Text style={{ color: colors.text.white }} className="text-xs font-bold">
        {discount}% OFF
      </Text>
    </View>
  )
})

DiscountBadge.displayName = 'DiscountBadge'

export default DiscountBadge
