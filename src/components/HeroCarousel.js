import React, { useState, useRef, memo } from "react"
import { View, Text, FlatList, TouchableOpacity, Image, Dimensions } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { colors } from '../theme'
import StarRating from './ui/StarRating'

const { width } = Dimensions.get("window")
const CARD_WIDTH = width - 48 // Account for margins and spacing

const HeroCarousel = ({ products, onProductPress }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef(null)

  // Calculate discount percentage
  const getDiscountPercentage = (mrp, price) => {
    if (!mrp || !price || mrp <= price) return null
    return Math.round(((mrp - price) / mrp) * 100)
  }

  const renderHeroItem = ({ item, index }) => {
    const discountPercent = getDiscountPercentage(item.mrp, item.price)
    const inStock = item.stock > 0
    
    // Alternate between different layouts for variety
    const isEvenCard = index % 2 === 0
    
    return (
      <TouchableOpacity 
        onPress={() => onProductPress(item)}
        activeOpacity={0.95}
        style={{ width: CARD_WIDTH }}
        className="mx-2"
      >
        <View 
          style={{
            background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
            backgroundColor: isEvenCard ? colors.primary : colors.accent
          }} 
          className="rounded-3xl overflow-hidden shadow-xl relative"
        >
          {/* Background Pattern */}
          <View className="absolute inset-0 opacity-10">
            <View 
              style={{
                backgroundColor: colors.text.white,
                transform: [{ rotate: '45deg' }]
              }}
              className="w-32 h-32 rounded-full absolute -top-16 -right-16"
            />
            <View 
              style={{
                backgroundColor: colors.text.white,
                transform: [{ rotate: '-45deg' }]
              }}
              className="w-24 h-24 rounded-full absolute -bottom-12 -left-12"
            />
          </View>

          {/* Badges */}
          <View className="absolute top-4 left-4 right-4 flex-row justify-between z-10">
            {discountPercent && (
              <View 
                style={{ backgroundColor: colors.error }} 
                className="px-3 py-2 rounded-full shadow-lg"
              >
                <Text style={{ color: colors.text.white }} className="text-sm font-bold">
                  {discountPercent}% OFF
                </Text>
              </View>
            )}
            <View className="flex-1" />
            <View 
              style={{ backgroundColor: colors.warning }} 
              className="px-3 py-2 rounded-full shadow-lg"
            >
              <Text style={{ color: colors.text.white }} className="text-sm font-bold">
                ⭐ FEATURED
              </Text>
            </View>
          </View>

          {/* Main Content - Side by side layout */}
          <View className="flex-row items-center p-6 pt-16">
            {/* Left Side - Product Info */}
            <View className="flex-1 pr-4">
              {/* Brand */}
              {item.brand?.name && (
                <Text style={{ color: colors.text.white }} className="text-sm font-bold mb-2 uppercase tracking-widest opacity-80">
                  {item.brand.name}
                </Text>
              )}

              {/* Product Name */}
              <Text style={{ color: colors.text.white }} className="text-2xl font-black mb-3 leading-tight" numberOfLines={3}>
                {item.name}
              </Text>

              {/* Variant */}
              {item.variant_name && (
                <Text style={{ color: colors.text.white }} className="text-sm mb-3 opacity-90">
                  {item.variant_name}
                </Text>
              )}

              {/* Rating */}
              {item.rating > 0 && (
                <View className="flex-row items-center mb-4">
                  <View className="flex-row">
                    {[...Array(5)].map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < Math.floor(item.rating) ? "star" : "star-outline"}
                        size={14}
                        color={colors.warning}
                      />
                    ))}
                  </View>
                  <Text style={{ color: colors.text.white }} className="text-sm ml-2 font-semibold opacity-90">
                    {item.rating} ({item.review_count || 0})
                  </Text>
                </View>
              )}

              {/* Price Section */}
              <View className="flex-row items-baseline mb-4">
                <Text style={{ color: colors.text.white }} className="text-4xl font-black">
                  ₹{item.price}
                </Text>
                {item.mrp && item.mrp > item.price && (
                  <Text style={{ color: colors.text.white }} className="text-lg line-through ml-2 opacity-70">
                    ₹{item.mrp}
                  </Text>
                )}
              </View>

              {/* Stock Status */}
              <View className="flex-row items-center mb-6">
                <View 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: inStock ? colors.success : colors.error }}
                />
                <Text 
                  style={{ color: colors.text.white }} 
                  className="text-sm font-bold opacity-90"
                >
                  {inStock ? `${item.stock} in stock` : "Out of Stock"}
                </Text>
              </View>
            </View>

            {/* Right Side - Product Image */}
            <View className="items-center">
              <View 
                style={{ 
                  backgroundColor: colors.text.white,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 16
                }}
                className="w-40 h-40 rounded-3xl items-center justify-center p-4"
              >
                <Image 
                  source={{ 
                    uri: item.main_image || item.thumbnail || "/placeholder.svg?height=200&width=200" 
                  }} 
                  className="w-32 h-32"
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          {/* Bottom Action Button */}
          <View className="px-6 pb-6">
            <TouchableOpacity
              style={{
                backgroundColor: colors.text.white,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8
              }}
              className="flex-row items-center justify-center py-4 rounded-2xl"
              onPress={() => onProductPress(item)}
              disabled={!inStock}
              activeOpacity={0.9}
            >
              <Ionicons 
                name={inStock ? "bag-add" : "ban"} 
                size={24} 
                color={inStock ? (isEvenCard ? colors.primary : colors.accent) : colors.text.light} 
              />
              <Text 
                style={{ color: inStock ? (isEvenCard ? colors.primary : colors.accent) : colors.text.light }} 
                className="text-xl font-black ml-3"
              >
                {inStock ? "Add to Cart" : "Out of Stock"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const renderDots = () => (
    <View className="flex-row justify-center items-center py-3">
      {products.map((_, index) => (
        <TouchableOpacity
          key={index}
          style={{
            backgroundColor: index === currentIndex ? colors.primary : colors.gray[200],
            width: index === currentIndex ? 24 : 8,
            height: 8,
            borderRadius: 12,
            marginHorizontal: 4,
            shadowColor: index === currentIndex ? colors.primary : 'transparent',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
            elevation: index === currentIndex ? 3 : 0
          }}
          onPress={() => {
            setCurrentIndex(index)
            flatListRef.current?.scrollToIndex({ index, animated: true })
          }}
          activeOpacity={0.7}
        />
      ))}
    </View>
  )

  const onViewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index)
    }
  }

  return (
    <View style={{ backgroundColor: colors.backgroundSecondary }} className="py-2">
      <FlatList
        ref={flatListRef}
        data={products}
        renderItem={renderHeroItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 32} // Card width + spacing
        snapToAlignment="center"
        contentContainerStyle={{ 
          paddingVertical: 16,
          paddingHorizontal: 16 
        }}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
      />
      {products.length > 1 && renderDots()}
    </View>
  )
}

export default memo(HeroCarousel)
