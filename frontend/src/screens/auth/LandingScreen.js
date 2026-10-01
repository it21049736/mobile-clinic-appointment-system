import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../../components/CustomButton';
import { COLORS } from '../../constants/colors';
import { APP_NAME, APP_TAGLINE } from '../../constants/config';
import { useResponsive, centered, MAX_WIDTH } from '../../utils/responsive';

const FEATURES = [
  { icon: 'people-outline', title: 'Find doctors', text: 'Browse specialists and see the days they visit the clinic.' },
  { icon: 'calendar-outline', title: 'Book in seconds', text: 'Pick a date and a free time slot without calling the clinic.' },
  { icon: 'shield-checkmark-outline', title: 'No double booking', text: 'Every slot belongs to one patient only.' },
  { icon: 'notifications-outline', title: 'Track status', text: 'See when your appointment is confirmed or completed.' },
];

const LandingScreen = ({ navigation }) => {
  const { isWide } = useResponsive();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={[styles.scroll, isWide && styles.scrollWide]}>
        <View style={[styles.column, isWide && styles.columnWide]}>
          <View style={styles.hero}>
            <View style={styles.logo}>
              <Ionicons name="medkit" size={40} color={COLORS.white} />
            </View>
            <Text style={styles.title}>{APP_NAME}</Text>
            <Text style={styles.subtitle}>{APP_TAGLINE}</Text>
          </View>

          <View style={[styles.sheet, isWide && styles.sheetWide]}>
            {FEATURES.map((f) => (
              <View key={f.title} style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Ionicons name={f.icon} size={22} color={COLORS.primary} />
                </View>
                <View style={styles.featureBody}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureText}>{f.text}</Text>
                </View>
              </View>
            ))}

            <CustomButton title="Log In" icon="log-in-outline" onPress={() => navigation.navigate('Login')} style={styles.first} />
            <CustomButton title="Create Patient Account" variant="outline" onPress={() => navigation.navigate('Register')} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  scroll: { flexGrow: 1 },
  scrollWide: { justifyContent: 'center', paddingVertical: 32 },
  column: { flexGrow: 1 },
  columnWide: { ...centered(MAX_WIDTH.auth), flexGrow: 0 },
  sheetWide: { flexGrow: 0, borderRadius: 28 },
  hero: { alignItems: 'center', paddingTop: 40, paddingBottom: 32, paddingHorizontal: 24 },
  logo: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.white, textAlign: 'center' },
  subtitle: { fontSize: 15, color: COLORS.onPrimaryMuted, marginTop: 6, textAlign: 'center' },
  sheet: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
  },
  feature: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  featureIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureBody: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  featureText: { fontSize: 13, color: COLORS.textLight, marginTop: 2, lineHeight: 18 },
  first: { marginTop: 12 },
});

export default LandingScreen;
