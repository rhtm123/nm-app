import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://emotional-cecily-codingchaska-5e686914.koyeb.app"

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
    console.log('API Error Response:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    })
    
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - clearing auth tokens')
      // Token expired, clear storage
      await AsyncStorage.removeItem("authToken")
      await AsyncStorage.removeItem("user")
      
      // You can add additional logic here like updating auth store
      // or triggering a re-login flow
    }
    
    return Promise.reject(error)
  },
)

export default apiClient
