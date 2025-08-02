import { View, ActivityIndicator } from "react-native"

const LoadingSpinner = ({ size = "large", color = "#3b82f6" }) => {
  return (
    <View className="flex-1 justify-center items-center p-6">
      <ActivityIndicator size={size} color={color} />
    </View>
  )
}

export default LoadingSpinner
