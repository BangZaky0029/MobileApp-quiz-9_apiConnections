/**
 * ============================================================================
 * app/(protected)/(tabs)/catalog.tsx — Katalog Makanan
 * ============================================================================
 *
 * Halaman katalog makanan yang menampilkan daftar resep dari TheMealDB API.
 *
 * ── Flexbox Layout Strategy (Sesuai Requirement UAS) ──
 * Setiap item makanan ditampilkan dalam SATU BARIS (row) menggunakan
 * flexDirection: "row":
 *   [Gambar Makanan] | [Nama + Kategori + Area + Tombol]
 *
 * Mengapa Flexbox?
 *   - Flexbox memungkinkan penyusunan elemen secara fleksibel tanpa
 *     hardcode posisi pixel. Dengan flex: 1 pada container info,
 *     teks akan mengisi sisa ruang setelah gambar, menyesuaikan secara
 *     otomatis di layar berapapun lebarnya.
 *   - flexWrap: "wrap" pada search chips memungkinkan item berpindah
 *     baris secara otomatis ketika tidak cukup ruang.
 *   - Ukuran gambar menggunakan aspek rasio (aspectRatio: 1)
 *     bukan pixel tetap, sehingga proporsional di semua perangkat.
 *
 * ── Komponen yang Digunakan ──
 * <View>  → Container layout (card, row, section)
 * <Text>  → Label, judul, kategori, area
 * <Image> → Thumbnail makanan dari API
 *
 * ============================================================================
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
  Platform,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";

// ─────────────────────────────────────────────────────────────────────────────
// § TypeScript Interfaces
// ─────────────────────────────────────────────────────────────────────────────

interface IMealSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string;
  strArea?: string;
}

interface ICategory {
  strCategory: string;
}

interface ICategoryResponse {
  meals: ICategory[];
}

interface ISearchResponse {
  meals: IMealSummary[] | null;
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SEARCH_API =
  process.env.EXPO_PUBLIC_API_SEARCH_URL ||
  "https://www.themealdb.com/api/json/v1/1/search.php";
const FILTER_API =
  process.env.EXPO_PUBLIC_API_FILTER_URL ||
  "https://www.themealdb.com/api/json/v1/1/filter.php";
const CATEGORIES_API =
  process.env.EXPO_PUBLIC_API_CATEGORIES_URL ||
  "https://www.themealdb.com/api/json/v1/1/list.php?c=list";

/** Status bar height for safe padding */
const STATUS_BAR_HEIGHT =
  Platform.OS === "ios" ? 48 : (StatusBar.currentHeight || 24) + 8;

// ─────────────────────────────────────────────────────────────────────────────
// § Component
// ─────────────────────────────────────────────────────────────────────────────

export default function CatalogScreen() {
  const router = useRouter();

  const [meals, setMeals] = useState<IMealSummary[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch Categories ──────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(CATEGORIES_API);
      const data: ICategoryResponse = await res.json();
      if (data.meals) {
        const cats = data.meals.map((c) => c.strCategory);
        setCategories(["All", ...cats.slice(0, 8)]);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);

  // ── Fetch Meals ───────────────────────────────────────────────────────
  const fetchMeals = useCallback(
    async (category: string, query: string) => {
      try {
        setError(null);

        let url: string;
        if (query.trim().length > 0) {
          // Search by name
          url = `${SEARCH_API}?s=${encodeURIComponent(query.trim())}`;
        } else if (category === "All") {
          // Default: search all (empty search returns random-ish results)
          url = `${SEARCH_API}?s=`;
        } else {
          // Filter by category
          url = `${FILTER_API}?c=${encodeURIComponent(category)}`;
        }

        const res = await fetch(url);
        const data: ISearchResponse = await res.json();

        if (data.meals) {
          setMeals(data.meals);
        } else {
          setMeals([]);
        }
      } catch (err) {
        setError("Gagal memuat katalog. Periksa koneksi internet.");
      }
    },
    []
  );

  // ── Initial Load ──────────────────────────────────────────────────────
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await fetchCategories();
      await fetchMeals("All", "");
      setLoading(false);
    };
    initialize();
  }, []);

  // ── Category Change ───────────────────────────────────────────────────
  useEffect(() => {
    if (!loading) {
      setLoading(true);
      fetchMeals(selectedCategory, searchQuery).finally(() =>
        setLoading(false)
      );
    }
  }, [selectedCategory]);

  // ── Search Handler ────────────────────────────────────────────────────
  const handleSearch = useCallback(() => {
    setLoading(true);
    fetchMeals(selectedCategory, searchQuery).finally(() => setLoading(false));
  }, [selectedCategory, searchQuery, fetchMeals]);

  // ── Pull to Refresh ───────────────────────────────────────────────────
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMeals(selectedCategory, searchQuery);
    setRefreshing(false);
  }, [selectedCategory, searchQuery, fetchMeals]);

  // ── Navigate to Detail ────────────────────────────────────────────────
  const goToDetail = (mealId: string) => {
    router.push(`/(protected)/detail/${mealId}`);
  };

  // ── Render Meal Card ──────────────────────────────────────────────────
  /**
   * Each meal card uses Flexbox with flexDirection: "row" to place:
   *   - Image on the left (fixed aspect ratio)
   *   - Text info on the right (flex: 1 to fill remaining space)
   *
   * This ensures the layout adapts to any screen width proportionally.
   */
  const renderMealItem = ({ item }: { item: IMealSummary }) => (
    <TouchableOpacity
      style={styles.mealCard}
      activeOpacity={0.8}
      onPress={() => goToDetail(item.idMeal)}
    >
      {/* ── ROW LAYOUT: Image (left) + Info (right) ─────────────────── */}
      <View style={styles.mealRow}>
        {/* Left: Food Image */}
        <Image
          source={{ uri: item.strMealThumb }}
          style={styles.mealImage}
          resizeMode="cover"
        />

        {/* Right: Food Info — flex: 1 fills remaining horizontal space */}
        <View style={styles.mealInfo}>
          <Text style={styles.mealName} numberOfLines={2}>
            {item.strMeal}
          </Text>

          {/* Category & Area Tags (if available from search API) */}
          {(item.strCategory || item.strArea) && (
            <View style={styles.mealTags}>
              {item.strCategory && (
                <View style={styles.miniTag}>
                  <Text style={styles.miniTagText}>🍽️ {item.strCategory}</Text>
                </View>
              )}
              {item.strArea && (
                <View style={[styles.miniTag, styles.miniTagArea]}>
                  <Text style={styles.miniTagText}>🌍 {item.strArea}</Text>
                </View>
              )}
            </View>
          )}

          {/* View Detail Button */}
          <TouchableOpacity
            style={styles.detailBtn}
            activeOpacity={0.7}
            onPress={() => goToDetail(item.idMeal)}
          >
            <Text style={styles.detailBtnText}>Lihat Detail →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // ── Main Render ───────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* ── Header Section ───────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: STATUS_BAR_HEIGHT }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerGreeting}>Selamat datang! 👋</Text>
            <Text style={styles.headerTitle}>Katalog Makanan</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>
              {meals.length} resep
            </Text>
          </View>
        </View>

        {/* ── Search Bar ─────────────────────────────────────────────── */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari resep makanan..."
            placeholderTextColor={TEXT_MUTED}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setLoading(true);
                fetchMeals(selectedCategory, "").finally(() =>
                  setLoading(false)
                );
              }}
            >
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Category Chips (Horizontal Scroll) ─────────────────────── */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.chipsContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.chip,
                selectedCategory === item && styles.chipActive,
              ]}
              activeOpacity={0.7}
              onPress={() => {
                setSelectedCategory(item);
                setSearchQuery("");
              }}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedCategory === item && styles.chipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* ── Content Area ─────────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={ORANGE} />
          <Text style={styles.stateText}>Memuat katalog...</Text>
        </View>
      ) : error ? (
        <View style={styles.centeredState}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              setLoading(true);
              fetchMeals(selectedCategory, searchQuery).finally(() =>
                setLoading(false)
              );
            }}
          >
            <Text style={styles.retryBtnText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : meals.length === 0 ? (
        <View style={styles.centeredState}>
          <Text style={styles.emptyIcon}>🍜</Text>
          <Text style={styles.emptyTitle}>Tidak ditemukan</Text>
          <Text style={styles.stateText}>
            Coba kata kunci atau kategori lain.
          </Text>
        </View>
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item) => item.idMeal}
          renderItem={renderMealItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={ORANGE}
              colors={[ORANGE]}
              progressBackgroundColor={BG_CARD}
            />
          }
        />
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// § Styles — Fully Flexbox-based responsive layout
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_PRIMARY,
  },

  // ── Header ─────────────────────────────────────────────────────────────
  header: {
    backgroundColor: BG_CARD,
    paddingHorizontal: "5%",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(249, 115, 22, 0.1)",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  headerGreeting: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  headerBadge: {
    backgroundColor: "rgba(249, 115, 22, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.25)",
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: ORANGE_LIGHT,
  },

  // ── Search ─────────────────────────────────────────────────────────────
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG_CARD_ELEVATED,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.04)",
    marginBottom: 14,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: TEXT_PRIMARY,
    height: "100%",
  },
  clearBtn: {
    fontSize: 14,
    color: TEXT_MUTED,
    padding: 4,
  },

  // ── Category Chips ─────────────────────────────────────────────────────
  chipsContainer: {
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    backgroundColor: BG_CARD_ELEVATED,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  chipActive: {
    backgroundColor: ORANGE,
    borderColor: ORANGE,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_SECONDARY,
  },
  chipTextActive: {
    color: "#fff",
  },

  // ── Meal List ──────────────────────────────────────────────────────────
  listContent: {
    padding: "4%",
    gap: 14,
    paddingBottom: 100,
  },

  /**
   * Meal Card: The outer container for each food item.
   * Uses a rounded card with subtle border for a premium look.
   */
  mealCard: {
    backgroundColor: BG_CARD,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.04)",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },

  /**
   * mealRow — FLEXBOX ROW LAYOUT (UAS Requirement)
   *
   * flexDirection: "row" places the image and info SIDE BY SIDE.
   * This is the core Flexbox requirement from the UAS:
   * "gambar dan informasi produk tersusun rapi dalam satu baris (row)"
   */
  mealRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },

  /**
   * mealImage — Food thumbnail
   * Uses fixed width (30% of card) + aspectRatio: 1 for a square image.
   * Proportional sizing ensures it looks good on all screen sizes.
   */
  mealImage: {
    width: "30%",
    aspectRatio: 1,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },

  /**
   * mealInfo — Text content area
   * flex: 1 makes it take all remaining horizontal space after the image.
   * Internal padding uses percentage for proportional spacing.
   */
  mealInfo: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
  },

  mealName: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    lineHeight: 22,
    letterSpacing: -0.2,
  },

  // ── Mini Tags ──────────────────────────────────────────────────────────
  mealTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  miniTag: {
    backgroundColor: BG_CARD_ELEVATED,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.15)",
  },
  miniTagArea: {
    borderColor: "rgba(251, 146, 60, 0.15)",
  },
  miniTagText: {
    fontSize: 11,
    color: TEXT_SECONDARY,
    fontWeight: "500",
  },

  // ── Detail Button ──────────────────────────────────────────────────────
  detailBtn: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(249, 115, 22, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.25)",
  },
  detailBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: ORANGE,
    letterSpacing: 0.3,
  },

  // ── States ─────────────────────────────────────────────────────────────
  centeredState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: "8%",
  },
  stateText: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: "center",
  },
  errorIcon: {
    fontSize: 40,
  },
  errorText: {
    fontSize: 14,
    color: ORANGE_LIGHT,
    textAlign: "center",
    lineHeight: 20,
  },
  retryBtn: {
    backgroundColor: ORANGE,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
});
