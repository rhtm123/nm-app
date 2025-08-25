import { useState } from 'react';

export const useAlert = () => {
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [],
    type: 'info'
  });

  const showAlert = ({ 
    title = 'Alert', 
    message = '', 
    buttons = [{ text: 'OK', onPress: () => {} }], 
    type = 'info' 
  }) => {
    setAlert({
      visible: true,
      title,
      message,
      buttons,
      type
    });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, visible: false }));
  };

  // Convenience methods for common alert types
  const showSuccess = (message, onPress) => {
    showAlert({
      title: 'Success',
      message,
      type: 'success',
      buttons: [{ text: 'OK', onPress: onPress || (() => {}) }]
    });
  };

  const showError = (message, onPress) => {
    showAlert({
      title: 'Error',
      message,
      type: 'error',
      buttons: [{ text: 'OK', onPress: onPress || (() => {}) }]
    });
  };

  const showInfo = (message, onPress) => {
    showAlert({
      title: 'Info',
      message,
      type: 'info',
      buttons: [{ text: 'OK', onPress: onPress || (() => {}) }]
    });
  };

  const showWarning = (message, onPress) => {
    showAlert({
      title: 'Warning',
      message,
      type: 'warning',
      buttons: [{ text: 'OK', onPress: onPress || (() => {}) }]
    });
  };

  const showConfirm = (title, message, onConfirm, onCancel) => {
    showAlert({
      title,
      message,
      type: 'confirm',
      buttons: [
        { 
          text: 'Cancel', 
          style: 'cancel', 
          onPress: onCancel || (() => {}) 
        },
        { 
          text: 'Confirm', 
          style: 'default', 
          onPress: onConfirm || (() => {}) 
        }
      ]
    });
  };

  const showDestructive = (title, message, onConfirm, onCancel, confirmText = 'Delete') => {
    showAlert({
      title,
      message,
      type: 'warning',
      buttons: [
        { 
          text: 'Cancel', 
          style: 'cancel', 
          onPress: onCancel || (() => {}) 
        },
        { 
          text: confirmText, 
          style: 'destructive', 
          onPress: onConfirm || (() => {}) 
        }
      ]
    });
  };

  return {
    alert,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showDestructive
  };
};

export default useAlert;
