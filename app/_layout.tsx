/**
 * ============================================================================
 * app/_layout.tsx — Root Layout
 * ============================================================================
 *
 * The top-level layout for the entire FlavorDash application.
 * Wraps all routes with the AuthProvider so every screen can access
 * authentication state via the useAuth() hook.
 *
 * Route Structure:
 *   /              → index (redirect based on auth)
 *   /login         → Login screen
 *   /(protected)/* → All authenticated screens (catalog, detail, camera, maps)
 *
 * ============================================================================
 */

import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0f0f0f" },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(protected)" />
      </Stack>
    </AuthProvider>
  );
}
