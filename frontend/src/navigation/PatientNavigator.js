import React from 'react';
import { useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PatientHomeScreen from '../screens/home/PatientHomeScreen';
import DoctorListScreen from '../screens/doctors/DoctorListScreen';
import DoctorDetailScreen from '../screens/doctors/DoctorDetailScreen';
import BookAppointmentScreen from '../screens/appointments/BookAppointmentScreen';
import AppointmentListScreen from '../screens/appointments/AppointmentListScreen';
import AppointmentDetailScreen from '../screens/appointments/AppointmentDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { stackScreenOptions, tabScreenOptions } from './navTheme';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const DoctorsStack = createNativeStackNavigator();
const AppointmentsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const HomeStackScreen = () => (
  <HomeStack.Navigator screenOptions={stackScreenOptions}>
    <HomeStack.Screen name="Home" component={PatientHomeScreen} options={{ headerShown: false }} />
    <HomeStack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} options={{ title: 'Appointment' }} />
    <HomeStack.Screen name="RescheduleAppointment" component={BookAppointmentScreen} options={{ title: 'Reschedule' }} />
  </HomeStack.Navigator>
);

const DoctorsStackScreen = () => (
  <DoctorsStack.Navigator screenOptions={stackScreenOptions}>
    <DoctorsStack.Screen name="DoctorList" component={DoctorListScreen} options={{ title: 'Find a Doctor' }} />
    <DoctorsStack.Screen name="DoctorDetail" component={DoctorDetailScreen} options={{ title: 'Doctor Profile' }} />
    <DoctorsStack.Screen name="BookAppointment" component={BookAppointmentScreen} options={{ title: 'Book Appointment' }} />
  </DoctorsStack.Navigator>
);

const AppointmentsStackScreen = () => (
  <AppointmentsStack.Navigator screenOptions={stackScreenOptions}>
    <AppointmentsStack.Screen name="AppointmentList" component={AppointmentListScreen} options={{ title: 'My Appointments' }} />
    <AppointmentsStack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} options={{ title: 'Appointment' }} />
    <AppointmentsStack.Screen name="RescheduleAppointment" component={BookAppointmentScreen} options={{ title: 'Reschedule' }} />
  </AppointmentsStack.Navigator>
);

const ProfileStackScreen = () => (
  <ProfileStack.Navigator screenOptions={stackScreenOptions}>
    <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
  </ProfileStack.Navigator>
);

const ICONS = {
  HomeTab: ['home', 'home-outline'],
  DoctorsTab: ['medkit', 'medkit-outline'],
  AppointmentsTab: ['calendar', 'calendar-outline'],
  ProfileTab: ['person', 'person-outline'],
};

const PatientNavigator = () => {
  const { width } = useWindowDimensions();
  return (
  <Tab.Navigator screenOptions={tabScreenOptions(ICONS, width)}>
    <Tab.Screen name="HomeTab" component={HomeStackScreen} options={{ title: 'Home' }} />
    <Tab.Screen name="DoctorsTab" component={DoctorsStackScreen} options={{ title: 'Doctors' }} />
    <Tab.Screen name="AppointmentsTab" component={AppointmentsStackScreen} options={{ title: 'Appointments' }} />
    <Tab.Screen name="ProfileTab" component={ProfileStackScreen} options={{ title: 'Profile' }} />
  </Tab.Navigator>
  );
};

export default PatientNavigator;
