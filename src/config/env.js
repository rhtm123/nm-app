// src/config/env.js
// Import environment variables from @env (configured in babel.config.js)
import {
  REACT_APP_API_BASE_URL,
  REACT_APP_API_TIMEOUT,
  PUBLIC_GOOGLE_WEB_CLIENT_ID,
  REACT_APP_NAME,
  REACT_APP_VERSION,
  REACT_PUBLIC_PHONEPE_MERCHANT_ID,
  REACT_PUBLIC_PHONEPE_APP_ID,
  REACT_PUBLIC_PHONEPE_SALT_KEY,
  REACT_PUBLIC_PHONEPE_SALT_INDEX,
  REACT_PUBLIC_PHONEPE_ENVIRONMENT,
} from '@env';

// Export configuration object
export const config = {
  api: {
    baseUrl: REACT_APP_API_BASE_URL,
    timeout: parseInt(REACT_APP_API_TIMEOUT || '10000', 10),
  },
  estoreId: {
    id: REACT_APP_ESTORE_ID,
  },
  google: {
    webClientId: PUBLIC_GOOGLE_WEB_CLIENT_ID,
  },
  app: {
    name: REACT_APP_NAME,
    version: REACT_APP_VERSION,
  },
  phonePe: {
    merchantId: REACT_PUBLIC_PHONEPE_MERCHANT_ID,
    appId: REACT_PUBLIC_PHONEPE_APP_ID,
    saltKey: REACT_PUBLIC_PHONEPE_SALT_KEY,
    saltIndex: REACT_PUBLIC_PHONEPE_SALT_INDEX,
    environment: REACT_PUBLIC_PHONEPE_ENVIRONMENT,
  },
};

// For debugging - you can remove this in production
if (__DEV__) {
  console.log('Environment Configuration:', config);
}

export default config;
