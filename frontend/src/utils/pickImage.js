import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { showMessage } from './dialogs';

// Returns an image asset { uri, mimeType, fileName } or null if the user cancelled.
export const pickImage = async () => {
  if (Platform.OS !== 'web') {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      showMessage('Permission needed', 'Allow photo library access to choose a profile image.');
      return null;
    }
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });
  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  const mimeType = asset.mimeType || (asset.uri.startsWith('data:') ? asset.uri.slice(5, asset.uri.indexOf(';')) : 'image/jpeg');
  if (!/^image\/(jpe?g|png)$/.test(mimeType)) {
    showMessage('Unsupported image', 'Please choose a JPG or PNG image.');
    return null;
  }
  return { uri: asset.uri, mimeType, fileName: asset.fileName };
};
