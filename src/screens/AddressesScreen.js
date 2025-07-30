import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography } from '../theme';
import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/endpoints';

const AddressesScreen = ({ navigation }) => {
  const { user } = useAuth();
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
    <View style={styles.card}>
      <Text style={styles.name}>{item.name} ({item.mobile})</Text>
      <Text style={styles.address}>{item.address?.line1}, {item.address?.line2}, {item.address?.city}, {item.address?.state} - {item.address?.pin}</Text>
      <View style={{ flexDirection: 'row', marginTop: 8 }}>
        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editBtn}><Text style={{ color: colors.primary }}>Edit</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}><Text style={{ color: colors.error }}>Delete</Text></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}><Text style={styles.headerText}>Saved Addresses</Text></View>
      {loading && <ActivityIndicator style={{ margin: 16 }} />}
      <FlatList
        data={addresses}
        keyExtractor={item => item.id.toString()}
        renderItem={renderAddress}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={!loading && <Text style={{ textAlign: 'center', color: colors.text.secondary }}>No addresses found.</Text>}
      />
      <View style={styles.form}>
        <Text style={styles.formTitle}>{editing ? 'Edit Address' : 'Add New Address'}</Text>
        <TextInput placeholder="Name" value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} style={styles.input} />
        <TextInput placeholder="Mobile" value={form.mobile} onChangeText={v => setForm(f => ({ ...f, mobile: v }))} style={styles.input} keyboardType="phone-pad" />
        <TextInput placeholder="Line 1" value={form.line1} onChangeText={v => setForm(f => ({ ...f, line1: v }))} style={styles.input} />
        <TextInput placeholder="Line 2" value={form.line2} onChangeText={v => setForm(f => ({ ...f, line2: v }))} style={styles.input} />
        <TextInput placeholder="City" value={form.city} onChangeText={v => setForm(f => ({ ...f, city: v }))} style={styles.input} />
        <TextInput placeholder="State" value={form.state} onChangeText={v => setForm(f => ({ ...f, state: v }))} style={styles.input} />
        <TextInput placeholder="PIN" value={form.pin} onChangeText={v => setForm(f => ({ ...f, pin: v }))} style={styles.input} keyboardType="number-pad" />
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>{editing ? 'Update' : 'Add'} Address</Text>
        </TouchableOpacity>
        {editing && <TouchableOpacity onPress={() => { setEditing(null); setForm({ name: '', mobile: '', line1: '', line2: '', city: '', state: '', pin: '' }); }}><Text style={{ color: colors.error, textAlign: 'center', marginTop: 8 }}>Cancel Edit</Text></TouchableOpacity>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { padding: 16, backgroundColor: colors.primary },
  headerText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, elevation: 2 },
  name: { fontWeight: 'bold', fontSize: 16, marginBottom: 2 },
  address: { color: colors.text.secondary },
  editBtn: { marginRight: 16 },
  deleteBtn: {},
  form: { backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderColor: colors.border },
  formTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 6, padding: 8, marginBottom: 8 },
  saveBtn: { backgroundColor: colors.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
});

export default AddressesScreen; 