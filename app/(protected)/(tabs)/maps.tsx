/**
 * ============================================================================
 * app/(protected)/(tabs)/maps.tsx — Fitur Maps (Lokasi Restoran)
 * ============================================================================
 *
 * Halaman peta yang menampilkan lokasi restoran dan lokasi pengguna saat ini.
 *
 * Fitur:
 *   - Menampilkan peta menggunakan react-native-maps (MapView)
 *   - Menampilkan lokasi GPS pengguna saat ini (expo-location)
 *   - Minimal 1 marker pada peta (menampilkan beberapa restoran dummy)
 *   - Marker custom dengan callout informatif
 *   - Tombol "center to my location" untuk navigasi ke posisi user
 *
 * ============================================================================
 */

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Platform,
  Alert,
  Dimensions,
} from "react-native";
import MapView, { Marker, Callout, type Region } from "react-native-maps";
import * as Location from "expo-location";

// ─────────────────────────────────────────────────────────────────────────────
// § TypeScript Interfaces
// ─────────────────────────────────────────────────────────────────────────────

interface IRestaurantMarker {
  id: string;
  name: string;
  description: string;
  emoji: string;
  latitude: number;
  longitude: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// § Constants & Theme
// ─────────────────────────────────────────────────────────────────────────────

const ORANGE = "#f97316";
const ORANGE_LIGHT = "#fb923c";
const ORANGE_DIM = "rgba(249, 115, 22, 0.15)";
const BG_PRIMARY = "#0f0f0f";
const BG_CARD = "#1a1a1a";
const TEXT_PRIMARY = "#f5f5f5";
const TEXT_SECONDARY = "#a3a3a3";
const TEXT_MUTED = "#737373";

const STATUS_BAR_HEIGHT =
  Platform.OS === "ios" ? 48 : (StatusBar.currentHeight || 24) + 8;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

/** Default region (Jakarta, Indonesia) — fallback if GPS fails */
const DEFAULT_REGION: Region = {
  latitude: -6.2088,
  longitude: 106.8456,
  latitudeDelta: 0.03,
  longitudeDelta: 0.03,
};

/**
 * Dummy restaurant markers — these will be placed near the user's
 * actual GPS location (offset by small random deltas).
 */
const RESTAURANT_TEMPLATES: Omit<IRestaurantMarker, "latitude" | "longitude">[] = [
  {
    id: "r1",
    name: "FlavorDash Kitchen",
    description: "Restoran utama FlavorDash — masakan internasional premium",
    emoji: "🍽️",
  },
  {
    id: "r2",
    name: "Warung Nusantara",
    description: "Masakan khas Nusantara autentik, dari Sabang sampai Merauke",
    emoji: "🍛",
  },
  {
    id: "r3",
    name: "Sushi Sakura",
    description: "Japanese cuisine — sushi, ramen, dan donburi terbaik",
    emoji: "🍣",
  },
  {
    id: "r4",
    name: "Pasta Paradise",
    description: "Italian restaurant — pasta handmade dan pizza wood-fired",
    emoji: "🍝",
  },
  {
    id: "r5",
    name: "Burger Boulevard",
    description: "Premium burgers with gourmet toppings dan kentang goreng",
    emoji: "🍔",
  },
];

/**
 * Dark mode map style for consistency with FlavorDash theme.
 */
const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#181818" }],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#2c2c2c" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212121" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.fill",
    stylers: [{ color: "#3c3c3c" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#000000" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3d3d3d" }],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// § Component
// ─────────────────────────────────────────────────────────────────────────────

export default function MapsScreen() {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [restaurants, setRestaurants] = useState<IRestaurantMarker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<IRestaurantMarker | null>(null);

  // ── Get User Location & Generate Nearby Restaurants ───────────────────
  useEffect(() => {
    const initLocation = async () => {
      try {
        // Request location permission
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setLocationError(
            "Izin lokasi ditolak. Menggunakan lokasi default (Jakarta)."
          );
          // Use default region and generate restaurants around Jakarta
          generateRestaurants(DEFAULT_REGION.latitude, DEFAULT_REGION.longitude);
          setLoading(false);
          return;
        }

        // Get current position
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = location.coords;

        setUserLocation({ latitude, longitude });

        const newRegion: Region = {
          latitude,
          longitude,
          latitudeDelta: 0.025,
          longitudeDelta: 0.025,
        };
        setRegion(newRegion);

        // Generate restaurant markers near user's location
        generateRestaurants(latitude, longitude);
      } catch (err) {
        console.error("Location error:", err);
        setLocationError("Gagal mendapatkan lokasi. Menggunakan lokasi default.");
        generateRestaurants(DEFAULT_REGION.latitude, DEFAULT_REGION.longitude);
      } finally {
        setLoading(false);
      }
    };

    initLocation();
  }, []);

  /**
   * generateRestaurants — Creates restaurant markers near a given coordinate.
   * Adds small random offsets so markers spread around the user's location.
   */
  const generateRestaurants = (baseLat: number, baseLng: number) => {
    const markers: IRestaurantMarker[] = RESTAURANT_TEMPLATES.map(
      (template, index) => {
        // Generate offsets to place restaurants in different directions
        const angle = (index / RESTAURANT_TEMPLATES.length) * 2 * Math.PI;
        const distance = 0.003 + Math.random() * 0.005; // ~300m to ~800m away
        return {
          ...template,
          latitude: baseLat + distance * Math.cos(angle),
          longitude: baseLng + distance * Math.sin(angle),
        };
      }
    );
    setRestaurants(markers);
  };

  /**
   * centerToUser — Animates the map back to the user's GPS location.
   */
  const centerToUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...userLocation,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        800
      );
    } else {
      Alert.alert("Lokasi Tidak Tersedia", "GPS belum aktif atau izin ditolak.");
    }
  };

  // ── Loading State ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <ActivityIndicator size="large" color={ORANGE} />
        <Text style={styles.loadingText}>Mendapatkan lokasi GPS...</Text>
        <Text style={styles.loadingHint}>
          Pastikan GPS aktif di perangkat Anda
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* ── Header Overlay ──────────────────────────────────────────── */}
      <View style={[styles.headerOverlay, { paddingTop: STATUS_BAR_HEIGHT }]}>
        <Text style={styles.headerTitle}>📍 Lokasi Restoran</Text>
        <Text style={styles.headerSubtitle}>
          {restaurants.length} restoran ditemukan di sekitar Anda
        </Text>
        {locationError && (
          <View style={styles.locationWarning}>
            <Text style={styles.locationWarningText}>⚠️ {locationError}</Text>
          </View>
        )}
      </View>

      {/* ── Map View ────────────────────────────────────────────────── */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        customMapStyle={DARK_MAP_STYLE}
        toolbarEnabled={false}
      >
        {/* ── Restaurant Markers ────────────────────────────────────── */}
        {restaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            coordinate={{
              latitude: restaurant.latitude,
              longitude: restaurant.longitude,
            }}
            title={restaurant.name}
            description={restaurant.description}
            onPress={() => setSelectedRestaurant(restaurant)}
          >
            {/* Custom Marker View */}
            <View style={styles.markerContainer}>
              <View style={styles.markerBubble}>
                <Text style={styles.markerEmoji}>{restaurant.emoji}</Text>
              </View>
              <View style={styles.markerArrow} />
            </View>

            {/* Callout (info popup when marker is tapped) */}
            <Callout tooltip style={styles.callout}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{restaurant.name}</Text>
                <Text style={styles.calloutDesc}>
                  {restaurant.description}
                </Text>
                <View style={styles.calloutBadge}>
                  <Text style={styles.calloutBadgeText}>
                    {restaurant.emoji} FlavorDash Partner
                  </Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* ── Floating Buttons ────────────────────────────────────────── */}
      {/* Center to my location button */}
      <TouchableOpacity
        style={[styles.myLocationBtn, { top: STATUS_BAR_HEIGHT + 100 }]}
        activeOpacity={0.8}
        onPress={centerToUser}
      >
        <Text style={styles.myLocationIcon}>📌</Text>
      </TouchableOpacity>

      {/* ── Bottom Info Card ────────────────────────────────────────── */}
      {selectedRestaurant && (
        <View style={styles.bottomCard}>
          <View style={styles.bottomCardHandle} />
          <View style={styles.bottomCardContent}>
            <Text style={styles.bottomCardEmoji}>
              {selectedRestaurant.emoji}
            </Text>
            <View style={styles.bottomCardInfo}>
              <Text style={styles.bottomCardName}>
                {selectedRestaurant.name}
              </Text>
              <Text style={styles.bottomCardDesc} numberOfLines={2}>
                {selectedRestaurant.description}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.bottomCardCloseBtn}
            onPress={() => setSelectedRestaurant(null)}
          >
            <Text style={styles.bottomCardCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// § Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_PRIMARY,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: BG_PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: TEXT_SECONDARY,
    fontSize: 16,
    fontWeight: "500",
  },
  loadingHint: {
    color: TEXT_MUTED,
    fontSize: 13,
  },

  // ── Header Overlay ─────────────────────────────────────────────────────
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "rgba(15, 15, 15, 0.88)",
    paddingHorizontal: "5%",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(249, 115, 22, 0.15)",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginTop: 4,
  },
  locationWarning: {
    backgroundColor: "rgba(249, 115, 22, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  locationWarningText: {
    fontSize: 11,
    color: ORANGE_LIGHT,
  },

  // ── Map ────────────────────────────────────────────────────────────────
  map: {
    flex: 1,
    width: "100%",
  },

  // ── Custom Marker ──────────────────────────────────────────────────────
  markerContainer: {
    alignItems: "center",
  },
  markerBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ORANGE,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  markerEmoji: {
    fontSize: 18,
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: ORANGE,
    marginTop: -1,
  },

  // ── Callout ────────────────────────────────────────────────────────────
  callout: {
    width: 220,
  },
  calloutContainer: {
    backgroundColor: BG_CARD,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.2)",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  calloutTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 6,
  },
  calloutDesc: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    lineHeight: 18,
    marginBottom: 10,
  },
  calloutBadge: {
    backgroundColor: ORANGE_DIM,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  calloutBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: ORANGE,
  },

  // ── My Location Button ─────────────────────────────────────────────────
  myLocationBtn: {
    position: "absolute",
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BG_CARD,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.2)",
    zIndex: 10,
  },
  myLocationIcon: {
    fontSize: 22,
  },

  // ── Bottom Card ────────────────────────────────────────────────────────
  bottomCard: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 100 : 76,
    left: 16,
    right: 16,
    backgroundColor: BG_CARD,
    borderRadius: 16,
    padding: 16,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.15)",
    zIndex: 10,
  },
  bottomCardHandle: {
    width: 36,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  bottomCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  bottomCardEmoji: {
    fontSize: 32,
  },
  bottomCardInfo: {
    flex: 1,
  },
  bottomCardName: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  bottomCardDesc: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    lineHeight: 18,
  },
  bottomCardCloseBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomCardCloseText: {
    fontSize: 14,
    color: TEXT_MUTED,
    fontWeight: "700",
  },
});
