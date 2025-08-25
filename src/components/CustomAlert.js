import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme';

const CustomAlert = ({ 
  visible, 
  onClose, 
  title = "Alert", 
  message = "", 
  buttons = [{ text: "OK", onPress: () => {}, style: "default" }],
  type = "info" // "success", "error", "warning", "info", "confirm"
}) => {

  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle', color: colors.success, bg: colors.successLight };
      case 'error':
        return { name: 'close-circle', color: colors.error, bg: colors.errorLight };
      case 'warning':
        return { name: 'warning', color: colors.warning, bg: colors.warningLight };
      case 'confirm':
        return { name: 'help-circle', color: colors.info, bg: colors.infoLight };
      default:
        return { name: 'information-circle', color: colors.info, bg: colors.infoLight };
    }
  };

  const iconConfig = getIconConfig();


  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View 
        className="flex-1 justify-center items-center px-6"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <View
          className="bg-white rounded-2xl w-full max-w-sm overflow-hidden"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {/* Header with Icon */}
          <View className="items-center pt-6 pb-4">
            <View 
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: iconConfig.bg }}
            >
              <Ionicons name={iconConfig.name} size={32} color={iconConfig.color} />
            </View>
            <Text className="text-xl font-bold text-gray-900 text-center mb-2">
              {title}
            </Text>
            {message ? (
              <Text className="text-base text-gray-600 text-center leading-6 px-4">
                {message}
              </Text>
            ) : null}
          </View>

          {/* Buttons */}
          <View className="border-t border-gray-100">
            {buttons.length === 1 ? (
              <TouchableOpacity
                onPress={() => {
                  buttons[0].onPress?.();
                  onClose();
                }}
                className="py-4 items-center"
                activeOpacity={0.7}
              >
                <Text 
                  className="text-base font-semibold"
                  style={{ 
                    color: buttons[0].style === 'destructive' ? colors.error : colors.primary 
                  }}
                >
                  {buttons[0].text}
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-row">
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      button.onPress?.();
                      onClose();
                    }}
                    className={`flex-1 py-4 items-center ${
                      index > 0 ? 'border-l border-gray-100' : ''
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text 
                      className={`text-base ${
                        button.style === 'destructive' ? 'font-semibold' : 
                        button.style === 'cancel' ? 'font-normal' : 'font-semibold'
                      }`}
                      style={{ 
                        color: button.style === 'destructive' ? colors.error :
                               button.style === 'cancel' ? colors.gray[600] : colors.primary
                      }}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;
