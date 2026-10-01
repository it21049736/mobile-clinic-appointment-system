import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import AuthNavigator from './AuthNavigator';
import PatientNavigator from './PatientNavigator';
import AdminNavigator from './AdminNavigator';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../constants/colors';
import { APP_NAME } from '../constants/config';

const RootNavigator = () => {
  const { userToken, user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary }}>
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    );
  }

  let navigator = <AuthNavigator />;
  if (userToken) navigator = user?.role === 'admin' ? <AdminNavigator /> : <PatientNavigator />;

  return (
    <NavigationContainer documentTitle={{ formatter: (options) => (options?.title ? `${options.title} | ${APP_NAME}` : APP_NAME) }}>
      {navigator}
    </NavigationContainer>
  );
};

export default RootNavigator;
