import React from 'react';
import { useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import DoctorListScreen from '../screens/doctors/DoctorListScreen';
import DoctorDetailScreen from '../screens/doctors/DoctorDetailScreen';
import DoctorFormScreen from '../screens/doctors/DoctorFormScreen';
import AppointmentListScreen from '../screens/appointments/AppointmentListScreen';
import AppointmentDetailScreen from '../screens/appointments/AppointmentDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { stackScreenOptions, tabScreenOptions } from './navTheme';

const Tab = createBottomTabNavigator();
const DashboardStack = createNativeStackNavigator();
const DoctorsStack = createNativeStackNavigator();
const AppointmentsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const DashboardStackScreen = () => (
  <DashboardStack.Navigator screenOptions={stackScreenOptions}>
    <DashboardStack.Screen name="Dashboard" component={AdminDashboardScreen} options={{ headerShown: false }} />
    <DashboardStack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} options={{ title: 'Appointment' }} />
  </DashboardStack.Navigator>
);

const DoctorsStackScreen = () => (
  <DoctorsStack.Navigator screenOptions={stackScreenOptions}>
    <DoctorsStack.Screen name="DoctorList" component={DoctorListScreen} options={{ title: 'Manage Doctors' }} />
    <DoctorsStack.Screen name="DoctorDetail" component={DoctorDetailScreen} options={{ title: 'Doctor Profile' }} />
    <DoctorsStack.Screen name="DoctorForm" component={DoctorFormScreen} options={{ title: 'Add Doctor' }} />
  </DoctorsStack.Navigator>
);

const AppointmentsStackScreen = () => (
  <AppointmentsStack.Navigator screenOptions={stackScreenOptions}>
    <AppointmentsStack.Screen name="AppointmentList" component={AppointmentListScreen} options={{ title: 'All Appointments' }} />
    <AppointmentsStack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} options={{ title: 'Appointment' }} />
  </AppointmentsStack.Navigator>
);

const ProfileStackScreen = () => (
  <ProfileStack.Navigator screenOptions={stackScreenOptions}>
    <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Admin Profile' }} />
  </ProfileStack.Navigator>
);

const ICONS = {
  DashboardTab: ['grid', 'grid-outline'],
  DoctorsTab: ['medkit', 'medkit-outline'],
  AppointmentsTab: ['calendar', 'calendar-outline'],
  ProfileTab: ['person', 'person-outline'],
};

const AdminNavigator = () => {
  const { width } = useWindowDimensions();
  return (
  <Tab.Navigator screenOptions={tabScreenOptions(ICONS, width)}>
    <Tab.Screen name="DashboardTab" component={DashboardStackScreen} options={{ title: 'Dashboard' }} />
    <Tab.Screen name="DoctorsTab" component={DoctorsStackScreen} options={{ title: 'Doctors' }} />
    <Tab.Screen name="AppointmentsTab" component={AppointmentsStackScreen} options={{ title: 'Appointments' }} />
    <Tab.Screen name="ProfileTab" component={ProfileStackScreen} options={{ title: 'Profile' }} />
  </Tab.Navigator>
  );
};

export default AdminNavigator;
