import React, { useState, useEffect } from 'react';
import useAuthStore from '../stores/authStore';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LoadingSpinner from '../components/LoadingSpinner';
import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/endpoints';

const AddressesScreen = () => {
  const { user } = useAuthStore();
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
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-lg shadow-gray-300/50 border border-gray-100">
      <Text className="font-bold text-gray-800 text-base mb-1">{item.name} ({item.mobile})</Text>
      <Text className="text-gray-600 mb-3">
        {item.address?.line1}, {item.address?.line2}, {item.address?.city}, {item.address?.state} - {item.address?.pin}
      </Text>
      <View className="flex-row">
        <TouchableOpacity 
          onPress={() => handleEdit(item)} 
          className="mr-4"
          activeOpacity={0.7}
        >
          <Text className="text-blue-600 font-medium">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleDelete(item.id)}
          activeOpacity={0.7}
        >
          <Text className="text-red-600 font-medium">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 p-4">
        <Text className="text-white text-xl font-bold">Saved Addresses</Text>
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View className="p-4">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      )}

      {/* Addresses List */}
      <FlatList
        data={addresses}
        keyExtractor={item => item.id.toString()}
        renderItem={renderAddress}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          !loading && (
            <View className="items-center justify-center p-8">
              <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="location-outline" size={32} color="#9ca3af" />
              </View>
              <Text className="text-gray-600 text-center">No addresses found.</Text>
            </View>
          )
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Add/Edit Form */}
      <View className="bg-white p-4 border-t border-gray-200">
        <Text className="font-bold text-gray-800 text-lg mb-4">
          {editing ? 'Edit Address' : 'Add New Address'}
        </Text>
        
        <TextInput 
          placeholder="Name" 
          value={form.name} 
          onChangeText={v => setForm(f => ({ ...f, name: v }))} 
          className="border border-gray-300 rounded-xl px-4 py-3 mb-3 text-gray-800 bg-white"
        />
        <TextInput 
          placeholder="Mobile" 
          value={form.mobile} 
          onChangeText={v => setForm(f => ({ ...f, mobile: v }))} 
          className="border border-gray-300 rounded-xl px-4 py-3 mb-3 text-gray-800 bg-white"
          keyboardType="phone-pad" 
        />
        <TextInput 
          placeholder="Line 1" 
          value={form.line1} 
          onChangeText={v => setForm(f => ({ ...f, line1: v }))} 
          className="border border-gray-300 rounded-xl px-4 py-3 mb-3 text-gray-800 bg-white"
        />
        <TextInput 
          placeholder="Line 2" 
          value={form.line2} 
          onChangeText={v => setForm(f => ({ ...f, line2: v }))} 
          className="border border-gray-300 rounded-xl px-4 py-3 mb-3 text-gray-800 bg-white"
        />
        <TextInput 
          placeholder="City" 
          value={form.city} 
          onChangeText={v => setForm(f => ({ ...f, city: v }))} 
          className="border border-gray-300 rounded-xl px-4 py-3 mb-3 text-gray-800 bg-white"
        />
        <TextInput 
          placeholder="State" 
          value={form.state} 
          onChangeText={v => setForm(f => ({ ...f, state: v }))} 
          className="border border-gray-300 rounded-xl px-4 py-3 mb-3 text-gray-800 bg-white"
        />
        <TextInput 
          placeholder="PIN" 
          value={form.pin} 
          onChangeText={v => setForm(f => ({ ...f, pin: v }))} 
          className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-gray-800 bg-white"
          keyboardType="number-pad" 
        />
        
        <TouchableOpacity 
          className={`py-4 rounded-xl items-center ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}
          onPress={handleSave} 
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-base">
            {editing ? 'Update' : 'Add'} Address
          </Text>
        </TouchableOpacity>
        
        {editing && (
          <TouchableOpacity 
            onPress={() => { 
              setEditing(null); 
              setForm({ name: '', mobile: '', line1: '', line2: '', city: '', state: '', pin: '' }); 
            }}
            className="items-center mt-3"
            activeOpacity={0.7}
          >
            <Text className="text-red-600 font-medium">Cancel Edit</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default AddressesScreen; 