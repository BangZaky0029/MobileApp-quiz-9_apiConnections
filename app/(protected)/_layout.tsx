/**
 * ============================================================================
 * app/(protected)/_layout.tsx — Protected Route Middleware (JWT Guard)
 * ============================================================================
 *
 * This layout acts as a MIDDLEWARE for all protected routes.
 * It checks whether a valid JWT token exists in the AuthContext:
 *   - If authenticated → renders child routes (Stack with tabs + detail)
 *   - If not authenticated → redirects to /login
 *   - If still loading → shows loading indicator
 *
 * This implements the "Middleware pada Expo Router" requirement from the UAS.
 *
 * Route children:
 *   (tabs)/*    → Tab navigator (catalog, maps, camera, profile)
 *   detail/[id] → Full-screen detail view (pushed over tabs)
 *
 * ============================================================================
 */

import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

const ORANGE = "#f97316";
const BG_PRIMARY = "#0f0f0f";
const TEXT_SECONDARY = "#a3a3a3";

export default function ProtectedLayout() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // ── JWT Middleware: Check authentication on mount and state changes ────
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // No valid JWT token found → redirect to login
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading]);

  // ── Loading State ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ORANGE} />
        <Text style={styles.loadingText}>Memvalidasi sesi...</Text>
      </View>
    );
  }

  // ── Not Authenticated ─────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ORANGE} />
        <Text style={styles.loadingText}>Mengalihkan ke login...</Text>
      </View>
    );
  }

  // ── Authenticated → Render Protected Content ──────────────────────────
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: BG_PRIMARY },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="detail" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: BG_PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: "500",
  },
});
