import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const persistSession = async ({ token, user }) => {
  await AsyncStorage.multiSet([
    ['userToken', token],
    ['userData', JSON.stringify(user)],
  ]);
  return { token, user };
};

export const loginUser = async (email, password) => {
  const { data } = await api.post('/auth/login', { email: email.trim(), password });
  return persistSession(data);
};

export const registerUser = async ({ name, email, password, phoneNumber }) => {
  const { data } = await api.post('/auth/register', {
    name: name.trim(),
    email: email.trim(),
    password,
    phoneNumber: phoneNumber.trim(),
  });
  return persistSession(data);
};

export const logoutUser = async () => {
  await AsyncStorage.multiRemove(['userToken', 'userData']);
};

export const getPatients = async () => (await api.get('/auth/users')).data;
