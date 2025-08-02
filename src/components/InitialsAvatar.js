import React from 'react';
import { View, Text } from 'react-native';

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

const InitialsAvatar = ({ name = '', size = 36, className = '' }) => {
  const initials = getInitials(name);
  const backgroundColor = getColor(initials);
  
  return (
    <View
      className={`items-center justify-center rounded-full ${className}`}
      style={{ 
        width: size, 
        height: size, 
        backgroundColor 
      }}
    >
      <Text 
        className="text-white font-bold"
        style={{ fontSize: size * 0.4 }}
      >
        {initials}
      </Text>
    </View>
  );
};

export default InitialsAvatar; 