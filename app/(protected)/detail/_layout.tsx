/**
 * ============================================================================
 * app/(protected)/detail/_layout.tsx — Detail Route Stack Layout
 * ============================================================================
 *
 * Simple stack layout for the detail route.
 * This ensures the detail/[id] screen renders within the protected group
 * but outside the tab navigator (full-screen detail view).
 *
 * ============================================================================
 */

import React from "react";
import { Stack } from "expo-router";

export default function DetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0f0f0f" },
        animation: "slide_from_right",
      }}
    />
  );
}
