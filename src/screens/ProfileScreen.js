import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native"
import { useState, useEffect } from "react"
import { useNavigation } from "@react-navigation/native"
import Ionicons from "react-native-vector-icons/Ionicons"
import Header from "../components/Header"
import LoadingSpinner from "../components/LoadingSpinner"
import useAuthStore from "../stores/authStore"
import { useCart } from "../context/CartContext"
import { colors, spacing, typography } from "../theme"
import InitialsAvatar from '../components/InitialsAvatar';

const ProfileScreen = () => {
  const navigation = useNavigation()
  const { user, isAuthenticated, isLoading, sendOTP, verifyOTP, logout, updateProfile } = useAuthStore()
  const { clearCart } = useCart()

  const [showLoginForm, setShowLoginForm] = useState(false)
  const [showOTPForm, setShowOTPForm] = useState(false)
  const [mobile, setMobile] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    mobile: "",
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || '',
        email: user.email || "",
        mobile: user.mobile || "",
      })
    }
  }, [user])

  const handleSendOTP = async () => {
    if (!mobile || mobile.length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit mobile number")
      return
    }

    setLoading(true)
    const result = await sendOTP(mobile)
    setLoading(false)

    if (result.success) {
      setShowOTPForm(true)
      Alert.alert("Success", "OTP sent successfully")
    } else {
      Alert.alert("Error", result.error)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP")
      return
    }

    setLoading(true)
    const result = await verifyOTP(mobile, otp)
    setLoading(false)

    if (result.success) {
      setShowLoginForm(false)
      setShowOTPForm(false)
      setMobile("")
      setOtp("")
      Alert.alert("Success", "Login successful!")
    } else {
      Alert.alert("Error", result.error)
    }
  }

  const handleUpdateProfile = async () => {
    setLoading(true)
    const result = await updateProfile(profileData)
    setLoading(false)

    if (result.success) {
      setEditMode(false)
      Alert.alert("Success", "Profile updated successfully")
    } else {
      Alert.alert("Error", result.error)
    }
  }

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout()
          clearCart()
          Alert.alert("Success", "Logged out successfully")
        },
      },
    ])
  }

  const handleOrdersPress = () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Login Required",
        "Please login to view your orders",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => setShowLoginForm(true) }
        ]
      );
      return;
    }
    navigation.navigate("Orders"); // Changed from "ProfileMain"
  };

  const renderLoginForm = () => (
    <View className="flex-1 px-4 justify-center">
      <View className="flex items-center mb-6">
        <Ionicons name="person-circle-outline" size={80} color={colors.primary} />
        <Text className="text-2xl font-bold text-primary mt-2 mb-1 text-center">Welcome to Naigaon Market</Text>
        <Text className="text-base text-secondary text-center">Login to access your account</Text>
      </View>

      {!showOTPForm ? (
        <View className="w-full">
          <Text className="text-base font-medium text-primary mb-2">Mobile Number</Text>
          <View className="flex flex-row items-center border border-border rounded-lg mb-4">
            <Text className="text-base text-primary px-4 py-2 border-r border-border">+91</Text>
            <TextInput
              className="flex-1 text-base text-primary px-4 py-2"
              placeholder="Enter mobile number"
              placeholderTextColor={colors.text.light}
              value={mobile}
              onChangeText={setMobile}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          <TouchableOpacity
            className={`bg-primary p-3 rounded-lg items-center mb-4 ${loading ? 'opacity-60' : ''}`}
            onPress={handleSendOTP}
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner size="small" color={colors.background} />
            ) : (
              <Text className="text-base text-background font-semibold">Send OTP</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View className="w-full">
          <Text className="text-base font-medium text-primary mb-2">Enter OTP</Text>
          <Text className="text-sm text-secondary mb-4">OTP sent to +91 {mobile}</Text>
          <TextInput
            className="text-base text-primary px-4 py-2 border border-border rounded-lg"
            placeholder="Enter 6-digit OTP"
            placeholderTextColor={colors.text.light}
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
            maxLength={6}
          />

          <TouchableOpacity
            className={`bg-primary p-3 rounded-lg items-center mb-4 ${loading ? 'opacity-60' : ''}`}
            onPress={handleVerifyOTP}
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner size="small" color={colors.background} />
            ) : (
              <Text className="text-base text-background font-semibold">Verify OTP</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="p-3 items-center"
            onPress={() => {
              setShowOTPForm(false)
              setOtp("")
            }}
          >
            <Text className="text-base text-primary font-medium">Change Number</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )

  const renderProfileInfo = () => (
    <View className="flex-1">
      {/* Profile Header */}
      <View className="flex flex-row items-center p-4 bg-surface border-b border-border">
        <View className="mr-3">
          <InitialsAvatar 
            name={`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'User'} 
            size={80} 
          />
        </View>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-primary mb-1">
            {`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'User'}
          </Text>
          {user?.mobile && (
            <Text className="text-base text-secondary mb-1">+91 {user.mobile}</Text>
          )}
          {user?.email && <Text className="text-base text-secondary">{user.email}</Text>}
          {user?.gender && (
            <Text className="text-base text-secondary">
              {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
            </Text>
          )}
        </View>
        <TouchableOpacity className="p-2" onPress={() => setEditMode(!editMode)}>
          <Ionicons name={editMode ? "close" : "pencil"} size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Edit Profile Form */}
      {editMode && (
        <View className="p-4 bg-background border-b border-border">
          <View className="mb-4">
            <Text className="text-base font-medium text-primary mb-2">First Name</Text>
            <TextInput
              className="text-base text-primary px-4 py-2 border border-border rounded-lg"
              placeholder="Enter your first name"
              placeholderTextColor={colors.text.light}
              value={user?.first_name || ''}
              onChangeText={(text) => setProfileData({ 
                ...profileData, 
                first_name: text 
              })}
            />
          </View>

          <View className="mb-4">
            <Text className="text-base font-medium text-primary mb-2">Last Name</Text>
            <TextInput
              className="text-base text-primary px-4 py-2 border border-border rounded-lg"
              placeholder="Enter your last name"
              placeholderTextColor={colors.text.light}
              value={user?.last_name || ''}
              onChangeText={(text) => setProfileData({ 
                ...profileData, 
                last_name: text 
              })}
            />
          </View>

          <View className="mb-4">
            <Text className="text-base font-medium text-primary mb-2">Email</Text>
            <TextInput
              className="text-base text-primary px-4 py-2 border border-border rounded-lg"
              placeholder="Enter your email"
              placeholderTextColor={colors.text.light}
              value={profileData.email}
              onChangeText={(text) => setProfileData({ ...profileData, email: text })}
              keyboardType="email-address"
            />
          </View>

          <TouchableOpacity
            className={`bg-primary p-3 rounded-lg items-center mb-4 ${loading ? 'opacity-60' : ''}`}
            onPress={handleUpdateProfile}
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner size="small" color={colors.background} />
            ) : (
              <Text className="text-base text-background font-semibold">Update Profile</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Menu Options */}
      <View className="bg-background">
        <TouchableOpacity className="flex flex-row items-center p-4 border-b border-border" onPress={handleOrdersPress}>
          <Ionicons name="bag-outline" size={24} color={colors.text.primary} />
          <Text className="text-base font-medium text-primary ml-3">My Orders</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.text.light} />
        </TouchableOpacity>

        <TouchableOpacity className="flex flex-row items-center p-4 border-b border-border" onPress={() => navigation.navigate("Addresses")}>
          <Ionicons name="location-outline" size={24} color={colors.text.primary} />
          <Text className="text-base font-medium text-primary ml-3">Saved Addresses</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.text.light} />
        </TouchableOpacity>

        <TouchableOpacity className="flex flex-row items-center p-4 border-b border-border" onPress={() => navigation.navigate("Wishlist")}>
          <Ionicons name="heart-outline" size={24} color={colors.text.primary} />
          <Text className="text-base font-medium text-primary ml-3">Wishlist</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.text.light} />
        </TouchableOpacity>

        <TouchableOpacity className="flex flex-row items-center p-4 border-b border-border" onPress={() => navigation.navigate("Support")}>
          <Ionicons name="help-circle-outline" size={24} color={colors.text.primary} />
          <Text className="text-base font-medium text-primary ml-3">Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.text.light} />
        </TouchableOpacity>

        <TouchableOpacity className="flex flex-row items-center p-4 border-b border-border" onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
          <Text className="text-base font-medium text-error ml-3">Logout</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.text.light} />
        </TouchableOpacity>
      </View>
    </View>
  )

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <LoadingSpinner />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {isAuthenticated ? renderProfileInfo() : renderLoginForm()}
      </ScrollView>
    </View>
  )
}

export default ProfileScreen
