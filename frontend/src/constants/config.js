import { Platform } from 'react-native';
import Constants from 'expo-constants';

const API_PORT = 5000;
// Used only if the dev server address can't be detected (e.g. a standalone build).
const FALLBACK_LAN_IP = '172.20.10.4';

// In Expo Go, hostUri is "<computer-ip>:8081" — the backend runs on that same computer.
const devHost = Constants.expoConfig?.hostUri?.split(':')[0];

const resolveApiUrl = () => {
  if (Platform.OS === 'web') return `http://localhost:${API_PORT}`;
  if (devHost && devHost !== 'localhost' && devHost !== '127.0.0.1') return `http://${devHost}:${API_PORT}`;
  // Android emulator reaches the host machine's loopback through 10.0.2.2.
  if (devHost && Platform.OS === 'android') return `http://10.0.2.2:${API_PORT}`;
  if (devHost) return `http://localhost:${API_PORT}`;
  return `http://${FALLBACK_LAN_IP}:${API_PORT}`;
};

export const API_BASE_URL = resolveApiUrl();

export const APP_NAME = 'MediCare Mobile Clinic';
export const APP_TAGLINE = 'Book your doctor, skip the queue';
export const APP_VERSION = '1.0.0';

export const imageUrl = (path, version) => {
  if (!path) return null;
  const url = `${API_BASE_URL}/${path}`;
  return version ? `${url}?v=${encodeURIComponent(version)}` : url;
};
