import React, { useState, useEffect } from 'react';
import useAuthStore from '../stores/authStore';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LoadingSpinner from '../components/LoadingSpinner';
import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/endpoints';
import { colors, spacing, typography } from '../theme';

const AddressesScreen = () => {
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', mobile: '', line1: '', line2: '', city: '', state: '', pin: '' });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(API_ENDPOINTS.SHIPPING_ADDRESSES + `?user_id=${user?.id}`);
      setAddresses(res.data.results || []);
    } catch (e) {
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (editing) {
        await apiClient.put(API_ENDPOINTS.SHIPPING_ADDRESS_BY_ID(editing.id), { ...form, user_id: user.id });
      } else {
        await apiClient.post(API_ENDPOINTS.SHIPPING_ADDRESSES, { ...form, user_id: user.id });
      }
      setForm({ name: '', mobile: '', line1: '', line2: '', city: '', state: '', pin: '' });
      setEditing(null);
      fetchAddresses();
    } catch (e) {
      Alert.alert('Error', 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    setEditing(address);
    setForm({
      name: address.name,
      mobile: address.mobile,
      line1: address.address?.line1 || '',
      line2: address.address?.line2 || '',
      city: address.address?.city || '',
      state: address.address?.state || '',
      pin: address.address?.pin || '',
    });
  };

  const handleDelete = async (id) => {
    Alert.alert('Delete', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          setLoading(true);
          try {
            await apiClient.delete(API_ENDPOINTS.SHIPPING_ADDRESS_BY_ID(id));
            fetchAddresses();
          } catch (e) {
            Alert.alert('Error', 'Failed to delete address');
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  const renderAddress = ({ item }) => (
    <View style={{
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: spacing.md,
      marginBottom: spacing.md,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border.light,
    }}>
      {/* Header with Icon */}
      <View className="flex-row items-start mb-3">
        <View style={{
          backgroundColor: colors.primary + '15',
          width: 48,
          height: 48,
          borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: spacing.sm,
        }}>
          <Ionicons name="home" size={24} color={colors.primary} />
        </View>
        <View className="flex-1">
          <Text style={{
            color: colors.text.primary,
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.bold,
            marginBottom: 2,
          }}>
            {item.name}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="call" size={14} color={colors.text.secondary} />
            <Text style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.sm,
              marginLeft: 4,
            }}>
              {item.mobile}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Address Details */}
      <View style={{
        backgroundColor: colors.backgroundSecondary,
        padding: spacing.sm,
        borderRadius: 8,
        marginBottom: spacing.sm,
      }}>
        <View className="flex-row items-start mb-1">
          <Ionicons name="location" size={16} color={colors.accent} style={{ marginTop: 2, marginRight: 6 }} />
          <Text style={{
            color: colors.text.primary,
            fontSize: typography.sizes.md,
            lineHeight: 20,
            flex: 1,
          }}>
            {item.address?.line1}
            {item.address?.line2 && `, ${item.address.line2}`}
          </Text>
        </View>
        <Text style={{
          color: colors.text.secondary,
          fontSize: typography.sizes.sm,
          marginLeft: 22,
        }}>
          {item.address?.city}, {item.address?.state} - {item.address?.pin}
        </Text>
      </View>
      
      {/* Action Buttons */}
      <View className="flex-row justify-end">
        <TouchableOpacity 
          onPress={() => handleEdit(item)} 
          style={{
            backgroundColor: colors.primary + '10',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: 20,
            marginRight: spacing.sm,
            flexDirection: 'row',
            alignItems: 'center',
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="pencil" size={14} color={colors.primary} style={{ marginRight: 4 }} />
          <Text style={{
            color: colors.primary,
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.medium,
          }}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleDelete(item.id)}
          style={{
            backgroundColor: colors.error + '10',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center',
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="trash" size={14} color={colors.error} style={{ marginRight: 4 }} />
          <Text style={{
            color: colors.error,
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.medium,
          }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}>
      {/* Header Section */}
      <View style={{
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
      }}>
        <View className="flex-row items-center justify-between mb-2">
          <Text style={{
            color: colors.text.white,
            fontSize: typography.sizes.xxl,
            fontWeight: typography.weights.bold,
          }}>Saved Addresses</Text>
          <View style={{
            backgroundColor: colors.text.white + '20',
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Ionicons name="location" size={20} color={colors.text.white} />
          </View>
        </View>
        <Text style={{
          color: colors.text.white + 'CC',
          fontSize: typography.sizes.md,
        }}>Manage your delivery locations</Text>
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={{ padding: spacing.md, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.sm,
            marginTop: spacing.xs,
          }}>Loading addresses...</Text>
        </View>
      )}

      {/* Addresses List */}
      <View style={{ padding: spacing.md }}>
        {addresses.length > 0 ? (
          addresses.map((item, index) => (
            <View key={item.id.toString()}>
              {renderAddress({ item })}
            </View>
          ))
        ) : !loading ? (
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: spacing.xl,
          }}>
            <View style={{
              width: 80,
              height: 80,
              backgroundColor: colors.primary + '15',
              borderRadius: 40,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: spacing.md,
            }}>
              <Ionicons name="location-outline" size={40} color={colors.primary} />
            </View>
            <Text style={{
              color: colors.text.primary,
              fontSize: typography.sizes.lg,
              fontWeight: typography.weights.semibold,
              marginBottom: spacing.xs,
            }}>No addresses found</Text>
            <Text style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.sm,
              textAlign: 'center',
              lineHeight: 20,
            }}>Add your first address to get started with deliveries</Text>
          </View>
        ) : null}
      </View>

      {/* Add/Edit Form */}
      <View style={{
        backgroundColor: colors.surface,
        margin: spacing.md,
        borderRadius: 16,
        padding: spacing.md,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}>
        <View className="flex-row items-center mb-4">
          <View style={{
            backgroundColor: editing ? colors.warning + '15' : colors.accent + '15',
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: spacing.sm,
          }}>
            <Ionicons 
              name={editing ? "pencil" : "add-circle"} 
              size={20} 
              color={editing ? colors.warning : colors.accent} 
            />
          </View>
          <Text style={{
            color: colors.text.primary,
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.bold,
          }}>
            {editing ? 'Edit Address' : 'Add New Address'}
          </Text>
        </View>
        
        {/* Form Fields */}
        <View className="space-y-3">
          <TextInput 
            placeholder="Full Name" 
            value={form.name} 
            onChangeText={v => setForm(f => ({ ...f, name: v }))}
            style={{
              borderWidth: 1,
              borderColor: colors.border.primary,
              borderRadius: 12,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm + 2,
              marginBottom: spacing.sm,
              color: colors.text.primary,
              backgroundColor: colors.backgroundSecondary,
              fontSize: typography.sizes.md,
            }}
            placeholderTextColor={colors.text.light}
          />
          <TextInput 
            placeholder="Mobile Number" 
            value={form.mobile} 
            onChangeText={v => setForm(f => ({ ...f, mobile: v }))}
            style={{
              borderWidth: 1,
              borderColor: colors.border.primary,
              borderRadius: 12,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm + 2,
              marginBottom: spacing.sm,
              color: colors.text.primary,
              backgroundColor: colors.backgroundSecondary,
              fontSize: typography.sizes.md,
            }}
            placeholderTextColor={colors.text.light}
            keyboardType="phone-pad" 
          />
          <TextInput 
            placeholder="Address Line 1 (House No, Street)" 
            value={form.line1} 
            onChangeText={v => setForm(f => ({ ...f, line1: v }))}
            style={{
              borderWidth: 1,
              borderColor: colors.border.primary,
              borderRadius: 12,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm + 2,
              marginBottom: spacing.sm,
              color: colors.text.primary,
              backgroundColor: colors.backgroundSecondary,
              fontSize: typography.sizes.md,
            }}
            placeholderTextColor={colors.text.light}
          />
          <TextInput 
            placeholder="Address Line 2 (Landmark - Optional)" 
            value={form.line2} 
            onChangeText={v => setForm(f => ({ ...f, line2: v }))}
            style={{
              borderWidth: 1,
              borderColor: colors.border.primary,
              borderRadius: 12,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm + 2,
              marginBottom: spacing.sm,
              color: colors.text.primary,
              backgroundColor: colors.backgroundSecondary,
              fontSize: typography.sizes.md,
            }}
            placeholderTextColor={colors.text.light}
          />
          <View className="flex-row space-x-2">
            <TextInput 
              placeholder="City" 
              value={form.city} 
              onChangeText={v => setForm(f => ({ ...f, city: v }))}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: colors.border.primary,
                borderRadius: 12,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm + 2,
                marginBottom: spacing.sm,
                color: colors.text.primary,
                backgroundColor: colors.backgroundSecondary,
                fontSize: typography.sizes.md,
                marginRight: spacing.xs,
              }}
              placeholderTextColor={colors.text.light}
            />
            <TextInput 
              placeholder="PIN Code" 
              value={form.pin} 
              onChangeText={v => setForm(f => ({ ...f, pin: v }))}
              style={{
                width: 100,
                borderWidth: 1,
                borderColor: colors.border.primary,
                borderRadius: 12,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.sm + 2,
                marginBottom: spacing.sm,
                color: colors.text.primary,
                backgroundColor: colors.backgroundSecondary,
                fontSize: typography.sizes.md,
              }}
              placeholderTextColor={colors.text.light}
              keyboardType="number-pad" 
            />
          </View>
          <TextInput 
            placeholder="State" 
            value={form.state} 
            onChangeText={v => setForm(f => ({ ...f, state: v }))}
            style={{
              borderWidth: 1,
              borderColor: colors.border.primary,
              borderRadius: 12,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm + 2,
              marginBottom: spacing.md,
              color: colors.text.primary,
              backgroundColor: colors.backgroundSecondary,
              fontSize: typography.sizes.md,
            }}
            placeholderTextColor={colors.text.light}
          />
        </View>
        
        {/* Action Buttons */}
        <TouchableOpacity 
          style={{
            backgroundColor: loading ? colors.gray[400] : colors.primary,
            paddingVertical: spacing.md,
            borderRadius: 12,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: spacing.sm,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: loading ? 0 : 0.3,
            shadowRadius: 8,
            elevation: loading ? 0 : 4,
          }}
          onPress={handleSave} 
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.text.white} style={{ marginRight: spacing.xs }} />
          ) : (
            <Ionicons 
              name={editing ? "checkmark-circle" : "add-circle"} 
              size={20} 
              color={colors.text.white} 
              style={{ marginRight: spacing.xs }} 
            />
          )}
          <Text style={{
            color: colors.text.white,
            fontSize: typography.sizes.md,
            fontWeight: typography.weights.bold,
          }}>
            {loading ? 'Saving...' : (editing ? 'Update Address' : 'Add Address')}
          </Text>
        </TouchableOpacity>
        
        {editing && (
          <TouchableOpacity 
            onPress={() => { 
              setEditing(null); 
              setForm({ name: '', mobile: '', line1: '', line2: '', city: '', state: '', pin: '' }); 
            }}
            style={{
              alignItems: 'center',
              paddingVertical: spacing.sm,
            }}
            activeOpacity={0.7}
          >
            <Text style={{
              color: colors.error,
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.medium,
            }}>Cancel Edit</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Dynamic Bottom Spacing for Safe Area */}
      <View style={{ height: Math.max(insets.bottom + 48, 64) }} />
    </ScrollView>
  );
};

export default AddressesScreen; 