import apiClient from "../config/apiClient"
import { API_ENDPOINTS } from "../config/endpoints"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const authService = {
  // Send OTP
  sendOTP: async (mobile) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SEND_OTP, { mobile })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to send OTP" }
    }
  },

  // Verify OTP
  verifyOTP: async (mobile, otp) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.VERIFY_OTP, { mobile, otp })

      if (response.data.token) {
        await AsyncStorage.setItem("authToken", response.data.token)
        await AsyncStorage.setItem("user", JSON.stringify(response.data.user))
      }

      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Invalid OTP" }
    }
  },

  // Create User
  createUser: async (userData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.USERS, userData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to create user" }
    }
  },

  // Get User Profile
  getUserProfile: async (userId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER_BY_ID(userId))
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to get user profile" }
    }
  },

  // Update User Profile
  updateUserProfile: async (userId, userData) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.USER_BY_ID(userId), userData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to update profile" }
    }
  },

  // Logout
  logout: async () => {
    try {
      await AsyncStorage.removeItem("authToken")
      await AsyncStorage.removeItem("user")
      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to logout" }
    }
  },

  // Get stored user
  getStoredUser: async () => {
    try {
      const userString = await AsyncStorage.getItem("user")
      return userString ? JSON.parse(userString) : null
    } catch (error) {
      return null
    }
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem("authToken")
      return !!token
    } catch (error) {
      return false
    }
  },

  // Username/Password Login
  loginWithPassword: async (username, password) => {
    try {
      console.log(username, password);
      const response = await apiClient.post(API_ENDPOINTS.LOGIN, { username, password });

      console.log(response);
      let userObj = response.data.user;
      if (!userObj) {
        // If user object is not present, fetch user profile using user_id
        const userId = response.data.user_id || response.data.id;
        if (userId) {
          const profileRes = await apiClient.get(API_ENDPOINTS.USER_BY_ID(userId));
          userObj = profileRes.data;
        }
      }
      if (response.data.token || response.data.access_token) {
        await AsyncStorage.setItem("authToken", response.data.token || response.data.access_token);
      }
      if (userObj) {
        await AsyncStorage.setItem("user", JSON.stringify(userObj));
      }
      return { success: true, data: { ...response.data, user: userObj } };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Invalid credentials" };
    }
  },

  // Google Login
  loginWithGoogle: async (token) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.GOOGLE_LOGIN, { token });
      if (response.data.token) {
        await AsyncStorage.setItem("authToken", response.data.token);
        await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Google login failed" };
    }
  },
}
