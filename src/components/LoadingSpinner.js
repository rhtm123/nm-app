import { View, ActivityIndicator, StyleSheet } from "react-native"
import { colors, spacing } from "../theme"

const LoadingSpinner = ({ size = "large", color = colors.primary }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
})

export default LoadingSpinner
