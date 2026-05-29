/**
 * App.tsx — FlavorDash Entry Point
 *
 * Renders the FoodDetailScreen with edge-to-edge design.
 * To achieve a beautiful, frameless look (where the food photo extends
 * to the absolute top of the screen), we use a standard View instead of a restrictive
 * SafeAreaView.
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import FoodDetailScreen from "./screens/FoodDetailScreen";

export default function App() {
  // Demo meal ID — change this to test different recipes
  const DEMO_MEAL_ID = "52772";

  return (
    <View style={styles.container}>
      <FoodDetailScreen mealId={DEMO_MEAL_ID} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },
});
