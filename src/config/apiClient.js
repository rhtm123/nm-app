import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.0.106:8000"

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: Number.parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("authToken")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error("Error getting auth token:", error)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, clear storage and redirect to login
      await AsyncStorage.removeItem("authToken")
      await AsyncStorage.removeItem("user")
      // You can add navigation logic here
    }
    return Promise.reject(error)
  },
)

export default apiClient
