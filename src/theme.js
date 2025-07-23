// src/theme.js

export const LightTheme = {
  dark: false,
  colors: {
    primary: '#6200ee',
    background: '#ffffff',
    card: '#f5f5f5',
    text: '#000000',
    border: '#cccccc',
    notification: '#ff80ab',
  },
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100',
    },
  },
};

export const DarkTheme = {
  dark: true,
  colors: {
    primary: '#1E90FF',
    background: '#121212',
    card: '#1e1e1e',
    text: '#ffffff',
    border: '#272727',
    notification: '#ff6347',
  },
};
