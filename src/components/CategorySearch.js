import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme';

const CategorySearch = ({ onSearch, placeholder = "Search categories...", showViewToggle = false, currentView = 'list', onViewChange }) => {
  const [searchText, setSearchText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = new Animated.Value(0);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    if (!searchText) {
      setIsFocused(false);
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleSearchChange = (text) => {
    setSearchText(text);
    onSearch(text);
  };

  const clearSearch = () => {
    setSearchText('');
    onSearch('');
  };

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border.primary, colors.primary],
  });

  const shadowOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.2],
  });

  return (
    <View className="px-6 pb-4 flex-row items-center">
      {/* Search Bar */}
      <Animated.View
        className="flex-1 bg-gray-50 rounded-lg flex-row items-center px-4 py-3 mr-3"
        style={{
          borderWidth: 1,
          borderColor: isFocused ? colors.primary : 'transparent',
        }}
      >
        {/* Search Icon */}
        <View className="mr-3">
          <Ionicons 
            name="search" 
            size={20} 
            color={isFocused ? colors.primary : colors.gray[400]} 
          />
        </View>

        {/* Search Input */}
        <TextInput
          value={searchText}
          onChangeText={handleSearchChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.gray[400]}
          className="flex-1 text-base text-gray-800"
          selectionColor={colors.primary}
        />

        {/* Clear Button */}
        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={clearSearch}
            activeOpacity={0.7}
            className="ml-2 w-6 h-6 bg-gray-200 rounded-full items-center justify-center"
          >
            <Ionicons name="close" size={14} color={colors.gray[600]} />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* View Toggle */}
      {showViewToggle && (
        <View className="bg-gray-100 rounded-lg p-1 flex-row">
          {/* List View Button */}
          <TouchableOpacity
            onPress={() => onViewChange?.('list')}
            activeOpacity={0.7}
            className="w-8 h-8 items-center justify-center rounded-md"
            style={{
              backgroundColor: currentView === 'list' ? 'white' : 'transparent',
            }}
          >
            <Ionicons
              name="list"
              size={16}
              color={currentView === 'list' ? colors.primary : colors.gray[500]}
            />
          </TouchableOpacity>

          {/* Grid View Button */}
          <TouchableOpacity
            onPress={() => onViewChange?.('grid')}
            activeOpacity={0.7}
            className="w-8 h-8 items-center justify-center rounded-md"
            style={{
              backgroundColor: currentView === 'grid' ? 'white' : 'transparent',
            }}
          >
            <Ionicons
              name="grid"
              size={16}
              color={currentView === 'grid' ? colors.primary : colors.gray[500]}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default CategorySearch;
