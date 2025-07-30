import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native"
import { useState, useEffect } from "react"
import { useNavigation } from "@react-navigation/native"
import Ionicons from "react-native-vector-icons/Ionicons"
import Header from "../components/Header"
import LoadingSpinner from "../components/LoadingSpinner"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { colors, spacing, typography } from "../theme"
import InitialsAvatar from '../components/InitialsAvatar';

const ProfileScreen = () => {
  const navigation = useNavigation()
  const { user, isAuthenticated, isLoading, sendOTP, verifyOTP, logout, updateProfile } = useAuth()
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
    <View style={styles.loginContainer}>
      <View style={styles.loginHeader}>
        <Ionicons name="person-circle-outline" size={80} color={colors.primary} />
        <Text style={styles.loginTitle}>Welcome to Naigaon Market</Text>
        <Text style={styles.loginSubtitle}>Login to access your account</Text>
      </View>

      {!showOTPForm ? (
        <View style={styles.loginForm}>
          <Text style={styles.inputLabel}>Mobile Number</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter mobile number"
              placeholderTextColor={colors.text.light}
              value={mobile}
              onChangeText={setMobile}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleSendOTP}
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner size="small" color={colors.background} />
            ) : (
              <Text style={styles.primaryButtonText}>Send OTP</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.loginForm}>
          <Text style={styles.inputLabel}>Enter OTP</Text>
          <Text style={styles.otpInfo}>OTP sent to +91 {mobile}</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter 6-digit OTP"
            placeholderTextColor={colors.text.light}
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
            maxLength={6}
          />

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleVerifyOTP}
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner size="small" color={colors.background} />
            ) : (
              <Text style={styles.primaryButtonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setShowOTPForm(false)
              setOtp("")
            }}
          >
            <Text style={styles.secondaryButtonText}>Change Number</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )

  const renderProfileInfo = () => (
    <View style={styles.profileContainer}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <InitialsAvatar 
            name={`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'User'} 
            size={80} 
          />
        </View>
        <View style={styles.profileHeaderInfo}>
          <Text style={styles.userName}>
            {`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'User'}
          </Text>
          {user?.mobile && (
            <Text style={styles.userMobile}>+91 {user.mobile}</Text>
          )}
          {user?.email && <Text style={styles.userEmail}>{user.email}</Text>}
          {user?.gender && (
            <Text style={styles.userGender}>
              {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(!editMode)}>
          <Ionicons name={editMode ? "close" : "pencil"} size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Edit Profile Form */}
      {editMode && (
        <View style={styles.editForm}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your first name"
              placeholderTextColor={colors.text.light}
              value={user?.first_name || ''}
              onChangeText={(text) => setProfileData({ 
                ...profileData, 
                first_name: text 
              })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your last name"
              placeholderTextColor={colors.text.light}
              value={user?.last_name || ''}
              onChangeText={(text) => setProfileData({ 
                ...profileData, 
                last_name: text 
              })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email"
              placeholderTextColor={colors.text.light}
              value={profileData.email}
              onChangeText={(text) => setProfileData({ ...profileData, email: text })}
              keyboardType="email-address"
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleUpdateProfile}
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner size="small" color={colors.background} />
            ) : (
              <Text style={styles.primaryButtonText}>Update Profile</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Menu Options */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={handleOrdersPress}>
          <Ionicons name="bag-outline" size={24} color={colors.text.primary} />
          <Text style={styles.menuText}>My Orders</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.text.light} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Addresses")}>
          <Ionicons name="location-outline" size={24} color={colors.text.primary} />
          <Text style={styles.menuText}>Saved Addresses</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.text.light} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Wishlist")}>
          <Ionicons name="heart-outline" size={24} color={colors.text.primary} />
          <Text style={styles.menuText}>Wishlist</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.text.light} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Support")}>
          <Ionicons name="help-circle-outline" size={24} color={colors.text.primary} />
          <Text style={styles.menuText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.text.light} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
          <Text style={[styles.menuText, { color: colors.error }]}>Logout</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.text.light} />
        </TouchableOpacity>
      </View>
    </View>
  )

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {isAuthenticated ? renderProfileInfo() : renderLoginForm()}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },

  // Login Form
  loginContainer: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: "center",
  },
  loginHeader: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  loginTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  loginSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: "center",
  },
  loginForm: {
    width: "100%",
  },
  inputLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  countryCode: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  textInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  otpInfo: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },

  // Profile
  profileContainer: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  profileHeaderInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  userMobile: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  editButton: {
    padding: spacing.sm,
  },

  // Edit Form
  editForm: {
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },

  // Menu
  menuContainer: {
    backgroundColor: colors.background,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuText: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    marginLeft: spacing.md,
    fontWeight: typography.weights.medium,
  },
})

export default ProfileScreen
