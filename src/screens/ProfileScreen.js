import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from "react-native"
import { useState, useEffect } from "react"
import { useNavigation } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Ionicons from "react-native-vector-icons/Ionicons"
import Header from "../components/Header"
import LoadingSpinner from "../components/LoadingSpinner"
import useAuthStore from "../stores/authStore"
import useCartStore from "../stores/cartStore"
import { colors, spacing, typography } from "../theme"
import InitialsAvatar from '../components/InitialsAvatar'
import { authService } from '../services/authService'

const ProfileScreen = () => {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const { user, isAuthenticated, isLoading, sendOTP, verifyOTP, logout } = useAuthStore()
  const clearCart = useCartStore((state) => state.clearCart)

  const [showLoginForm, setShowLoginForm] = useState(false)
  const [showOTPForm, setShowOTPForm] = useState(false)
  const [mobile, setMobile] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [fetchingProfile, setFetchingProfile] = useState(false)
  const [fullUserData, setFullUserData] = useState(null)
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    alternate_mobile: "",
    gender: "",
  })

  // Fetch complete user profile data
  const fetchUserProfile = async () => {
    if (user?.id) {
      try {
        setFetchingProfile(true)
        const result = await authService.getUserProfile(user.id)
        if (result.success) {
          setFullUserData(result.data)
          setProfileData({
            first_name: result.data.first_name || "",
            last_name: result.data.last_name || "",
            email: result.data.email || "",
            mobile: result.data.mobile || "",
            alternate_mobile: result.data.alternate_mobile || "",
            gender: result.data.gender || "",
          })
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setFetchingProfile(false)
      }
    }
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserProfile()
    }
  }, [user, isAuthenticated])

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        mobile: user.mobile || "",
        alternate_mobile: user.alternate_mobile || "",
        gender: user.gender || "",
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
    if (!fullUserData?.id && !user?.id) {
      Alert.alert("Error", "User ID not found")
      return
    }

    setLoading(true)
    try {
      const userId = fullUserData?.id || user?.id
      const result = await authService.updateUserProfile(userId, profileData)
      
      if (result.success) {
        setFullUserData(result.data)
        setEditMode(false)
        Alert.alert("Success", "Profile updated successfully")
        // Refresh the profile data
        fetchUserProfile()
      } else {
        Alert.alert("Error", result.error)
      }
    } catch (error) {
      console.error('Profile update error:', error)
      Alert.alert("Error", "Failed to update profile")
    } finally {
      setLoading(false)
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
          clearCart(user?.id)
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
    <View style={{ backgroundColor: colors.backgroundSecondary }} className="flex-1 px-4 justify-center">
      <View className="items-center mb-8">
        <View style={{ backgroundColor: colors.primary + '20' }} className="w-20 h-20 rounded-full items-center justify-center mb-4">
          <Ionicons name="person-circle-outline" size={50} color={colors.primary} />
        </View>
        <Text style={{ color: colors.text.primary }} className="text-3xl font-bold mt-2 mb-2 text-center">Welcome to Naigaon Market</Text>
        <Text style={{ color: colors.text.secondary }} className="text-base text-center">Login to access your account</Text>
      </View>

      {!showOTPForm ? (
        <View style={{ backgroundColor: colors.surface }} className="w-full p-6 rounded-2xl shadow-lg">
          <Text style={{ color: colors.text.primary }} className="text-base font-semibold mb-3">Mobile Number</Text>
          <View style={{ backgroundColor: colors.backgroundSecondary, borderColor: colors.border.primary }} className="flex-row items-center border rounded-xl mb-6">
            <Text style={{ color: colors.text.primary, borderColor: colors.border.primary }} className="text-base px-4 py-3 border-r">+91</Text>
            <TextInput
              style={{ color: colors.text.primary }}
              className="flex-1 text-base px-4 py-3"
              placeholder="Enter mobile number"
              placeholderTextColor={colors.text.light}
              value={mobile}
              onChangeText={setMobile}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          <TouchableOpacity
            style={{ 
              backgroundColor: colors.primary,
              opacity: loading ? 0.6 : 1,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4
            }}
            className="p-4 rounded-xl items-center"
            onPress={handleSendOTP}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <LoadingSpinner size="small" color={colors.text.white} />
            ) : (
              <Text style={{ color: colors.text.white }} className="text-base font-bold">Send OTP</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ backgroundColor: colors.surface }} className="w-full p-6 rounded-2xl shadow-lg">
          <Text style={{ color: colors.text.primary }} className="text-base font-semibold mb-2">Enter OTP</Text>
          <Text style={{ color: colors.text.secondary }} className="text-sm mb-6">OTP sent to +91 {mobile}</Text>
          <TextInput
            style={{ color: colors.text.primary, backgroundColor: colors.backgroundSecondary, borderColor: colors.border.primary }}
            className="text-base px-4 py-3 border rounded-xl mb-6"
            placeholder="Enter 6-digit OTP"
            placeholderTextColor={colors.text.light}
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
            maxLength={6}
          />

          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              opacity: loading ? 0.6 : 1,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4
            }}
            className="p-4 rounded-xl items-center mb-4"
            onPress={handleVerifyOTP}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <LoadingSpinner size="small" color={colors.text.white} />
            ) : (
              <Text style={{ color: colors.text.white }} className="text-base font-bold">Verify OTP</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="p-3 items-center"
            onPress={() => {
              setShowOTPForm(false)
              setOtp("")
            }}
            activeOpacity={0.7}
          >
            <Text style={{ color: colors.primary }} className="text-base font-semibold">Change Number</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )

  const renderProfileInfo = () => {
    const currentData = fullUserData || user
    const displayName = `${currentData?.first_name || ''} ${currentData?.last_name || ''}`.trim() || currentData?.username || 'User'
    
    return (
    <View style={{ backgroundColor: colors.backgroundSecondary }} className="flex-1">
      <Header title="Profile" />
      
      {fetchingProfile && (
        <View className="p-4">
          <LoadingSpinner size="small" />
        </View>
      )}
      
      {/* Profile Header */}
      <View style={{ backgroundColor: colors.surface }} className="p-6 mx-4 mt-4 rounded-2xl shadow-lg">
        <View className="flex-row items-center">
          <View className="mr-4">
            {currentData?.google_picture ? (
              <View className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-100">
                <Image 
                  source={{ uri: currentData.google_picture }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
            ) : (
              <InitialsAvatar 
                name={displayName} 
                size={80} 
              />
            )}
          </View>
          <View className="flex-1">
            <Text style={{ color: colors.text.primary }} className="text-xl font-bold mb-1">
              {displayName}
            </Text>
            {/* <Text style={{ color: colors.text.muted }} className="text-xs mb-2">
              ID: {currentData?.id || 'N/A'}
            </Text> */}
            {currentData?.mobile && (
              <View className="flex-row items-center mb-1">
                <Ionicons name="call-outline" size={16} color={colors.text.secondary} />
                <Text style={{ color: colors.text.secondary }} className="text-sm ml-1">+91 {currentData.mobile}</Text>
                {currentData?.mobile_verified && (
                  <View className="ml-2 bg-green-100 px-2 py-1 rounded-full">
                    <Text className="text-green-600 text-xs font-semibold">Verified</Text>
                  </View>
                )}
              </View>
            )}
            {currentData?.alternate_mobile && (
              <View className="flex-row items-center mb-1">
                <Ionicons name="call-outline" size={16} color={colors.text.light} />
                <Text style={{ color: colors.text.light }} className="text-sm ml-1">Alt: +91 {currentData.alternate_mobile}</Text>
              </View>
            )}
            {currentData?.email && (
              <View className="flex-row items-center mb-1">
                <Ionicons name="mail-outline" size={16} color={colors.text.secondary} />
                <Text style={{ color: colors.text.secondary }} className="text-sm ml-1">{currentData.email}</Text>
              </View>
            )}
            {currentData?.gender && (
              <View className="flex-row items-center mb-1">
                <Ionicons name="person-outline" size={16} color={colors.text.secondary} />
                <Text style={{ color: colors.text.secondary }} className="text-sm ml-1">
                  {currentData.gender.charAt(0).toUpperCase() + currentData.gender.slice(1)}
                </Text>
              </View>
            )}
            {currentData?.role && (
              <View className="flex-row items-center">
                <Ionicons name="shield-outline" size={16} color={colors.primary} />
                <Text style={{ color: colors.primary }} className="text-sm ml-1 capitalize">
                  {currentData.role}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={{ backgroundColor: colors.primary + '20' }}
            className="p-3 rounded-xl" 
            onPress={() => setEditMode(!editMode)}
            activeOpacity={0.7}
          >
            <Ionicons name={editMode ? "close" : "pencil"} size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Edit Profile Form */}
      {editMode && (
        <View style={{ backgroundColor: colors.surface }} className="p-6 mx-4 mt-4 rounded-2xl shadow-lg">
          <Text style={{ color: colors.text.primary }} className="text-lg font-bold mb-4">Edit Profile</Text>
          
          <View className="mb-4">
            <Text style={{ color: colors.text.primary }} className="text-base font-semibold mb-2">First Name</Text>
            <TextInput
              style={{ color: colors.text.primary, backgroundColor: colors.backgroundSecondary, borderColor: colors.border.primary }}
              className="text-base px-4 py-3 border rounded-xl"
              placeholder="Enter your first name"
              placeholderTextColor={colors.text.light}
              value={profileData.first_name}
              onChangeText={(text) => setProfileData({ 
                ...profileData, 
                first_name: text 
              })}
            />
          </View>

          <View className="mb-4">
            <Text style={{ color: colors.text.primary }} className="text-base font-semibold mb-2">Last Name</Text>
            <TextInput
              style={{ color: colors.text.primary, backgroundColor: colors.backgroundSecondary, borderColor: colors.border.primary }}
              className="text-base px-4 py-3 border rounded-xl"
              placeholder="Enter your last name"
              placeholderTextColor={colors.text.light}
              value={profileData.last_name}
              onChangeText={(text) => setProfileData({ 
                ...profileData, 
                last_name: text 
              })}
            />
          </View>

          <View className="mb-4">
            <Text style={{ color: colors.text.primary }} className="text-base font-semibold mb-2">Email</Text>
            <TextInput
              style={{ color: colors.text.primary, backgroundColor: colors.backgroundSecondary, borderColor: colors.border.primary }}
              className="text-base px-4 py-3 border rounded-xl"
              placeholder="Enter your email"
              placeholderTextColor={colors.text.light}
              value={profileData.email}
              onChangeText={(text) => setProfileData({ ...profileData, email: text })}
              keyboardType="email-address"
            />
          </View>

          <View className="mb-4">
            <Text style={{ color: colors.text.primary }} className="text-base font-semibold mb-2">Mobile Number</Text>
            <View style={{ backgroundColor: colors.backgroundSecondary, borderColor: colors.border.primary }} className="flex-row items-center border rounded-xl">
              <Text style={{ color: colors.text.primary, borderColor: colors.border.primary }} className="text-base px-4 py-3 border-r">+91</Text>
              <TextInput
                style={{ color: colors.text.primary }}
                className="flex-1 text-base px-4 py-3"
                placeholder="Enter mobile number"
                placeholderTextColor={colors.text.light}
                value={profileData.mobile}
                onChangeText={(text) => setProfileData({ ...profileData, mobile: text })}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text style={{ color: colors.text.primary }} className="text-base font-semibold mb-2">Alternate Mobile (Optional)</Text>
            <View style={{ backgroundColor: colors.backgroundSecondary, borderColor: colors.border.primary }} className="flex-row items-center border rounded-xl">
              <Text style={{ color: colors.text.primary, borderColor: colors.border.primary }} className="text-base px-4 py-3 border-r">+91</Text>
              <TextInput
                style={{ color: colors.text.primary }}
                className="flex-1 text-base px-4 py-3"
                placeholder="Enter alternate mobile number"
                placeholderTextColor={colors.text.light}
                value={profileData.alternate_mobile}
                onChangeText={(text) => setProfileData({ ...profileData, alternate_mobile: text })}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>

          <View className="mb-6">
            <Text style={{ color: colors.text.primary }} className="text-base font-semibold mb-2">Gender</Text>
            <View className="flex-row space-x-4">
              <TouchableOpacity 
                style={{
                  backgroundColor: profileData.gender === 'male' ? colors.primary + '20' : colors.backgroundSecondary,
                  borderColor: profileData.gender === 'male' ? colors.primary : colors.border.primary,
                }}
                className="flex-1 flex-row items-center justify-center px-4 py-3 border rounded-xl"
                onPress={() => setProfileData({ ...profileData, gender: 'male' })}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="man-outline" 
                  size={20} 
                  color={profileData.gender === 'male' ? colors.primary : colors.text.secondary} 
                />
                <Text 
                  style={{ color: profileData.gender === 'male' ? colors.primary : colors.text.secondary }}
                  className="ml-2 text-base font-semibold"
                >
                  Male
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={{
                  backgroundColor: profileData.gender === 'female' ? colors.primary + '20' : colors.backgroundSecondary,
                  borderColor: profileData.gender === 'female' ? colors.primary : colors.border.primary,
                }}
                className="flex-1 flex-row items-center justify-center px-4 py-3 border rounded-xl"
                onPress={() => setProfileData({ ...profileData, gender: 'female' })}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="woman-outline" 
                  size={20} 
                  color={profileData.gender === 'female' ? colors.primary : colors.text.secondary} 
                />
                <Text 
                  style={{ color: profileData.gender === 'female' ? colors.primary : colors.text.secondary }}
                  className="ml-2 text-base font-semibold"
                >
                  Female
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              opacity: loading ? 0.6 : 1,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4
            }}
            className="p-4 rounded-xl items-center"
            onPress={handleUpdateProfile}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <LoadingSpinner size="small" color={colors.text.white} />
            ) : (
              <Text style={{ color: colors.text.white }} className="text-base font-bold">Update Profile</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Menu Options */}
      <View style={{ backgroundColor: colors.surface }} className="mx-4 mt-4 rounded-2xl shadow-lg overflow-hidden">
        <TouchableOpacity 
          style={{ borderBottomColor: colors.border.light }}
          className="flex-row items-center justify-between p-4 border-b" 
          onPress={handleOrdersPress}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <View style={{ backgroundColor: colors.primary + '20' }} className="w-10 h-10 rounded-xl items-center justify-center mr-3">
              <Ionicons name="bag-outline" size={20} color={colors.primary} />
            </View>
            <Text style={{ color: colors.text.primary }} className="text-base font-semibold">My Orders</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.text.light} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={{ borderBottomColor: colors.border.light }}
          className="flex-row items-center justify-between p-4 border-b" 
          onPress={() => navigation.navigate("Addresses")}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <View style={{ backgroundColor: colors.secondary + '20' }} className="w-10 h-10 rounded-xl items-center justify-center mr-3">
              <Ionicons name="location-outline" size={20} color={colors.secondary} />
            </View>
            <Text style={{ color: colors.text.primary }} className="text-base font-semibold">Saved Addresses</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.text.light} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={{ borderBottomColor: colors.border.light }}
          className="flex-row items-center justify-between p-4 border-b" 
          onPress={() => navigation.navigate("Wishlist")}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <View style={{ backgroundColor: colors.error + '20' }} className="w-10 h-10 rounded-xl items-center justify-center mr-3">
              <Ionicons name="heart-outline" size={20} color={colors.error} />
            </View>
            <Text style={{ color: colors.text.primary }} className="text-base font-semibold">Wishlist</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.text.light} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={{ borderBottomColor: colors.border.light }}
          className="flex-row items-center justify-between p-4 border-b" 
          onPress={() => navigation.navigate("Support")}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <View style={{ backgroundColor: colors.warning + '20' }} className="w-10 h-10 rounded-xl items-center justify-center mr-3">
              <Ionicons name="help-circle-outline" size={20} color={colors.warning} />
            </View>
            <Text style={{ color: colors.text.primary }} className="text-base font-semibold">Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.text.light} />
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-row items-center justify-between p-4" 
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <View style={{ backgroundColor: colors.error + '20' }} className="w-10 h-10 rounded-xl items-center justify-center mr-3">
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
            </View>
            <Text style={{ color: colors.error }} className="text-base font-semibold">Logout</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.text.light} />
        </TouchableOpacity>
      </View>
      
      {/* Dynamic Bottom Spacing */}
      <View style={{ height: Math.max(insets.bottom + 24, 32) }} />
    </View>
  )
  }

  if (isLoading) {
    return (
      <View style={{ backgroundColor: colors.backgroundSecondary }} className="flex-1">
        <LoadingSpinner />
      </View>
    )
  }

  return (
    <View style={{ backgroundColor: colors.backgroundSecondary }} className="flex-1">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 16, 32) }}
      >
        {isAuthenticated ? renderProfileInfo() : renderLoginForm()}
      </ScrollView>
    </View>
  )
}

export default ProfileScreen
