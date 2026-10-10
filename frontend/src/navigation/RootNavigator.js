import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import AuthNavigator from './AuthNavigator';
import PatientNavigator from './PatientNavigator';
import AdminNavigator from './AdminNavigator';
import { navigationTheme } from './navTheme';
import { GlassBackground } from '../components/Glass';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../constants/colors';
import { APP_NAME } from '../constants/config';

const RootNavigator = () => {
  const { userToken, user, isLoading } = useContext(AuthContext);

  let navigator = <AuthNavigator />;
  if (userToken) navigator = user?.role === 'admin' ? <AdminNavigator /> : <PatientNavigator />;

  return (
    <GlassBackground>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <NavigationContainer
          theme={navigationTheme}
          documentTitle={{ formatter: (options) => (options?.title ? `${options.title} | ${APP_NAME}` : APP_NAME) }}
        >
          {navigator}
        </NavigationContainer>
      )}
    </GlassBackground>
  );
};

export default RootNavigator;
