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


// This file defines all the colors used in the app to match the website
export const colors = {
  primary: "#2563eb", // Blue color from the website
  secondary: "#1e40af",
  accent: "#10b981", // Green for deals/offers
  background: "#ffffff",
  surface: "#f8fafc",
  text: {
    primary: "#1f2937",
    secondary: "#6b7280",
    light: "#9ca3af",
  },
  border: "#e5e7eb",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  deal: "#dc2626", // Red for discount badges
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
}
