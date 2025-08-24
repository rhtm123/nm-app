import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionsAndroid, Platform } from 'react-native';
import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/endpoints';

const STORAGE_KEYS = {
  LAST_LOCATION_CHECK: 'lastLocationCheck',
  DELIVERY_AVAILABILITY: 'deliveryAvailability',
  SELECTED_ADDRESS: 'selectedAddress',
  USER_ADDRESSES: 'userAddresses',
  CURRENT_PINCODE: 'currentPincode'
};

class LocationService {
  constructor() {
    this.estore_id = 2; // Hard-coded for Naigaon Market
  }

  // Request location permissions
  async requestLocationPermission() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Required',
            message: 'This app needs to access your location to check delivery availability.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Location permission error:', err);
        return false;
      }
    }
    return true; // iOS handles permissions automatically
  }

  // Get device location
  async getCurrentLocation() {
    const hasPermission = await this.requestLocationPermission();
    if (!hasPermission) {
      throw new Error('Location permission denied');
    }

    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          error => {
            console.error('Location error:', error);
            reject(new Error('Failed to get location'));
          },
          { 
            enableHighAccuracy: false, 
            timeout: 15000, 
            maximumAge: 10000 
          }
        );
      } else {
        reject(new Error('Geolocation is not supported by this device'));
      }
    });
  }

  // Reverse geocoding to get pincode from coordinates
  async getPincodeFromCoordinates(latitude, longitude) {
    try {
      // Using a free geocoding service (you can replace with Google Maps API if you have a key)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      const data = await response.json();
      
      // Extract pincode from the response
      const pincode = data.postcode || data.postalCode;
      return pincode;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  // Check if delivery is available for a pincode
  async checkDeliveryAvailability(pincode) {
    try {
      console.log('Checking delivery for pincode:', pincode);
      console.log('Using endpoint:', API_ENDPOINTS.DELIVERY_PINS);
      console.log('Estore ID:', this.estore_id);
      
      const response = await apiClient.get(API_ENDPOINTS.DELIVERY_PINS, {
        params: {
          estore_id: this.estore_id,
          page_size: 100 // Get all available pins
        }
      });

      console.log('Delivery pins response:', response.data);
      
      const deliveryPins = response.data.results || [];
      const isAvailable = deliveryPins.some(pin => pin.pin_code === pincode);
      const deliveryInfo = deliveryPins.find(pin => pin.pin_code === pincode);

      console.log('Delivery check result:', { isAvailable, deliveryInfo, totalPins: deliveryPins.length });

      return {
        isAvailable,
        deliveryInfo,
        allPins: deliveryPins
      };
    } catch (error) {
      console.error('Delivery check error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      
      // Return a fallback result instead of throwing
      // This allows the app to continue working even if the API fails
      return {
        isAvailable: pincode === '401208', // Default to true for Naigaon pincode
        deliveryInfo: pincode === '401208' ? {
          id: 1,
          pin_code: '401208',
          estore_id: this.estore_id,
          cod_available: true,
          city: 'Naigaon East',
          state: 'Maharashtra'
        } : null,
        allPins: [],
        error: error.message
      };
    }
  }

  // Get user's saved addresses
  async getUserAddresses(userId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SHIPPING_ADDRESSES, {
        params: {
          user_id: userId,
          page_size: 50
        }
      });

      const addresses = response.data.results || [];
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ADDRESSES, JSON.stringify(addresses));
      return addresses;
    } catch (error) {
      console.error('Failed to fetch user addresses:', error);
      // Try to get from local storage as fallback
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.USER_ADDRESSES);
      return cached ? JSON.parse(cached) : [];
    }
  }

  // Check if we need to refresh location data
  async shouldCheckLocation() {
    try {
      const lastCheck = await AsyncStorage.getItem(STORAGE_KEYS.LAST_LOCATION_CHECK);
      if (!lastCheck) return true;

      const lastCheckTime = new Date(lastCheck);
      const now = new Date();
      const hoursSinceLastCheck = (now - lastCheckTime) / (1000 * 60 * 60);

      // Check location if it's been more than 1 hour or if no delivery data exists
      const deliveryData = await AsyncStorage.getItem(STORAGE_KEYS.DELIVERY_AVAILABILITY);
      return hoursSinceLastCheck > 1 || !deliveryData;
    } catch (error) {
      return true; // If there's any error, check location
    }
  }

  // Get delivery status for current location
  async getDeliveryStatus(userId = null, forceRefresh = false) {
    try {
      // Check if we need to refresh
      if (!forceRefresh && !(await this.shouldCheckLocation())) {
        const cached = await AsyncStorage.getItem(STORAGE_KEYS.DELIVERY_AVAILABILITY);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      // Try to get current pincode from various sources
      let currentPincode = null;
      let locationSource = 'unknown';

      // First, try to get cached pincode
      try {
        currentPincode = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_PINCODE);
        if (currentPincode) {
          locationSource = 'cached';
        }
      } catch (error) {
        console.log('No cached pincode found');
      }

      // If no cached pincode, try to use default address
      if (!currentPincode && userId) {
        try {
          const addresses = await this.getUserAddresses(userId);
          const defaultAddress = addresses.find(addr => addr.is_default) || addresses[0];
          if (defaultAddress && defaultAddress.address && defaultAddress.address.pin) {
            currentPincode = defaultAddress.address.pin;
            locationSource = 'default_address';
            // Cache this pincode for future use
            await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_PINCODE, currentPincode);
          }
        } catch (addressError) {
          console.log('Failed to get user addresses:', addressError);
        }
      }

      // If still no pincode, default to Naigaon area (since this is Naigaon Market)
      if (!currentPincode) {
        currentPincode = '401208'; // Default to Naigaon pincode
        locationSource = 'default';
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_PINCODE, currentPincode);
      }

      let deliveryStatus = {
        isAvailable: false,
        pincode: currentPincode,
        locationSource,
        deliveryInfo: null,
        city: 'Unknown',
        state: 'Unknown',
        timestamp: new Date().toISOString()
      };

      // Check delivery availability if we have a pincode
      if (currentPincode) {
        try {
          const availability = await this.checkDeliveryAvailability(currentPincode);
          deliveryStatus = {
            ...deliveryStatus,
            isAvailable: availability.isAvailable,
            deliveryInfo: availability.deliveryInfo,
            city: availability.deliveryInfo?.city || 'Unknown',
            state: availability.deliveryInfo?.state || 'Unknown'
          };
        } catch (deliveryError) {
          console.error('Failed to check delivery availability:', deliveryError);
          // If API fails, assume delivery is available for default pincode
          if (currentPincode === '401208') {
            deliveryStatus = {
              ...deliveryStatus,
              isAvailable: true,
              city: 'Naigaon East',
              state: 'Maharashtra'
            };
          }
        }
      }

      // Cache the result
      await AsyncStorage.setItem(STORAGE_KEYS.DELIVERY_AVAILABILITY, JSON.stringify(deliveryStatus));
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_LOCATION_CHECK, new Date().toISOString());

      return deliveryStatus;
    } catch (error) {
      console.error('Failed to get delivery status:', error);
      
      // Return cached data if available
      try {
        const cached = await AsyncStorage.getItem(STORAGE_KEYS.DELIVERY_AVAILABILITY);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (cacheError) {
        console.error('Failed to get cached delivery status:', cacheError);
      }

      // Return default status for Naigaon area
      return {
        isAvailable: true,
        pincode: '401208',
        locationSource: 'default',
        deliveryInfo: null,
        city: 'Naigaon East',
        state: 'Maharashtra',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Set selected address manually
  async setSelectedAddress(address) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_ADDRESS, JSON.stringify(address));
      
      // Update delivery status with the new pincode
      if (address && address.pin) {
        const availability = await this.checkDeliveryAvailability(address.pin);
        const deliveryStatus = {
          isAvailable: availability.isAvailable,
          pincode: address.pin,
          locationSource: 'manual',
          deliveryInfo: availability.deliveryInfo,
          city: availability.deliveryInfo?.city || address.city || 'Unknown',
          state: availability.deliveryInfo?.state || address.state || 'Unknown',
          timestamp: new Date().toISOString()
        };
        
        await AsyncStorage.setItem(STORAGE_KEYS.DELIVERY_AVAILABILITY, JSON.stringify(deliveryStatus));
        return deliveryStatus;
      }
    } catch (error) {
      console.error('Failed to set selected address:', error);
      throw error;
    }
  }

  // Clear cached location data
  async clearCache() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.LAST_LOCATION_CHECK,
        STORAGE_KEYS.DELIVERY_AVAILABILITY,
        STORAGE_KEYS.CURRENT_PINCODE
      ]);
    } catch (error) {
      console.error('Failed to clear location cache:', error);
    }
  }

  // Create a new address using the location API
  async createAddress(addressData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ADDRESSES, addressData);
      return response.data;
    } catch (error) {
      console.error('Failed to create address:', error);
      throw error;
    }
  }

  // Create a new shipping address
  async createShippingAddress(shippingAddressData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SHIPPING_ADDRESSES, shippingAddressData);
      return response.data;
    } catch (error) {
      console.error('Failed to create shipping address:', error);
      throw error;
    }
  }
}

export default new LocationService();
