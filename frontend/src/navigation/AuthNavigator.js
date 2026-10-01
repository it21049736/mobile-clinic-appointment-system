import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandingScreen from '../screens/auth/LandingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import { COLORS } from '../constants/colors';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => (
  <Stack.Navigator
    initialRouteName="Landing"
    screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.primary } }}
  >
    <Stack.Screen name="Landing" component={LandingScreen} options={{ title: 'Welcome' }} />
    <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Log In' }} />
    <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
  </Stack.Navigator>
);

export default AuthNavigator;
