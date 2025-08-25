import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme';

const CategoryHeader = ({ navigation, title = "Categories", totalCount = 0 }) => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View className="bg-white" style={{ paddingTop: StatusBar.currentHeight || 44 }}>
        <View className="px-6 py-4">
          {/* Header Row */}
          <View className="flex-row items-center justify-between mb-6">
            {/* Left - Title */}
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900 mb-1">{title}</Text>
              <Text className="text-sm text-gray-500">
                {totalCount > 0 ? `${totalCount} categories` : 'Browse all categories'}
              </Text>
            </View>

            {/* Right Actions */}
            <View className="flex-row items-center">
              {/* Search */}
              <TouchableOpacity
                onPress={() => navigation?.navigate('Search')}
                className="w-11 h-11 bg-gray-50 rounded-full items-center justify-center mr-3"
                style={{
                  shadowColor: colors.gray[300],
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <Ionicons name="search" size={20} color={colors.gray[600]} />
              </TouchableOpacity>

              {/* Notifications */}
              <TouchableOpacity 
                className="w-11 h-11 bg-gray-50 rounded-full items-center justify-center relative"
                style={{
                  shadowColor: colors.gray[300],
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <Ionicons name="notifications-outline" size={20} color={colors.gray[600]} />
                <View className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.error }} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

export default CategoryHeader;
