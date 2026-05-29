/**
 * ============================================================================
 * FoodDetailScreen.tsx — FlavorDash Food Detail Screen
 * ============================================================================
 *
 * A standalone, fully-typed React Native screen that fetches and displays
 * detailed food/recipe data from TheMealDB Lookup API.
 *
 * ── API Integration ──
 * - Endpoint: process.env.EXPO_PUBLIC_API_DETAIL_URL
 *   (e.g. https://www.themealdb.com/api/json/v1/1/lookup.php?i=[id])
 * - The screen expects a `mealId` prop (or route param) representing the
 *   unique meal ID from TheMealDB.
 *
 * ── Responsive Layout Strategy ──
 * - Root container: <ScrollView> so long instructions are scrollable.
 * - Image uses aspectRatio (16/10) instead of fixed pixel height,
 *   making it scale proportionally across screen sizes.
 * - All text & spacing uses relative/percentage-based values where practical.
 * - Flexbox is used throughout for alignment and distribution.
 * - Works identically on Android & iOS with no platform-specific code.
 *
 * ── State Management ──
 * - useEffect triggers the API fetch on mount (or when mealId changes).
 * - Three UI states: Loading (ActivityIndicator), Error, and Success.
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
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";

// ─────────────────────────────────────────────────────────────────────────────
// § TypeScript Interfaces
// ─────────────────────────────────────────────────────────────────────────────

/**
 * IMeal — Strict interface for a single meal object returned by TheMealDB.
 *
 * Only the fields we need are declared here, keeping the contract tight.
 * The API returns many more fields (strIngredient1…20, strMeasure1…20, etc.),
 * but we intentionally omit them to satisfy the assignment spec.
 */
interface IMeal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
}

/**
 * IMealApiResponse — The top-level shape of TheMealDB lookup response.
 *
 * The API wraps its result in a `meals` array. If the ID is invalid,
 * `meals` will be `null` (not an empty array).
 */
interface IMealApiResponse {
  meals: IMeal[] | null;
}

/**
 * FoodDetailScreenProps — Props accepted by this screen component.
 *
 * In a real Expo Router / React Navigation setup you'd pull `mealId`
 * from route params. Here we accept it as a prop for maximum reusability.
 */
interface FoodDetailScreenProps {
  mealId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// § Constants & Theme
// ─────────────────────────────────────────────────────────────────────────────

/** FlavorDash brand orange — used as the primary accent color */
const ORANGE = "#f97316";

/** Slightly lighter orange for subtle accents and gradients */
const ORANGE_LIGHT = "#fb923c";

/** Dark background tones for the dark-mode UI */
const BG_PRIMARY = "#0f0f0f";
const BG_CARD = "#1a1a1a";
const BG_CARD_ELEVATED = "#242424";

/** Text colors */
const TEXT_PRIMARY = "#f5f5f5";
const TEXT_SECONDARY = "#a3a3a3";
const TEXT_MUTED = "#737373";

/** Screen width for proportional calculations */
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─────────────────────────────────────────────────────────────────────────────
// § Component
// ─────────────────────────────────────────────────────────────────────────────

const FoodDetailScreen: React.FC<FoodDetailScreenProps> = ({ mealId }) => {
  // ── State ────────────────────────────────────────────────────────────────
  const [meal, setMeal] = useState<IMeal | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ── Data Fetching ────────────────────────────────────────────────────────
  /**
   * useEffect — Fetches meal data whenever `mealId` changes.
   *
   * API Mapping:
   *   1. Constructs the URL from the env variable + mealId query param.
   *   2. Parses the JSON response as IMealApiResponse.
   *   3. Extracts the first item from the `meals` array (or null).
   *   4. Updates state accordingly for loading / error / success.
   */
  useEffect(() => {
    const fetchMealDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build the API URL from the environment variable.
        // Fallback to the direct TheMealDB URL if env is not set.
        const baseUrl =
          process.env.EXPO_PUBLIC_API_DETAIL_URL ||
          "https://www.themealdb.com/api/json/v1/1/lookup.php";

        const url = `${baseUrl}?i=${mealId}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: IMealApiResponse = await response.json();

        // TheMealDB returns { meals: null } for invalid IDs
        if (!data.meals || data.meals.length === 0) {
          throw new Error("Meal not found. Please check the meal ID.");
        }

        // Map the first (and only) meal from the response array
        setMeal(data.meals[0]);
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

  // ── Loading State ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
        {/* Outer wrapper for vertical centering */}
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color={ORANGE} />
          <Text style={styles.loadingText}>Fetching recipe...</Text>
          {/* Subtle animated dots row */}
          <View style={styles.dotsRow}>
            <View style={[styles.dot, { backgroundColor: ORANGE }]} />
            <View
              style={[styles.dot, { backgroundColor: ORANGE_LIGHT, opacity: 0.6 }]}
            />
            <View
              style={[styles.dot, { backgroundColor: ORANGE_LIGHT, opacity: 0.3 }]}
            />
          </View>
        </View>
      </View>
    );
  }

  // ── Error State ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
        <View style={styles.errorWrapper}>
          {/* Error icon circle */}
          <View style={styles.errorIconContainer}>
            <Text style={styles.errorIcon}>!</Text>
          </View>
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Text style={styles.errorHint}>
            Check your connection and try again.
          </Text>
        </View>
      </View>
    );
  }

  // Guard: if meal is still null after loading (shouldn't happen)
  if (!meal) return null;

  // ── Success State — Main Detail UI ───────────────────────────────────────
  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/*
       * ScrollView is the root scrollable container.
       * This allows the user to scroll through long recipe instructions
       * without the content being clipped.
       */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Image Section ──────────────────────────────────────── */}
        {/*
         * Responsive Layout: The image uses aspectRatio (16/10) instead of
         * a fixed pixel height. This means it scales proportionally to the
         * screen width on both Android and iOS, regardless of device size.
         */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: meal.strMealThumb }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          {/* Gradient overlay at the bottom of the image for text readability */}
          <View style={styles.imageOverlay} />

          {/* Floating meal ID badge — safely positioned below status bar notch */}
          <View
            style={[
              styles.idBadge,
              {
                top: Platform.OS === "ios" ? 48 : (StatusBar.currentHeight || 24) + 8,
              },
            ]}
          >
            <Text style={styles.idBadgeText}>#{meal.idMeal}</Text>
          </View>
        </View>

        {/* ── Content Body ────────────────────────────────────────────── */}
        <View style={styles.contentBody}>
          {/* ── Title Section ─────────────────────────────────────────── */}
          <View style={styles.titleSection}>
            <Text style={styles.mealTitle}>{meal.strMeal}</Text>

            {/*
             * Nested View: Category & Area tags displayed in a horizontal
             * flex row. Each tag is a View containing a Text, allowing
             * individual styling (background color, border radius, etc.).
             */}
            <View style={styles.tagsRow}>
              {/* Category Tag */}
              <View style={styles.tag}>
                <Text style={styles.tagLabel}>🍽️</Text>
                <Text style={styles.tagText}>{meal.strCategory}</Text>
              </View>

              {/* Area / Cuisine Tag */}
              <View style={[styles.tag, styles.tagArea]}>
                <Text style={styles.tagLabel}>🌍</Text>
                <Text style={styles.tagText}>{meal.strArea}</Text>
              </View>
            </View>
          </View>

          {/* ── Divider ───────────────────────────────────────────────── */}
          <View style={styles.divider} />

          {/* ── Instructions Section ──────────────────────────────────── */}
          <View style={styles.instructionsSection}>
            {/* Section Header with accent bar */}
            <View style={styles.sectionHeaderRow}>
              <View style={styles.accentBar} />
              <Text style={styles.sectionTitle}>Instructions</Text>
            </View>

            {/*
             * The instructions text can be very long. Because this entire
             * component is inside a ScrollView, the user can scroll to
             * read everything. We split by newlines to add paragraph spacing.
             */}
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

          {/* ── Footer Info ───────────────────────────────────────────── */}
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
};

// ─────────────────────────────────────────────────────────────────────────────
// § Styles
// ─────────────────────────────────────────────────────────────────────────────
/**
 * All styles use Flexbox for layout. Fixed pixel values are avoided for
 * widths; instead we rely on flex, aspectRatio, and percentage-based
 * padding/margins so the UI adapts to any screen size.
 */
const styles = StyleSheet.create({
  // ── Root & Centering ─────────────────────────────────────────────────────
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

  // ── Loading State ────────────────────────────────────────────────────────
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

  // ── Error State ──────────────────────────────────────────────────────────
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

  // ── ScrollView ───────────────────────────────────────────────────────────
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ── Hero Image ───────────────────────────────────────────────────────────
  /**
   * Responsive Image Layout:
   * - width: "100%" makes it span the full screen width.
   * - aspectRatio: 16/10 ensures the height is proportional (not fixed px).
   * - This means on a narrow phone the image is smaller, on a tablet it's
   *   larger, but the proportions stay the same.
   */
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
  idBadge: {
    position: "absolute",
    top: 16,
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

  // ── Content Body ─────────────────────────────────────────────────────────
  /**
   * The content body uses percentage-based horizontal padding (5%)
   * so it adapts to screen width. On a 360px phone that's ~18px,
   * on a 768px tablet that's ~38px — always proportional.
   */
  contentBody: {
    paddingHorizontal: "5%",
    marginTop: -20,
  },

  // ── Title Section ────────────────────────────────────────────────────────
  titleSection: {
    backgroundColor: BG_CARD,
    borderRadius: 16,
    padding: 20,
    // Subtle top border accent in orange
    borderTopWidth: 3,
    borderTopColor: ORANGE,
    // Elevation/shadow for card effect
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  mealTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: 16,
  },

  // ── Tags ─────────────────────────────────────────────────────────────────
  /**
   * Tags Row: A horizontal flex row with wrapping enabled.
   * Each tag is itself a row (icon + text) with its own background.
   */
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

  // ── Divider ──────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: "rgba(249, 115, 22, 0.12)",
    marginVertical: 24,
    marginHorizontal: "5%",
  },

  // ── Instructions ─────────────────────────────────────────────────────────
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

  // ── Footer ───────────────────────────────────────────────────────────────
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

export default FoodDetailScreen;
