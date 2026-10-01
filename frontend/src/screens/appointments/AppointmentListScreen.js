import React, { useCallback, useContext, useMemo, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AppointmentCard from '../../components/AppointmentCard';
import FilterChips from '../../components/FilterChips';
import EmptyState from '../../components/EmptyState';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { AuthContext } from '../../context/AuthContext';
import { getAppointments } from '../../services/appointmentService';
import { COLORS } from '../../constants/colors';
import { APPOINTMENT_STATUSES, isUpcoming, todayString } from '../../constants/clinic';
import { errorMessage } from '../../utils/dialogs';
import { useResponsive, centered, gridCell, MAX_WIDTH } from '../../utils/responsive';

const byDateAsc = (a, b) =>
  a.appointmentDate.localeCompare(b.appointmentDate) || a.appointmentTime.localeCompare(b.appointmentTime);

// Patients see their own appointments; admins see every appointment with patient details.
const AppointmentListScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  const { columns } = useResponsive();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState(isAdmin ? 'All' : 'Upcoming');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      setAppointments(await getAppointments());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const options = useMemo(() => {
    const count = (fn) => appointments.filter(fn).length;
    const base = isAdmin
      ? [
          { label: `All (${appointments.length})`, value: 'All' },
          { label: `Today (${count((a) => a.appointmentDate === todayString())})`, value: 'Today' },
        ]
      : [
          { label: `Upcoming (${count(isUpcoming)})`, value: 'Upcoming' },
          { label: `All (${appointments.length})`, value: 'All' },
        ];
    return [...base, ...APPOINTMENT_STATUSES.map((s) => ({ label: `${s} (${count((a) => a.status === s)})`, value: s }))];
  }, [appointments, isAdmin]);

  const visible = useMemo(() => {
    let list = appointments;
    if (filter === 'Upcoming') list = list.filter(isUpcoming).sort(byDateAsc);
    else if (filter === 'Today') list = list.filter((a) => a.appointmentDate === todayString()).sort(byDateAsc);
    else if (filter !== 'All') list = list.filter((a) => a.status === filter);

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((a) =>
        [a.userId?.name, a.userId?.phoneNumber, a.userId?.email, a.doctorId?.doctorName, a.reason]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }
    return list;
  }, [appointments, filter, search]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.list}
      data={visible}
      keyExtractor={(a) => a._id}
      key={'cols-' + columns}
      numColumns={columns}
      columnWrapperStyle={columns > 1 ? styles.row : undefined}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
          colors={[COLORS.primary]}
        />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          {isAdmin && (
            <CustomInput icon="search-outline" placeholder="Search patient, phone or doctor" value={search} onChangeText={setSearch} />
          )}
          <FilterChips options={options} value={filter} onChange={setFilter} />
          <Text style={styles.count}>{visible.length} appointment{visible.length === 1 ? '' : 's'}</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={gridCell(columns)}>
          <AppointmentCard
            appointment={item}
            showPatient={isAdmin}
            onPress={() => navigation.navigate('AppointmentDetail', { id: item._id })}
          />
        </View>
      )}
      ListEmptyComponent={
        error ? (
          <EmptyState icon="cloud-offline-outline" title="Couldn't load appointments" message={error}>
            <CustomButton title="Try again" compact onPress={load} style={styles.retry} />
          </EmptyState>
        ) : (
          <EmptyState
            icon="calendar-outline"
            title="No appointments here"
            message={isAdmin ? 'Appointments booked by patients will appear here.' : 'Find a doctor and book your first appointment.'}
          >
            {!isAdmin && (
              <CustomButton
                title="Find a Doctor"
                compact
                icon="search"
                style={styles.retry}
                onPress={() => navigation.navigate('DoctorsTab', { screen: 'DoctorList' })}
              />
            )}
          </EmptyState>
        )
      }
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  list: { ...centered(MAX_WIDTH.page), padding: 16, paddingBottom: 32 },
  row: { marginHorizontal: -6 },
  header: { marginBottom: 6 },
  count: { fontSize: 13, color: COLORS.textLight, marginTop: 10, marginBottom: 4 },
  retry: { marginTop: 14 },
});

export default AppointmentListScreen;
