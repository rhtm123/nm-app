import { View, Text, TouchableOpacity } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <View className="flex-1 justify-center items-center p-6">
      <View className="items-center">
        <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
          <Ionicons name="alert-circle-outline" size={32} color="#ef4444" />
        </View>
        <Text className="text-gray-600 text-lg text-center mb-6 leading-6">
          {message}
        </Text>
        {onRetry && (
          <TouchableOpacity 
            className="bg-blue-600 px-6 py-3 rounded-xl"
            onPress={onRetry}
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-base">Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default ErrorMessage
