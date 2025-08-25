import React, { useEffect } from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme';

const ViewToggle = ({ currentView, onViewChange }) => {
  const animatedValue = new Animated.Value(currentView === 'list' ? 0 : 1);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: currentView === 'list' ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [currentView, animatedValue]);

  const handleToggle = (view) => {
    if (currentView !== view) {
      onViewChange(view);
    }
  };

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 38], // Width of each button
  });

  return (
    <View className="px-6 pb-4">
      <View className="flex-row justify-end">
        <View className="bg-gray-100 rounded-lg p-1 flex-row relative">
          {/* Animated Background Indicator */}
          <Animated.View
            className="absolute bg-white rounded-md shadow-sm"
            style={{
              width: 36,
              height: 32,
              top: 2,
              left: 2,
              transform: [{ translateX }],
            }}
          />

          {/* List View Button */}
          <TouchableOpacity
            onPress={() => handleToggle('list')}
            activeOpacity={0.7}
            className="w-9 h-8 items-center justify-center rounded-md relative z-10"
          >
            <Ionicons
              name="list"
              size={16}
              color={currentView === 'list' ? colors.primary : colors.gray[500]}
            />
          </TouchableOpacity>

          {/* Grid View Button */}
          <TouchableOpacity
            onPress={() => handleToggle('grid')}
            activeOpacity={0.7}
            className="w-9 h-8 items-center justify-center rounded-md relative z-10"
          >
            <Ionicons
              name="grid"
              size={16}
              color={currentView === 'grid' ? colors.primary : colors.gray[500]}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ViewToggle;
