import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';


const GOOGLE_WEB_CLIENT_ID = '65541509617-tbav2bul49gudh4lfcvogl2mfbkk2guq.apps.googleusercontent.com';

export const googleAuthService = {
  // Configure Google Sign-In
  configure: () => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: false,
      hostedDomain: '', // specify a domain if you want to restrict sign-ins
      forceCodeForRefreshToken: true,
    });
  },

  // Check if Google Play Services are available
  hasPlayServices: async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      return true;
    } catch (err) {
      console.error('Google Play Services not available:', err);
      return false;
    }
  },

  // Sign in with Google
  signIn: async () => {
    try {
      // Check if Google Play Services are available
      const hasPlayServices = await googleAuthService.hasPlayServices();
      if (!hasPlayServices) {
        throw new Error('Google Play Services not available');
      }

      // Perform the sign-in
      const userInfo = await GoogleSignin.signIn();
      console.log('Google Sign-In User Info:', userInfo);

      // Get the ID token
      const tokens = await GoogleSignin.getTokens();
      console.log('Google Tokens:', tokens);

      if (!tokens.idToken) {
        throw new Error('No Google ID token received');
      }

      return {
        success: true,
        userInfo,
        idToken: tokens.idToken,
        accessToken: tokens.accessToken,
      };
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      
      let errorMessage = 'Google sign-in failed';
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = 'Google sign-in was cancelled';
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = 'Google sign-in is already in progress';
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = 'Google Play Services not available';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  // Sign out from Google
  signOut: async () => {
    try {
      await GoogleSignin.signOut();
      return { success: true };
    } catch (error) {
      console.error('Google Sign-Out Error:', error);
      return { success: false, error: error.message };
    }
  },

  // Revoke access
  revokeAccess: async () => {
    try {
      await GoogleSignin.revokeAccess();
      return { success: true };
    } catch (error) {
      console.error('Google Revoke Access Error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get current user info
  getCurrentUser: async () => {
    try {
      const userInfo = await GoogleSignin.getCurrentUser();
      return { success: true, userInfo };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Check if user is signed in
  isSignedIn: async () => {
    try {
      // Check if the method exists before calling it
      if (typeof GoogleSignin.isSignedIn === 'function') {
        const isSignedIn = await GoogleSignin.isSignedIn();
        return isSignedIn;
      } else {
        console.log('GoogleSignin.isSignedIn method not available, checking current user instead');
        // Fallback: try to get current user to check if signed in
        const currentUser = await GoogleSignin.getCurrentUser();
        return currentUser !== null;
      }
    } catch (error) {
      console.log('Google sign-in check failed (non-critical):', error.message);
      return false;
    }
  },
};
