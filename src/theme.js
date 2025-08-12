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
  // Primary brand colors
  primary: "#2563eb", // Main blue
  primaryDark: "#1d4ed8",
  primaryLight: "#3b82f6",
  secondary: "#1e40af",
  accent: "#10b981", // Green for deals/offers
  
  // Background colors
  background: "#ffffff",
  backgroundSecondary: "#f8fafc",
  surface: "#ffffff",
  surfaceSecondary: "#f1f5f9",
  
  // Text colors
  text: {
    primary: "#1f2937",
    secondary: "#6b7280",
    light: "#9ca3af",
    white: "#ffffff",
    muted: "#64748b",
  },
  
  // Border colors
  border: {
    primary: "#e5e7eb",
    secondary: "#d1d5db",
    light: "#f3f4f6",
  },
  
  // Status colors
  success: "#10b981",
  successLight: "#d1fae5",
  warning: "#f59e0b",
  warningLight: "#fef3c7",
  error: "#ef4444",
  errorLight: "#fee2e2",
  info: "#3b82f6",
  infoLight: "#dbeafe",
  
  // Product specific colors
  deal: "#dc2626", // Red for discount badges
  dealLight: "#fecaca",
  orange: "#f97316",
  orangeLight: "#fed7aa",
  
  // Rating colors
  rating: "#f59e0b",
  ratingLight: "#fef3c7",
  
  // Cart and action colors
  cart: {
    add: "#2563eb",
    remove: "#ef4444",
    quantity: "#1f2937",
    background: "#f8fafc",
    border: "#e2e8f0",
  },
  
  // Gray scale
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
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
