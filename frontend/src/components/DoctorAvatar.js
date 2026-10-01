import React, { useState } from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { imageUrl } from '../constants/config';

const initialsOf = (name = '') =>
  name
    .replace(/^dr\.?\s*/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || 'DR';

// `uri` overrides the stored image (used for a freshly picked, not-yet-uploaded photo).
const DoctorAvatar = ({ doctor, uri, size = 56 }) => {
  const [failed, setFailed] = useState(false);
  const source = uri || (!failed && imageUrl(doctor?.profileImage, doctor?.updatedAt));
  const round = { width: size, height: size, borderRadius: size / 2 };

  if (source) {
    return <Image source={{ uri: source }} style={[styles.image, round]} onError={() => setFailed(true)} />;
  }
  return (
    <View style={[styles.fallback, round]}>
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initialsOf(doctor?.doctorName)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  image: { backgroundColor: COLORS.primaryLight },
  fallback: { backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  initials: { color: COLORS.primary, fontWeight: '800' },
});

export default DoctorAvatar;
