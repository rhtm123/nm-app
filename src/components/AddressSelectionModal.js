import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme';
import locationService from '../services/locationService';
import useAuthStore from '../stores/authStore';

const AddressSelectionModal = ({ 
  visible, 
  onClose, 
  onAddressSelected,
  currentAddress 
}) => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('addresses'); // 'addresses' or 'manual'
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [manualPincode, setManualPincode] = useState('');
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState(null);

  useEffect(() => {
    if (visible && user?.id) {
      loadAddresses();
    }
  }, [visible, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const userAddresses = await locationService.getUserAddresses(user.id);
      setAddresses(userAddresses);
    } catch (error) {
      console.error('Failed to load addresses:', error);
      Alert.alert('Error', 'Failed to load saved addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = async (address) => {
    try {
      setLoading(true);
      const deliveryStatus = await locationService.setSelectedAddress(address.address);
      onAddressSelected(deliveryStatus);
      onClose();
    } catch (error) {
      console.error('Failed to select address:', error);
      Alert.alert('Error', 'Failed to update delivery location');
    } finally {
      setLoading(false);
    }
  };

  const checkManualPincode = async () => {
    if (!manualPincode || manualPincode.length < 6) {
      Alert.alert('Invalid Pincode', 'Please enter a valid 6-digit pincode');
      return;
    }

    try {
      setCheckingPincode(true);
      const availability = await locationService.checkDeliveryAvailability(manualPincode);
      setPincodeStatus(availability);

      if (availability.isAvailable) {
        const deliveryStatus = await locationService.setSelectedAddress({
          pin: manualPincode,
          city: availability.deliveryInfo.city,
          state: availability.deliveryInfo.state,
        });
        onAddressSelected(deliveryStatus);
        onClose();
      }
    } catch (error) {
      console.error('Failed to check pincode:', error);
      Alert.alert('Error', 'Failed to check delivery availability');
    } finally {
      setCheckingPincode(false);
    }
  };

  const renderAddressList = () => {
    if (loading) {
      return (
        <View className="flex-1 items-center justify-center py-8">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text.secondary }} className="mt-2">
            Loading addresses...
          </Text>
        </View>
      );
    }

    if (addresses.length === 0) {
      return (
        <View className="flex-1 items-center justify-center py-8">
          <Ionicons name="location-outline" size={48} color={colors.text.light} />
          <Text style={{ color: colors.text.primary }} className="text-lg font-semibold mt-4 mb-2">
            No Saved Addresses
          </Text>
          <Text style={{ color: colors.text.secondary }} className="text-center px-4">
            You haven't saved any addresses yet. Use the manual entry to add your pincode.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {addresses.map((address, index) => (
          <TouchableOpacity
            key={address.id}
            onPress={() => handleAddressSelect(address)}
            style={{ 
              backgroundColor: colors.surface,
              borderColor: colors.border.primary,
            }}
            className="p-4 rounded-xl mb-3 border"
          >
            <View className="flex-row items-start">
              <View 
                style={{ backgroundColor: colors.infoLight }} 
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
              >
                <Ionicons 
                  name={address.type === 'home' ? 'home' : address.type === 'work' ? 'business' : 'location'} 
                  size={20} 
                  color={colors.primary} 
                />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text style={{ color: colors.text.primary }} className="font-semibold text-base">
                    {address.name}
                  </Text>
                  {address.is_default && (
                    <View 
                      style={{ backgroundColor: colors.success }} 
                      className="ml-2 px-2 py-1 rounded-full"
                    >
                      <Text style={{ color: colors.text.white }} className="text-xs font-medium">
                        Default
                      </Text>
                    </View>
                  )}
                </View>
                {address.address && (
                  <View>
                    <Text style={{ color: colors.text.secondary }} className="text-sm mb-1">
                      {address.address.line1}
                      {address.address.line2 ? `, ${address.address.line2}` : ''}
                    </Text>
                    <Text style={{ color: colors.text.secondary }} className="text-sm">
                      {address.address.city}, {address.address.state} - {address.address.pin}
                    </Text>
                  </View>
                )}
                <Text style={{ color: colors.text.light }} className="text-xs mt-1">
                  {address.mobile}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.text.light} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderManualEntry = () => {
    return (
      <View className="flex-1">
        <View className="mb-6">
          <Text style={{ color: colors.text.primary }} className="text-lg font-semibold mb-2">
            Enter Pincode Manually
          </Text>
          <Text style={{ color: colors.text.secondary }} className="text-sm mb-4">
            Enter your area pincode to check delivery availability
          </Text>

          <View className="relative">
            <TextInput
              style={{ 
                borderColor: colors.border.primary,
                color: colors.text.primary,
              }}
              className="border rounded-xl px-4 py-3 text-base"
              placeholder="Enter 6-digit pincode"
              placeholderTextColor={colors.text.light}
              value={manualPincode}
              onChangeText={setManualPincode}
              keyboardType="numeric"
              maxLength={6}
              editable={!checkingPincode}
            />
            {checkingPincode && (
              <View className="absolute right-3 top-3">
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            )}
          </View>

          {pincodeStatus && (
            <View className="mt-3">
              {pincodeStatus.isAvailable ? (
                <View 
                  style={{ backgroundColor: colors.successLight }}
                  className="p-3 rounded-lg flex-row items-center"
                >
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <View className="ml-2 flex-1">
                    <Text style={{ color: colors.success }} className="font-semibold">
                      Delivery Available!
                    </Text>
                    <Text style={{ color: colors.success }} className="text-sm">
                      We deliver to {pincodeStatus.deliveryInfo?.city}, {pincodeStatus.deliveryInfo?.state}
                    </Text>
                  </View>
                </View>
              ) : (
                <View 
                  style={{ backgroundColor: colors.errorLight }}
                  className="p-3 rounded-lg flex-row items-center"
                >
                  <Ionicons name="close-circle" size={20} color={colors.error} />
                  <View className="ml-2 flex-1">
                    <Text style={{ color: colors.error }} className="font-semibold">
                      Delivery Not Available
                    </Text>
                    <Text style={{ color: colors.error }} className="text-sm">
                      We don't deliver to this pincode yet
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity
            onPress={checkManualPincode}
            disabled={!manualPincode || manualPincode.length < 6 || checkingPincode}
            style={{ 
              backgroundColor: (!manualPincode || manualPincode.length < 6 || checkingPincode) 
                ? colors.gray[300] 
                : colors.primary 
            }}
            className="mt-4 py-3 px-6 rounded-xl flex-row items-center justify-center"
          >
            {checkingPincode ? (
              <ActivityIndicator size="small" color={colors.text.white} />
            ) : (
              <>
                <Ionicons name="search" size={20} color={colors.text.white} />
                <Text style={{ color: colors.text.white }} className="ml-2 font-semibold">
                  Check Availability
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View className="mt-auto">
          <View 
            style={{ backgroundColor: colors.infoLight }} 
            className="p-4 rounded-xl flex-row items-start"
          >
            <Ionicons name="information-circle" size={20} color={colors.info} />
            <View className="ml-3 flex-1">
              <Text style={{ color: colors.info }} className="font-semibold text-sm mb-1">
                Current Service Area
              </Text>
              <Text style={{ color: colors.info }} className="text-xs">
                We currently deliver to selected areas in Maharashtra. More locations coming soon!
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ backgroundColor: colors.backgroundSecondary }} className="flex-1">
        {/* Header */}
        <View 
          style={{ backgroundColor: colors.surface, borderBottomColor: colors.border.primary }}
          className="border-b"
        >
          <View className="flex-row items-center justify-between px-4 py-3">
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={{ color: colors.text.primary }} className="text-lg font-semibold">
              Select Delivery Location
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Tabs */}
          <View className="flex-row px-4 pb-3">
            <TouchableOpacity
              onPress={() => setActiveTab('addresses')}
              style={{ 
                borderBottomColor: activeTab === 'addresses' ? colors.primary : 'transparent',
              }}
              className="flex-1 items-center py-2 border-b-2"
            >
              <Text 
                style={{ 
                  color: activeTab === 'addresses' ? colors.primary : colors.text.secondary,
                }}
                className="font-semibold"
              >
                Saved Addresses
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('manual')}
              style={{ 
                borderBottomColor: activeTab === 'manual' ? colors.primary : 'transparent',
              }}
              className="flex-1 items-center py-2 border-b-2"
            >
              <Text 
                style={{ 
                  color: activeTab === 'manual' ? colors.primary : colors.text.secondary,
                }}
                className="font-semibold"
              >
                Enter Pincode
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 p-4">
          {activeTab === 'addresses' ? renderAddressList() : renderManualEntry()}
        </View>
      </View>
    </Modal>
  );
};

export default AddressSelectionModal;
