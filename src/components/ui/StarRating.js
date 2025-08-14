import React, { memo } from 'react'
import { View } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { colors } from '../../theme'

const StarRating = memo(({ rating = 0, size = 12, showEmpty = true }) => {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Ionicons 
        key={i} 
        name="star" 
        size={size} 
        color={colors.rating} 
      />
    )
  }

  // Add half star
  if (hasHalfStar) {
    stars.push(
      <Ionicons 
        key="half" 
        name="star-half" 
        size={size} 
        color={colors.rating} 
      />
    )
  }

  // Add empty stars
  if (showEmpty) {
    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons 
          key={`empty-${i}`} 
          name="star-outline" 
          size={size} 
          color={colors.text.light} 
        />
      )
    }
  }

  return (
    <View className="flex-row items-center">
      {stars}
    </View>
  )
})

StarRating.displayName = 'StarRating'

export default StarRating
