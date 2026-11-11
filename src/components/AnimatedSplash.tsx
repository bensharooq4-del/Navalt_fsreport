import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text } from "react-native";
import { theme } from "../theme";

/**
 * Full-screen intro shown after the native splash.
 * Sequence: logo fades + springs in -> tagline slides up while a progress bar fills -> everything fades out.
 */
export function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineShift = useRef(new Animated.Value(12)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const started = useRef(false);

  const start = useCallback(async () => {
    if (started.current) return;
    started.current = true;
    // Hand over from the native splash (same logo, white background) to this animated one.
    await SplashScreen.hideAsync().catch(() => {});

    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(taglineShift, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]),
      Animated.delay(250),
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, [
    logoOpacity,
    logoScale,
    taglineOpacity,
    taglineShift,
    progress,
    screenOpacity,
    onFinish,
  ]);

  // Safety net: never get stuck on the splash if the image event does not fire.
  useEffect(() => {
    const t = setTimeout(start, 1500);
    return () => clearTimeout(t);
  }, [start]);

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.root, { opacity: screenOpacity }]}
    >
      <Animated.View
        style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}
      >
        <Image
          source={require("../../assets/images/om-logo.png")}
          style={styles.logo}
          resizeMode="contain"
          onLoadEnd={start}
        />
      </Animated.View>

      <Animated.View
        style={{
          opacity: taglineOpacity,
          transform: [{ translateY: taglineShift }],
          alignItems: "center",
        }}
      >
        <Text style={styles.tagline}>FIELD SERVICE REPORTS</Text>
        <Animated.View style={styles.track}>
          <Animated.View
            style={[
              styles.fill,
              {
                width: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xl,
    zIndex: 100,
  },
  logo: { width: 260, height: 240 },
  tagline: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    letterSpacing: 2.5,
    fontWeight: "700",
  },
  track: {
    width: 160,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primaryTint,
    overflow: "hidden",
    marginTop: theme.spacing.md,
  },
  fill: { height: 4, borderRadius: 2, backgroundColor: theme.colors.primary },
});
