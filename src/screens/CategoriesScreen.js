import { View, Text, FlatList, TouchableOpacity, Image, RefreshControl } from "react-native"
import { useState } from "react"
import { useNavigation } from "@react-navigation/native"
import Ionicons from "react-native-vector-icons/Ionicons"
import Header from "../components/Header"
import LoadingSpinner from "../components/LoadingSpinner"
import ErrorMessage from "../components/ErrorMessage"
import { useCategories } from "../hooks/useProducts"

const CategoriesScreen = () => {
  const navigation = useNavigation()
  const [refreshing, setRefreshing] = useState(false)

  const { data: categoriesData, loading, error, refetch } = useCategories({ page_size: 50 })

  const categories = categoriesData?.results || []

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  const handleCategoryPress = (category) => {
    navigation.navigate('CategoryProducts', { category })
  }

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      className="flex-row bg-white rounded-2xl mb-4 p-4 shadow-lg shadow-gray-300/50 border border-gray-100" 
      onPress={() => handleCategoryPress(item)} 
      activeOpacity={0.8}
    >
      <View className="mr-4">
        {item.image ? (
          <Image 
            source={{ uri: item.image }} 
            className="w-20 h-20 rounded-xl bg-gray-50"
          />
        ) : (
          <View className="w-20 h-20 rounded-xl bg-gray-50 items-center justify-center">
            <Ionicons name="grid-outline" size={32} color="#9ca3af" />
          </View>
        )}
      </View>

      <View className="flex-1 justify-between">
        <Text className="text-lg font-bold text-gray-800 mb-1 leading-6" numberOfLines={2}>
          {item.name}
        </Text>

        {item.description && (
          <Text className="text-sm text-gray-600 leading-5 mb-3" numberOfLines={3}>
            {item.description}
          </Text>
        )}

        <View className="flex-row justify-between items-center">
          <View className="bg-gray-100 px-3 py-1 rounded-full">
            <Text className="text-xs text-gray-600 font-medium">Level {item.level}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center p-8">
      <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
        <Ionicons name="grid-outline" size={32} color="#9ca3af" />
      </View>
      <Text className="text-xl font-bold text-gray-800 mb-2">No Categories Found</Text>
      <Text className="text-gray-600 text-center">Categories will appear here when available</Text>
    </View>
  )

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-gray-50">
        <Header navigation={navigation} title="Categories" />
        <LoadingSpinner />
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50">
        <Header navigation={navigation} title="Categories" />
        <ErrorMessage message={error} onRetry={refetch} />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      <Header navigation={navigation} title="Categories" />

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCategoryItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  )
}

export default CategoriesScreen
