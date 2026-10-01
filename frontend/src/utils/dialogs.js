import { Alert, Platform } from 'react-native';

// Alert.alert button callbacks don't fire on react-native-web, so web uses window.alert/confirm.

export const showMessage = (title, message = '') => {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
};

export const confirmAction = ({ title, message, confirmText = 'OK', destructive = false, onConfirm }) => {
  if (Platform.OS === 'web') {
    if (window.confirm(message ? `${title}\n\n${message}` : title)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'No', style: 'cancel' },
    { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
};

export const confirmLogout = (onConfirm) =>
  confirmAction({
    title: 'Logout',
    message: 'Are you sure you want to logout?',
    confirmText: 'Logout',
    destructive: true,
    onConfirm,
  });

export const errorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
  if (!err) return fallback;
  if (err.message === 'Network Error') {
    return 'Cannot reach the server. Check that the backend is running and the API address is correct.';
  }
  return err.message || fallback;
};
