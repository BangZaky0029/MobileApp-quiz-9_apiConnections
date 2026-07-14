/**
 * ============================================================================
 * app/(protected)/detail/[id].tsx — Detail Pesanan (Protected Route)
 * ============================================================================
 *
 * Halaman Detail Pesanan yang HANYA bisa diakses oleh pengguna yang
 * telah login (dilindungi oleh JWT Middleware di (protected)/_layout.tsx).
 *
 * Migrasi dari screens/FoodDetailScreen.tsx ke Expo Router dynamic route.
 * Uses `useLocalSearchParams()` to get the meal ID from the URL.
 *
 * Fitur:
 *   - Fetch detail makanan dari TheMealDB Lookup API
 *   - Responsive Flexbox layout (aspectRatio, percentage padding)
 *   - AsyncStorage: Favorite status + Last viewed recipe history
 *   - Edge-to-edge hero image design
 *   - Protected by JWT middleware (parent layout)
 *
 * ============================================================================
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─────────────────────────────────────────────────────────────────────────────
// § TypeScript Interfaces
// ─────────────────────────────────────────────────────────────────────────────

interface IMeal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
}

interface IMealApiResponse {
  meals: IMeal[] | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// § Constants & Theme
// ─────────────────────────────────────────────────────────────────────────────

const ORANGE = "#f97316";
const ORANGE_LIGHT = "#fb923c";
const BG_PRIMARY = "#0f0f0f";
const BG_CARD = "#1a1a1a";
const BG_CARD_ELEVATED = "#242424";
const TEXT_PRIMARY = "#f5f5f5";
const TEXT_SECONDARY = "#a3a3a3";
const TEXT_MUTED = "#737373";

// ─────────────────────────────────────────────────────────────────────────────
// § Component
// ─────────────────────────────────────────────────────────────────────────────

export default function DetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const mealId = id || "52772";

  // ── State ────────────────────────────────────────────────────────────
  const [meal, setMeal] = useState<IMeal | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // AsyncStorage variables
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [lastViewedName, setLastViewedName] = useState<string | null>(null);

  // ── Data Fetching ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchMealDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // AsyncStorage Read: Check favorite status
        const favKey = `@fav_${mealId}`;
        const savedFav = await AsyncStorage.getItem(favKey);
        setIsFavorite(savedFav === "true");

        // AsyncStorage Read: Load last viewed recipe name
        const historyKey = "@last_viewed_name";
        const savedHistoryName = await AsyncStorage.getItem(historyKey);
        setLastViewedName(savedHistoryName);

        // Fetch from API
        const baseUrl =
          process.env.EXPO_PUBLIC_API_DETAIL_URL ||
          "https://www.themealdb.com/api/json/v1/1/lookup.php";
        const url = `${baseUrl}?i=${mealId}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: IMealApiResponse = await response.json();

        if (!data.meals || data.meals.length === 0) {
          throw new Error("Meal not found. Please check the meal ID.");
        }

        const currentMeal = data.meals[0];
        setMeal(currentMeal);

        // AsyncStorage Write: Save current recipe as last viewed
        await AsyncStorage.setItem(historyKey, currentMeal.strMeal);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchMealDetail();
  }, [mealId]);

  // ── Toggle Favorite ─────────────────────────────────────────────────
  const toggleFavorite = async () => {
    if (!meal) return;
    try {
      const nextFavState = !isFavorite;
      const favKey = `@fav_${meal.idMeal}`;
      await AsyncStorage.setItem(favKey, nextFavState ? "true" : "false");
      setIsFavorite(nextFavState);
    } catch (err) {
      console.error("Failed to save favorite state", err);
    }
  };

  // ── Safe top offset for floating elements ───────────────────────────
  const safeTop =
    Platform.OS === "ios" ? 48 : (StatusBar.currentHeight || 24) + 8;

  // ── Loading State ───────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color={ORANGE} />
          <Text style={styles.loadingText}>Fetching recipe...</Text>
          <View style={styles.dotsRow}>
            <View style={[styles.dot, { backgroundColor: ORANGE }]} />
            <View
              style={[
                styles.dot,
                { backgroundColor: ORANGE_LIGHT, opacity: 0.6 },
              ]}
            />
            <View
              style={[
                styles.dot,
                { backgroundColor: ORANGE_LIGHT, opacity: 0.3 },
              ]}
            />
          </View>
        </View>
      </View>
    );
  }

  // ── Error State ─────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <View style={styles.errorWrapper}>
          <View style={styles.errorIconContainer}>
            <Text style={styles.errorIcon}>!</Text>
          </View>
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Text style={styles.errorHint}>
            Check your connection and try again.
          </Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backBtnText}>← Kembali</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!meal) return null;

  // ── Success State ───────────────────────────────────────────────────
  return (
    <View style={styles.rootContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Image Section ─────────────────────────────────────── */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: meal.strMealThumb }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />

          {/* Back Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={[styles.floatingBackBtn, { top: safeTop }]}
          >
            <Text style={styles.floatingBackIcon}>←</Text>
          </TouchableOpacity>

          {/* Favorite Button (AsyncStorage Variable 1) */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={toggleFavorite}
            style={[styles.favoriteBtn, { top: safeTop }]}
          >
            <Text style={styles.favoriteIcon}>
              {isFavorite ? "❤️" : "🤍"}
            </Text>
          </TouchableOpacity>

          {/* Meal ID Badge */}
          <View style={[styles.idBadge, { top: safeTop }]}>
            <Text style={styles.idBadgeText}>#{meal.idMeal}</Text>
          </View>
        </View>

        {/* ── Content Body ───────────────────────────────────────────── */}
        <View style={styles.contentBody}>
          {/* ── Title Section ────────────────────────────────────────── */}
          <View style={styles.titleSection}>
            {/* Last Viewed History Banner (AsyncStorage Variable 2) */}
            {lastViewedName && lastViewedName !== meal.strMeal && (
              <View style={styles.historyBanner}>
                <Text style={styles.historyText}>
                  ⏮️ Terakhir dilihat: {lastViewedName}
                </Text>
              </View>
            )}

            <Text style={styles.mealTitle}>{meal.strMeal}</Text>

            <View style={styles.tagsRow}>
              <View style={styles.tag}>
                <Text style={styles.tagLabel}>🍽️</Text>
                <Text style={styles.tagText}>{meal.strCategory}</Text>
              </View>
              <View style={[styles.tag, styles.tagArea]}>
                <Text style={styles.tagLabel}>🌍</Text>
                <Text style={styles.tagText}>{meal.strArea}</Text>
              </View>
            </View>
          </View>

          {/* ── Divider ──────────────────────────────────────────────── */}
          <View style={styles.divider} />

          {/* ── Instructions Section ─────────────────────────────────── */}
          <View style={styles.instructionsSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.accentBar} />
              <Text style={styles.sectionTitle}>Instructions</Text>
            </View>

            <View style={styles.instructionsCard}>
              {meal.strInstructions
                .split("\r\n")
                .filter((para) => para.trim().length > 0)
                .map((paragraph, index) => (
                  <Text key={index} style={styles.instructionParagraph}>
                    {paragraph.trim()}
                  </Text>
                ))}
            </View>
          </View>

          {/* ── Footer ───────────────────────────────────────────────── */}
          <View style={styles.footer}>
            <View style={styles.footerLine} />
            <Text style={styles.footerText}>
              Recipe powered by TheMealDB • FlavorDash
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// § Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: BG_PRIMARY,
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: BG_PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: "8%",
  },

  // ── Loading ────────────────────────────────────────────────────────────
  loaderWrapper: {
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: TEXT_SECONDARY,
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // ── Error ──────────────────────────────────────────────────────────────
  errorWrapper: {
    alignItems: "center",
    gap: 12,
    paddingHorizontal: "5%",
  },
  errorIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(249, 115, 22, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  errorIcon: {
    fontSize: 32,
    fontWeight: "800",
    color: ORANGE,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  errorMessage: {
    fontSize: 15,
    color: ORANGE_LIGHT,
    textAlign: "center",
    lineHeight: 22,
  },
  errorHint: {
    fontSize: 13,
    color: TEXT_MUTED,
    textAlign: "center",
    marginTop: 4,
  },
  backBtn: {
    backgroundColor: "rgba(249, 115, 22, 0.12)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.3)",
  },
  backBtnText: {
    color: ORANGE,
    fontWeight: "700",
    fontSize: 14,
  },

  // ── ScrollView ─────────────────────────────────────────────────────────
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ── Hero Image ─────────────────────────────────────────────────────────
  imageContainer: {
    width: "100%",
    position: "relative",
  },
  heroImage: {
    width: "100%",
    aspectRatio: 16 / 10,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "rgba(15, 15, 15, 0.7)",
  },

  // ── Floating Buttons ───────────────────────────────────────────────────
  floatingBackBtn: {
    position: "absolute",
    left: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  floatingBackIcon: {
    fontSize: 18,
    color: TEXT_PRIMARY,
    fontWeight: "700",
  },
  favoriteBtn: {
    position: "absolute",
    right: 56,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.4)",
  },
  favoriteIcon: {
    fontSize: 18,
  },
  idBadge: {
    position: "absolute",
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.4)",
  },
  idBadgeText: {
    color: ORANGE_LIGHT,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  // ── Content Body ───────────────────────────────────────────────────────
  contentBody: {
    paddingHorizontal: "5%",
    marginTop: -20,
  },

  // ── Title Section ──────────────────────────────────────────────────────
  titleSection: {
    backgroundColor: BG_CARD,
    borderRadius: 16,
    padding: 20,
    borderTopWidth: 3,
    borderTopColor: ORANGE,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  historyBanner: {
    backgroundColor: "rgba(249, 115, 22, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.15)",
  },
  historyText: {
    color: ORANGE_LIGHT,
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  mealTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: 16,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG_CARD_ELEVATED,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.2)",
  },
  tagArea: {
    borderColor: "rgba(251, 146, 60, 0.2)",
  },
  tagLabel: {
    fontSize: 14,
  },
  tagText: {
    color: TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // ── Divider ────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: "rgba(249, 115, 22, 0.12)",
    marginVertical: 24,
    marginHorizontal: "5%",
  },

  // ── Instructions ───────────────────────────────────────────────────────
  instructionsSection: {
    gap: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  accentBar: {
    width: 4,
    height: 24,
    backgroundColor: ORANGE,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    letterSpacing: -0.3,
  },
  instructionsCard: {
    backgroundColor: BG_CARD,
    borderRadius: 12,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.04)",
  },
  instructionParagraph: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    lineHeight: 24,
    letterSpacing: 0.2,
  },

  // ── Footer ─────────────────────────────────────────────────────────────
  footer: {
    alignItems: "center",
    marginTop: 32,
    gap: 12,
  },
  footerLine: {
    width: 40,
    height: 3,
    backgroundColor: ORANGE,
    borderRadius: 2,
    opacity: 0.4,
  },
  footerText: {
    fontSize: 12,
    color: TEXT_MUTED,
    letterSpacing: 0.5,
  },
});
