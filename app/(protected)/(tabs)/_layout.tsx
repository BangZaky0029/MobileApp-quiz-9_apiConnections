/**
 * ============================================================================
 * app/(protected)/(tabs)/_layout.tsx — Tab Navigator Layout
 * ============================================================================
 *
 * Bottom tab navigator for authenticated users.
 * Tabs: Katalog | Maps | Camera | Profil
 *
 * Each tab uses emoji icons to avoid additional icon library dependencies.
 *
 * ============================================================================
 */

import React from "react";
import { Tabs } from "expo-router";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ORANGE = "#f97316";
const BG_PRIMARY = "#0f0f0f";
const BG_TAB = "#141414";
const TEXT_MUTED = "#737373";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const baseHeight = 60;
  // Ensure a minimum padding of 12 so it's lifted nicely, plus safe area
  const paddingBottom = Math.max(insets.bottom, 12);
  const totalHeight = baseHeight + paddingBottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabBar, { height: totalHeight, paddingBottom }],
        tabBarActiveTintColor: ORANGE,
        tabBarInactiveTintColor: TEXT_MUTED,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="catalog"
        options={{
          title: "Katalog",
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Text style={styles.tabIcon}>🍽️</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="maps"
        options={{
          title: "Maps",
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Text style={styles.tabIcon}>📍</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: "Camera",
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Text style={styles.tabIcon}>📷</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Text style={styles.tabIcon}>👤</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: BG_TAB,
    borderTopWidth: 1,
    borderTopColor: "rgba(249, 115, 22, 0.1)",
    paddingTop: 8,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
    marginTop: 2,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapActive: {
    backgroundColor: "rgba(249, 115, 22, 0.12)",
  },
  tabIcon: {
    fontSize: 20,
  },
});
