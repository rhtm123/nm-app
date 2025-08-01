import { create } from 'zustand';
import { authService } from '../services/authService';

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  isLoading: false,
  isAuthenticated: false,

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),

  checkAuthStatus: async () => {
    try {
      set({ isLoading: true });
      const isAuth = await authService.isAuthenticated();
      set({ isAuthenticated: isAuth });

      if (isAuth) {
        const storedUser = await authService.getStoredUser();
        set({ user: storedUser });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  sendOTP: async (mobile) => {
    set({ isLoading: true });
    try {
      const result = await authService.sendOTP(mobile);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  verifyOTP: async (mobile, otp) => {
    set({ isLoading: true });
    try {
      const result = await authService.verifyOTP(mobile, otp);

      if (result.success) {
        set({ user: result.data.user, isAuthenticated: true });
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (userData) => {
    set({ isLoading: true });
    try {
      const result = await authService.createUser(userData);

      if (result.success) {
        set({ user: result.data, isAuthenticated: true });
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (userData) => {
    const { user } = get();
    if (!user) return { success: false, error: "User not found" };

    set({ isLoading: true });
    try {
      const result = await authService.updateUserProfile(user.id, userData);

      if (result.success) {
        set({ user: result.data });
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({ user: null, isAuthenticated: false });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithPassword: async (username, password) => {
    set({ isLoading: true });
    try {
      const result = await authService.loginWithPassword(username, password);
      if (result.success) {
        set({ user: result.data.user, isAuthenticated: true });
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithGoogle: async (token) => {
    set({ isLoading: true });
    try {
      const result = await authService.loginWithGoogle(token);
      if (result.success) {
        set({ user: result.data.user, isAuthenticated: true });
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore; 