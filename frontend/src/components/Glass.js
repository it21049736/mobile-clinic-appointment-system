import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import { GLASS, GRADIENT } from '../constants/colors';

// iOS 26+ renders Apple's native Liquid Glass; everything else gets a frosted blur.
const NATIVE_GLASS = Platform.OS === 'ios' && isLiquidGlassAvailable();

export const GlassSurface = ({ style, children, radius = 20, intensity = 40, interactive = false, ...rest }) => {
  const flat = StyleSheet.flatten(style) || {};
  const shape = { borderRadius: flat.borderRadius ?? radius };

  if (NATIVE_GLASS) {
    return (
      <GlassView glassEffectStyle="regular" isInteractive={interactive} style={[shape, style]} {...rest}>
        {children}
      </GlassView>
    );
  }

  return (
    <View style={[styles.frame, shape, style]} {...rest}>
      <BlurView
        intensity={intensity}
        tint="light"
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
        style={[StyleSheet.absoluteFill, shape]}
      />
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, shape, styles.tint]} />
      <LinearGradient
        pointerEvents="none"
        colors={GLASS.sheen}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.sheen, { borderTopLeftRadius: shape.borderRadius, borderTopRightRadius: shape.borderRadius }]}
      />
      {children}
    </View>
  );
};

// Soft pastel backdrop that gives the glass something to refract.
// The blobs live in their own clipped layer: if they overflowed the content container, browsers
// could scroll that container when focusing an element and shift the whole app.
export const GlassBackground = ({ children, style }) => (
  <View style={[styles.fill, style]}>
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.clip]}>
      <LinearGradient colors={GRADIENT.base} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={[styles.blob, styles.blobA]} />
      <View style={[styles.blob, styles.blobB]} />
      <View style={[styles.blob, styles.blobC]} />
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  fill: { flex: 1 },
  clip: { overflow: 'hidden' },
  frame: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GLASS.border,
    ...Platform.select({
      web: { boxShadow: '0 8px 32px rgba(31, 56, 110, 0.10)' },
      default: {
        shadowColor: '#1F386E',
        shadowOpacity: 0.1,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 0,
      },
    }),
  },
  tint: { backgroundColor: GLASS.fill },
  sheen: { position: 'absolute', top: 0, left: 0, right: 0, height: '45%' },
  blob: { position: 'absolute', borderRadius: 999 },
  blobA: { width: 420, height: 420, top: -140, right: -160, backgroundColor: GRADIENT.blobs[0] },
  blobB: { width: 360, height: 360, top: '38%', left: -180, backgroundColor: GRADIENT.blobs[1] },
  blobC: { width: 380, height: 380, bottom: -160, right: -120, backgroundColor: GRADIENT.blobs[2] },
});
