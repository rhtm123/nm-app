import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // For grid layout

const CategoryCard = ({ 
  item, 
  onPress, 
  variant = 'list', // 'list' or 'grid'
  showProductCount = false,
  productCount = 0
}) => {
  // Category icon mapping based on name
  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('stationery') || name.includes('notebook')) return 'document-text';
    if (name.includes('grocery') || name.includes('food')) return 'basket';
    if (name.includes('drink') || name.includes('water') || name.includes('beverage')) return 'water';
    if (name.includes('beauty') || name.includes('personal') || name.includes('care')) return 'flower';
    if (name.includes('fragrance') || name.includes('perfume')) return 'sparkles';
    if (name.includes('deodorant')) return 'shield-checkmark';
    return 'apps';
  };

  // More subtle and professional colors
  const getCategoryColor = (level) => {
    const colorOptions = [
      colors.primary,
      '#6366f1', // Indigo
      '#8b5cf6', // Purple  
      '#06b6d4', // Cyan
      '#10b981', // Emerald
      '#f59e0b', // Amber
      '#ef4444', // Red
      '#ec4899', // Pink
    ];
    return colorOptions[(level - 1) % colorOptions.length] || colors.primary;
  };

  const categoryColor = getCategoryColor(item.level);
  const iconName = getCategoryIcon(item.name);

  if (variant === 'grid') {
    return (
      <TouchableOpacity
        onPress={() => onPress(item)}
        activeOpacity={0.95}
        className="mb-3 mr-3"
        style={{ width: CARD_WIDTH }}
      >
        <View 
          className="bg-white rounded-lg overflow-hidden"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          {/* Category Image/Icon */}
          <View className="p-5 items-center">
            {item.image ? (
              <Image 
                source={{ uri: item.image }} 
                className="w-12 h-12 rounded-lg mb-3"
                resizeMode="cover"
              />
            ) : (
              <View 
                className="w-12 h-12 rounded-lg items-center justify-center mb-3"
                style={{ backgroundColor: categoryColor }}
              >
                <Ionicons name={iconName} size={20} color="white" />
              </View>
            )}
            <Text className="text-base font-semibold text-gray-900 text-center mb-1" numberOfLines={2}>
              {item.name}
            </Text>
            <Text className="text-xs text-gray-500 text-center" numberOfLines={1}>
              Level {item.level}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // List variant - Professional and clean
  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      activeOpacity={0.95}
      className="mx-6 mb-3"
    >
      <View 
        className="bg-white rounded-lg p-4 flex-row items-center"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 2,
        }}
      >
        {/* Category Image/Icon */}
        {item.image ? (
          <Image 
            source={{ uri: item.image }} 
            className="w-12 h-12 rounded-lg mr-4"
            resizeMode="cover"
          />
        ) : (
          <View 
            className="w-12 h-12 rounded-lg items-center justify-center mr-4"
            style={{ backgroundColor: categoryColor }}
          >
            <Ionicons name={iconName} size={18} color="white" />
          </View>
        )}

        {/* Content */}
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 mb-1" numberOfLines={1}>
            {item.name}
          </Text>
          {item.description ? (
            <Text className="text-sm text-gray-500" numberOfLines={1}>
              {item.description}
            </Text>
          ) : (
            <Text className="text-sm text-gray-500">
              Level {item.level}
            </Text>
          )}
        </View>

        {/* Arrow */}
        <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} />
      </View>
    </TouchableOpacity>
  );
};

export default CategoryCard;
