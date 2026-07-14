/**
 * ============================================================================
 * app/index.tsx — Entry Point Redirect
 * ============================================================================
 *
 * This is the first route loaded by Expo Router.
 * It checks authentication state and redirects accordingly:
 *   - Authenticated → /(protected)/catalog
 *   - Not authenticated → /login
 *
 * While loading auth state, shows a branded splash/loading screen.
 *
 * ============================================================================
 */

import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";

export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/(protected)/(tabs)/catalog");
      } else {
        router.replace("/login");
      }
    }
  }, [isAuthenticated, isLoading]);

  // Show branded loading while checking auth state
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>🍽️</Text>
      <Text style={styles.title}>FlavorDash</Text>
      <ActivityIndicator
        size="large"
        color="#f97316"
        style={styles.spinner}
      />
      <Text style={styles.subtitle}>Memuat...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  brand: {
    fontSize: 56,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#f5f5f5",
    letterSpacing: -0.5,
  },
  spinner: {
    marginTop: 24,
  },
  subtitle: {
    fontSize: 14,
    color: "#737373",
    marginTop: 8,
  },
});
