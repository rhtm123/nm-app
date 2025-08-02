"use client"

import { useState, useRef } from "react"
import { View, Text, FlatList, TouchableOpacity, Image, Dimensions } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"

const { width } = Dimensions.get("window")

const HeroCarousel = ({ products, onProductPress }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef(null)

  const renderHeroItem = ({ item }) => (
    <View className="w-[calc(100vw-32px)] bg-white rounded-2xl mx-4 p-4 relative shadow-lg shadow-gray-300/50">
      {/* Deal Badge */}
      {item.dealBadge && (
        <View className="absolute top-2 left-2 bg-green-500 px-3 py-1 rounded-md z-10">
          <Text className="text-white text-xs font-bold">{item.dealBadge}</Text>
        </View>
      )}

      {/* Discount Badge */}
      {item.discount && (
        <View className="absolute top-2 right-2 bg-red-500 px-3 py-1 rounded-md z-10">
          <Text className="text-white text-xs font-bold">{item.discount}</Text>
        </View>
      )}

      {/* Product Image */}
      <View className="items-center my-6">
        <Image 
          source={{ uri: item.image }} 
          className="w-48 h-48"
          resizeMode="contain"
        />
      </View>

      {/* Product Info */}
      <View className="items-center">
        <Text className="text-xl font-bold text-gray-800 text-center mb-3 leading-6">
          {item.name}
        </Text>

        {/* Rating */}
        <View className="flex-row items-center mb-3">
          <View className="flex-row mr-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= item.rating ? "star" : "star-outline"}
                size={16}
                color="#f59e0b"
              />
            ))}
          </View>
          <Text className="text-sm text-gray-500 mr-1">({item.rating})</Text>
          {item.reviews && <Text className="text-sm text-gray-400">{item.reviews} reviews</Text>}
        </View>

        {/* Price */}
        <View className="flex-row items-center mb-3">
          <Text className="text-3xl font-bold text-gray-800 mr-3">₹{item.price}</Text>
          {item.originalPrice && (
            <Text className="text-lg text-gray-400 line-through">₹{item.originalPrice}</Text>
          )}
        </View>

        {/* Stock Status */}
        <Text className={`text-sm mb-4 ${item.inStock ? 'text-green-600' : 'text-red-600'}`}>
          {item.inStock ? "✓ In Stock" : "✗ Out of Stock"}
        </Text>

        {/* Get This Deal Button */}
        <TouchableOpacity
          className={`flex-row items-center px-6 py-3 rounded-xl ${
            item.inStock ? 'bg-blue-600' : 'bg-gray-300'
          }`}
          onPress={() => onProductPress(item)}
          disabled={!item.inStock}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="bag-add" 
            size={20} 
            color={item.inStock ? "#ffffff" : "#9ca3af"} 
          />
          <Text className={`font-semibold ml-1 ${
            item.inStock ? 'text-white' : 'text-gray-500'
          }`}>
            Get This Deal
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderDots = () => (
    <View className="flex-row justify-center items-center py-4">
      {products.map((_, index) => (
        <TouchableOpacity
          key={index}
          className={`h-2 rounded-full mx-1 ${
            index === currentIndex 
              ? 'bg-blue-600 w-6' 
              : 'bg-gray-300 w-2'
          }`}
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
    <View className="bg-gray-50">
      <FlatList
        ref={flatListRef}
        data={products}
        renderItem={renderHeroItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />
      {products.length > 1 && renderDots()}
    </View>
  )
}

export default HeroCarousel
