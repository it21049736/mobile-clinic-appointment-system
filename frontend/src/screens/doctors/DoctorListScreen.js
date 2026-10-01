import React, { useCallback, useContext, useMemo, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DoctorCard from '../../components/DoctorCard';
import CustomInput from '../../components/CustomInput';
import FilterChips from '../../components/FilterChips';
import EmptyState from '../../components/EmptyState';
import CustomButton from '../../components/CustomButton';
import { AuthContext } from '../../context/AuthContext';
import { getDoctors } from '../../services/doctorService';
import { COLORS } from '../../constants/colors';
import { WEEKDAYS } from '../../constants/clinic';
import { errorMessage } from '../../utils/dialogs';
import { useResponsive, centered, gridCell, MAX_WIDTH } from '../../utils/responsive';

const TODAY = '__today';

const DoctorListScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  const { columns } = useResponsive();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const load = useCallback(async () => {
    try {
      setError('');
      setDoctors(await getDoctors());
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

  const filterOptions = useMemo(() => {
    const specs = [...new Set(doctors.map((d) => d.specialization))].sort();
    return [{ label: 'All', value: 'All' }, { label: 'Available today', value: TODAY }, ...specs];
  }, [doctors]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const today = WEEKDAYS[new Date().getDay()];
    return doctors.filter((d) => {
      if (filter === TODAY && !d.availableDay.includes(today)) return false;
      if (filter !== 'All' && filter !== TODAY && d.specialization !== filter) return false;
      if (q && !`${d.doctorName} ${d.specialization}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [doctors, search, filter]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={visible}
        keyExtractor={(d) => d._id}
        key={'cols-' + columns}
        numColumns={columns}
        columnWrapperStyle={columns > 1 ? styles.row : undefined}
        contentContainerStyle={styles.list}
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
            <CustomInput icon="search-outline" placeholder="Search by name or specialization" value={search} onChangeText={setSearch} />
            <FilterChips options={filterOptions} value={filter} onChange={setFilter} style={styles.chips} />
            <Text style={styles.count}>
              {visible.length} doctor{visible.length === 1 ? '' : 's'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={gridCell(columns)}>
            <DoctorCard doctor={item} onPress={() => navigation.navigate('DoctorDetail', { doctorId: item._id })} />
          </View>
        )}
        ListEmptyComponent={
          error ? (
            <EmptyState icon="cloud-offline-outline" title="Couldn't load doctors" message={error}>
              <CustomButton title="Try again" compact onPress={load} style={styles.retry} />
            </EmptyState>
          ) : (
            <EmptyState
              icon="people-outline"
              title={doctors.length ? 'No matching doctors' : 'No doctors yet'}
              message={doctors.length ? 'Try a different search or filter.' : isAdmin ? 'Tap + to add the first doctor.' : 'Please check back later.'}
            />
          )
        }
      />

      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('DoctorForm')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Add doctor"
        >
          <Ionicons name="add" size={30} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  list: { ...centered(MAX_WIDTH.page), padding: 16, paddingBottom: 96 },
  row: { marginHorizontal: -6 },
  header: { marginBottom: 6 },
  chips: { marginTop: 4 },
  count: { fontSize: 13, color: COLORS.textLight, marginTop: 10, marginBottom: 4 },
  retry: { marginTop: 14 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: COLORS.text,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});

export default DoctorListScreen;
