import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

const getInitials = (name = '') => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getColor = (str) => {
  // Simple hash to pick a color
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 60%)`;
};

const InitialsAvatar = ({ name = '', size = 36, style }) => {
  const initials = getInitials(name);
  const backgroundColor = getColor(initials);
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.5 }]}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  initials: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default InitialsAvatar; 