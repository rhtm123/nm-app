import { create } from 'zustand';
import { authService } from '../services/authService';
import { googleAuthService } from '../services/googleAuthService';

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  isLoading: false,
  isAuthenticated: false,

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),

  // Initialize auth status on app start
  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      const isAuth = await authService.isAuthenticated();
      
      if (isAuth) {
        const storedUser = await authService.getStoredUser();
        set({ user: storedUser, isAuthenticated: true });
        
        // Initialize wishlist
        get().initializeWishlistForUser(storedUser?.id);
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error("Auth initialization failed:", error);
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

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
        // Initialize wishlist
        get().initializeWishlistForUser(result.data.user?.id);
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
        // Initialize wishlist
        get().initializeWishlistForUser(result.data?.id);
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

  // Initialize wishlist for user
  initializeWishlistForUser: async (userId) => {
    if (userId) {
      try {
        // Dynamic import to avoid circular dependency
        const { default: useWishlistStore } = await import('./wishlistStore');
        const { initializeWishlist } = useWishlistStore.getState();
        await initializeWishlist(userId);
      } catch (error) {
        console.error('Error initializing wishlist:', error);
      }
    }
  },

  // Clear wishlist on logout
  clearWishlistOnLogout: async () => {
    try {
      // Dynamic import to avoid circular dependency
      const { default: useWishlistStore } = await import('./wishlistStore');
      const { clearWishlist } = useWishlistStore.getState();
      clearWishlist();
    } catch (error) {
      console.error('Error clearing wishlist:', error);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      
      // Sign out from Google if user was signed in with Google
      try {
        const isGoogleSignedIn = await googleAuthService.isSignedIn();
        if (isGoogleSignedIn) {
          const signOutResult = await googleAuthService.signOut();
          if (!signOutResult.success) {
            console.log('Google sign-out warning:', signOutResult.error);
          }
        }
      } catch (googleError) {
        // Non-critical error - don't prevent the main logout flow
        console.log('Google sign-out error (non-critical):', googleError?.message || googleError);
      }
      
      // Clear wishlist
      await get().clearWishlistOnLogout();
      
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
        // Initialize wishlist
        get().initializeWishlistForUser(result.data.user?.id);
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
        // Initialize wishlist
        get().initializeWishlistForUser(result.data.user?.id);
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