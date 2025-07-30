
import { createContext, useContext, useState, useEffect } from "react"
import { authService } from "../services/authService"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true)
      const isAuth = await authService.isAuthenticated()
      setIsAuthenticated(isAuth)

      if (isAuth) {
        const storedUser = await authService.getStoredUser()
        setUser(storedUser)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendOTP = async (mobile) => {
    setIsLoading(true)
    try {
      const result = await authService.sendOTP(mobile)
      return result
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOTP = async (mobile, otp) => {
    setIsLoading(true)
    try {
      const result = await authService.verifyOTP(mobile, otp)

      if (result.success) {
        setUser(result.data.user)
        setIsAuthenticated(true)
      }

      return result
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData) => {
    setIsLoading(true)
    try {
      const result = await authService.createUser(userData)

      if (result.success) {
        setUser(result.data)
        setIsAuthenticated(true)
      }

      return result
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (userData) => {
    if (!user) return { success: false, error: "User not found" }

    setIsLoading(true)
    try {
      const result = await authService.updateUserProfile(user.id, userData)

      if (result.success) {
        setUser(result.data)
      }

      return result
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await authService.logout()
      setUser(null)
      setIsAuthenticated(false)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Username/Password Login
  const loginWithPassword = async (username, password) => {
    setIsLoading(true)
    try {
      const result = await authService.loginWithPassword(username, password)
      if (result.success) {
        setUser(result.data.user)
        setIsAuthenticated(true)
      }
      return result
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Google Login
  const loginWithGoogle = async (token) => {
    setIsLoading(true)
    try {
      const result = await authService.loginWithGoogle(token)
      if (result.success) {
        setUser(result.data.user)
        setIsAuthenticated(true)
      }
      return result
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        sendOTP,
        verifyOTP,
        register,
        updateProfile,
        logout,
        checkAuthStatus,
        loginWithPassword,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
