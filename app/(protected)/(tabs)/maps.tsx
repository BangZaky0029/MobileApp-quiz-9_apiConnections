/**
 * ============================================================================
 * app/(protected)/(tabs)/maps.tsx — Fitur Maps (OpenStreetMap via Leaflet)
 * ============================================================================
 *
 * Halaman peta yang menampilkan lokasi restoran dan lokasi pengguna saat ini.
 * Menggunakan OpenStreetMap (Leaflet) via WebView agar 100% GRATIS dan
 * tidak memerlukan Google Maps API Key.
 *
 * Fitur:
 *   - Menampilkan peta menggunakan react-native-webview
 *   - Memuat Leaflet JS secara dinamis ke dalam WebView
 *   - Menampilkan lokasi GPS pengguna saat ini (expo-location)
 *   - 5 marker restoran dengan icon custom
 *   - Menggunakan CartoDB Dark Matter tile server untuk tema Dark Mode
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
  Dimensions,
} from "react-native";
import * as Location from "expo-location";
import { WebView } from "react-native-webview";

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
const BG_PRIMARY = "#0f0f0f";
const TEXT_PRIMARY = "#f5f5f5";
const TEXT_SECONDARY = "#a3a3a3";
const TEXT_MUTED = "#737373";

const STATUS_BAR_HEIGHT =
  Platform.OS === "ios" ? 48 : (StatusBar.currentHeight || 24) + 8;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

/** Default region (Jakarta, Indonesia) — fallback if GPS fails */
const DEFAULT_LAT = -6.2088;
const DEFAULT_LNG = 106.8456;

/** Template restoran dummy */
const RESTAURANT_TEMPLATES: Omit<IRestaurantMarker, "latitude" | "longitude">[] = [
  {
    id: "r1",
    name: "FlavorDash Kitchen",
    description: "Restoran utama FlavorDash — masakan internasional",
    emoji: "🍽️",
  },
  {
    id: "r2",
    name: "Warung Nusantara",
    description: "Masakan khas Nusantara autentik",
    emoji: "🍛",
  },
  {
    id: "r3",
    name: "Sushi Sakura",
    description: "Japanese cuisine — sushi & ramen",
    emoji: "🍣",
  },
  {
    id: "r4",
    name: "Pasta Paradise",
    description: "Italian restaurant — pasta handmade",
    emoji: "🍝",
  },
  {
    id: "r5",
    name: "Burger Boulevard",
    description: "Premium burgers with gourmet toppings",
    emoji: "🍔",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// § Component
// ─────────────────────────────────────────────────────────────────────────────

export default function MapsScreen() {
  const webViewRef = useRef<WebView>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [restaurants, setRestaurants] = useState<IRestaurantMarker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  // ── 1. Dapatkan Lokasi & Generate Marker ──────────────────────────────
  useEffect(() => {
    const initLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setLocationError("Izin lokasi ditolak (Menggunakan lokasi default).");
          setupMapData(DEFAULT_LAT, DEFAULT_LNG);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setupMapData(location.coords.latitude, location.coords.longitude);
      } catch (err) {
        console.error("Location error:", err);
        setLocationError("Gagal mendapatkan lokasi GPS.");
        setupMapData(DEFAULT_LAT, DEFAULT_LNG);
      }
    };

    initLocation();
  }, []);

  const setupMapData = (lat: number, lng: number) => {
    setUserLocation({ latitude: lat, longitude: lng });

    // Generate marker restoran di sekitar lokasi user
    const markers: IRestaurantMarker[] = RESTAURANT_TEMPLATES.map(
      (template, index) => {
        const angle = (index / RESTAURANT_TEMPLATES.length) * 2 * Math.PI;
        const distance = 0.003 + Math.random() * 0.005; // Jarak random
        return {
          ...template,
          latitude: lat + distance * Math.cos(angle),
          longitude: lng + distance * Math.sin(angle),
        };
      }
    );
    
    setRestaurants(markers);
    setLoading(false);
  };

  // ── 2. Center to User (Inject JavaScript ke WebView) ──────────────────
  const centerToUser = () => {
    if (userLocation && webViewRef.current) {
      const script = `
        if (window.map) {
          window.map.flyTo([${userLocation.latitude}, ${userLocation.longitude}], 15, {
            animate: true,
            duration: 1.5
          });
        }
        true;
      `;
      webViewRef.current.injectJavaScript(script);
    }
  };

  // ── 3. HTML Generator untuk Leaflet WebView ───────────────────────────
  const generateHTML = () => {
    if (!userLocation) return "";

    const restaurantsJSON = JSON.stringify(restaurants);

    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
              body { padding: 0; margin: 0; background-color: #0f0f0f; }
              html, body, #map { height: 100%; width: 100%; }
              
              /* Custom User Icon Marker */
              .user-icon {
                  background-color: #3b82f6;
                  border: 2px solid #ffffff;
                  border-radius: 50%;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.4);
                  font-size: 16px;
              }
              
              /* Custom Restaurant Icon Marker */
              .resto-icon {
                  background-color: #f97316;
                  border: 2px solid #ffffff;
                  border-radius: 50%;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.4);
                  font-size: 18px;
              }

              /* Styling Popup Leaflet agar cocok dengan Dark Mode */
              .leaflet-popup-content-wrapper {
                  background-color: #1a1a1a;
                  color: #f5f5f5;
                  border-radius: 12px;
                  border: 1px solid rgba(249, 115, 22, 0.3);
              }
              .leaflet-popup-tip {
                  background-color: #1a1a1a;
              }
              .popup-title {
                  color: #fb923c;
                  font-weight: bold;
                  font-size: 14px;
                  margin-bottom: 4px;
                  font-family: sans-serif;
              }
              .popup-desc {
                  color: #a3a3a3;
                  font-size: 12px;
                  margin: 0;
                  font-family: sans-serif;
              }
          </style>
      </head>
      <body>
          <div id="map"></div>
          <script>
              // Initialize Map
              var map = L.map('map', {
                  zoomControl: false,
                  attributionControl: false
              }).setView([${userLocation.latitude}, ${userLocation.longitude}], 15);
              
              // Simpan map ke global window agar bisa diakses oleh injectJavaScript React Native
              window.map = map;

              // Gunakan CartoDB Dark Matter Tile Server (Gratis, Dark Mode Theme)
              L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                  maxZoom: 19
              }).addTo(map);

              // Tambah Marker User Lokasi
              var userIcon = L.divIcon({
                  className: 'user-icon',
                  html: '📍',
                  iconSize: [28, 28],
                  iconAnchor: [14, 14]
              });
              L.marker([${userLocation.latitude}, ${userLocation.longitude}], {icon: userIcon})
               .addTo(map)
               .bindPopup('<div class="popup-title">Lokasi Anda</div>');

               // Parse data restoran dari React Native
              var restaurants = ${restaurantsJSON};
              
              // Looping untuk membuat marker restoran
              restaurants.forEach(function(r) {
                  var icon = L.divIcon({
                      className: 'resto-icon',
                      html: r.emoji,
                      iconSize: [36, 36],
                      iconAnchor: [18, 18]
                  });
                  var popupContent = '<div class="popup-title">' + r.name + '</div><p class="popup-desc">' + r.description + '</p>';
                  
                  L.marker([r.latitude, r.longitude], {icon: icon})
                   .addTo(map)
                   .bindPopup(popupContent);
              });
          </script>
      </body>
      </html>
    `;
  };

  // ── Loading State ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <ActivityIndicator size="large" color={ORANGE} />
        <Text style={styles.loadingText}>Mempersiapkan Peta OpenStreetMap...</Text>
        <Text style={styles.loadingHint}>Gratis tanpa Google Maps API Key</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Header Overlay ──────────────────────────────────────────── */}
      <View style={[styles.headerOverlay, { paddingTop: STATUS_BAR_HEIGHT }]}>
        <Text style={styles.headerTitle}>📍 Lokasi Restoran</Text>
        <Text style={styles.headerSubtitle}>
          OpenStreetMap (Leaflet) • {restaurants.length} Restoran
        </Text>
        {locationError && (
          <View style={styles.locationWarning}>
            <Text style={styles.locationWarningText}>⚠️ {locationError}</Text>
          </View>
        )}
      </View>

      {/* ── Map View (WebView) ──────────────────────────────────────── */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: generateHTML() }}
          style={styles.webview}
          scrollEnabled={false}
          bounces={false}
          javaScriptEnabled={true}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* ── Floating Buttons ────────────────────────────────────────── */}
      <TouchableOpacity
        style={[styles.myLocationBtn, { top: STATUS_BAR_HEIGHT + 90 }]}
        activeOpacity={0.8}
        onPress={centerToUser}
      >
        <Text style={styles.myLocationIcon}>📌</Text>
      </TouchableOpacity>
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
    backgroundColor: "rgba(15, 15, 15, 0.9)",
    paddingHorizontal: "5%",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(249, 115, 22, 0.2)",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: ORANGE_LIGHT,
    marginTop: 4,
    fontWeight: "500",
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

  // ── Map WebView ────────────────────────────────────────────────────────
  mapContainer: {
    flex: 1,
    backgroundColor: BG_PRIMARY,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },

  // ── My Location Button ─────────────────────────────────────────────────
  myLocationBtn: {
    position: "absolute",
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.3)",
    zIndex: 10,
  },
  myLocationIcon: {
    fontSize: 22,
  },
});
