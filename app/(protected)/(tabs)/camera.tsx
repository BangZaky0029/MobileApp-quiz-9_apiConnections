/**
 * ============================================================================
 * app/(protected)/(tabs)/camera.tsx — Fitur Camera (Bukti Penerimaan Pesanan)
 * ============================================================================
 *
 * Halaman untuk mengambil foto sebagai bukti penerimaan pesanan.
 *
 * Flow:
 *   1. User menekan tombol "Ambil Foto Bukti Penerimaan"
 *   2. Kamera terbuka (via expo-image-picker → launchCameraAsync)
 *   3. Setelah foto diambil, preview ditampilkan di layar
 *   4. User bisa:
 *      - Simpan (set sebagai bukti — stored in state)
 *      - Retake (ambil foto baru)
 *
 * Menggunakan expo-image-picker karena lebih simpel dan stabil
 * dibanding expo-camera untuk kebutuhan "ambil foto + tampilkan".
 *
 * ============================================================================
 */

import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Alert,
  ScrollView,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

// ─────────────────────────────────────────────────────────────────────────────
// § Constants & Theme
// ─────────────────────────────────────────────────────────────────────────────

const ORANGE = "#f97316";
const ORANGE_LIGHT = "#fb923c";
const ORANGE_DIM = "rgba(249, 115, 22, 0.15)";
const BG_PRIMARY = "#0f0f0f";
const BG_CARD = "#1a1a1a";
const BG_CARD_ELEVATED = "#242424";
const TEXT_PRIMARY = "#f5f5f5";
const TEXT_SECONDARY = "#a3a3a3";
const TEXT_MUTED = "#737373";
const GREEN = "#22c55e";

const STATUS_BAR_HEIGHT =
  Platform.OS === "ios" ? 48 : (StatusBar.currentHeight || 24) + 8;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─────────────────────────────────────────────────────────────────────────────
// § Component
// ─────────────────────────────────────────────────────────────────────────────

export default function CameraScreen() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [photoTimestamp, setPhotoTimestamp] = useState<string | null>(null);

  /**
   * takePhoto — Opens the device camera via expo-image-picker.
   * Requests camera permission if not already granted.
   */
  const takePhoto = async () => {
    try {
      // Request camera permission
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Izin Diperlukan",
          "FlavorDash membutuhkan akses kamera untuk mengambil foto bukti penerimaan pesanan.",
          [{ text: "OK" }]
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      // Check if user cancelled
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
        setIsConfirmed(false);
        setPhotoTimestamp(new Date().toLocaleString("id-ID"));
      }
    } catch (err) {
      console.error("Camera error:", err);
      Alert.alert("Error", "Gagal membuka kamera. Coba lagi.");
    }
  };

  /**
   * confirmPhoto — Marks the photo as confirmed delivery proof.
   */
  const confirmPhoto = () => {
    setIsConfirmed(true);
    Alert.alert(
      "✅ Bukti Tersimpan",
      "Foto bukti penerimaan pesanan berhasil disimpan.",
      [{ text: "OK" }]
    );
  };

  /**
   * retakePhoto — Resets state and opens camera again.
   */
  const retakePhoto = () => {
    setPhotoUri(null);
    setIsConfirmed(false);
    setPhotoTimestamp(null);
    takePhoto();
  };

  /**
   * resetAll — Clear all state.
   */
  const resetAll = () => {
    setPhotoUri(null);
    setIsConfirmed(false);
    setPhotoTimestamp(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ────────────────────────────────────────────────── */}
        <View style={[styles.header, { paddingTop: STATUS_BAR_HEIGHT }]}>
          <Text style={styles.headerTitle}>📷 Bukti Penerimaan</Text>
          <Text style={styles.headerSubtitle}>
            Ambil foto sebagai bukti penerimaan pesanan Anda
          </Text>
        </View>

        {/* ── Content ───────────────────────────────────────────────── */}
        <View style={styles.content}>
          {!photoUri ? (
            /* ── No Photo State ─────────────────────────────────────── */
            <View style={styles.emptyState}>
              <View style={styles.cameraIconContainer}>
                <Text style={styles.cameraIconEmoji}>📸</Text>
              </View>
              <Text style={styles.emptyTitle}>Belum Ada Foto</Text>
              <Text style={styles.emptyDesc}>
                Ambil foto bukti penerimaan pesanan untuk konfirmasi bahwa
                pesanan telah diterima dengan baik.
              </Text>

              <TouchableOpacity
                style={styles.takePhotoBtn}
                activeOpacity={0.8}
                onPress={takePhoto}
              >
                <Text style={styles.takePhotoBtnIcon}>📷</Text>
                <Text style={styles.takePhotoBtnText}>
                  Ambil Foto Bukti Penerimaan
                </Text>
              </TouchableOpacity>

              {/* Info Card */}
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>💡 Tips Foto yang Baik</Text>
                <Text style={styles.infoText}>
                  • Pastikan pesanan terlihat jelas dalam foto
                </Text>
                <Text style={styles.infoText}>
                  • Ambil foto di tempat yang cukup cahaya
                </Text>
                <Text style={styles.infoText}>
                  • Sertakan label/nomor pesanan jika ada
                </Text>
              </View>
            </View>
          ) : (
            /* ── Photo Preview State ────────────────────────────────── */
            <View style={styles.previewState}>
              {/* Photo Preview Card */}
              <View style={styles.previewCard}>
                <View style={styles.previewHeader}>
                  <Text style={styles.previewLabel}>
                    {isConfirmed ? "✅ Bukti Terkonfirmasi" : "📋 Preview Foto"}
                  </Text>
                  {photoTimestamp && (
                    <Text style={styles.previewTimestamp}>
                      🕐 {photoTimestamp}
                    </Text>
                  )}
                </View>

                {/* ── Photo Image Display ───────────────────────────── */}
                <View style={styles.photoContainer}>
                  <Image
                    source={{ uri: photoUri }}
                    style={styles.photoImage}
                    resizeMode="cover"
                  />
                  {isConfirmed && (
                    <View style={styles.confirmedOverlay}>
                      <View style={styles.confirmedBadge}>
                        <Text style={styles.confirmedBadgeText}>
                          ✅ TERKONFIRMASI
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Status Indicator */}
                <View
                  style={[
                    styles.statusBar,
                    isConfirmed ? styles.statusConfirmed : styles.statusPending,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {isConfirmed
                      ? "Bukti penerimaan telah dikonfirmasi"
                      : "Menunggu konfirmasi..."}
                  </Text>
                </View>
              </View>

              {/* ── Action Buttons ──────────────────────────────────── */}
              <View style={styles.actionButtons}>
                {!isConfirmed && (
                  <TouchableOpacity
                    style={styles.confirmBtn}
                    activeOpacity={0.8}
                    onPress={confirmPhoto}
                  >
                    <Text style={styles.confirmBtnText}>
                      ✅ Konfirmasi Bukti
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.retakeBtn}
                  activeOpacity={0.8}
                  onPress={retakePhoto}
                >
                  <Text style={styles.retakeBtnText}>📷 Ambil Ulang</Text>
                </TouchableOpacity>

                {isConfirmed && (
                  <TouchableOpacity
                    style={styles.newPhotoBtn}
                    activeOpacity={0.8}
                    onPress={resetAll}
                  >
                    <Text style={styles.newPhotoBtnText}>
                      🔄 Pesanan Baru
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },

  // ── Header ─────────────────────────────────────────────────────────────
  header: {
    backgroundColor: BG_CARD,
    paddingHorizontal: "5%",
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(249, 115, 22, 0.1)",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginTop: 6,
    lineHeight: 20,
  },

  // ── Content ────────────────────────────────────────────────────────────
  content: {
    paddingHorizontal: "5%",
    paddingTop: 20,
  },

  // ── Empty State ────────────────────────────────────────────────────────
  emptyState: {
    alignItems: "center",
    gap: 16,
    paddingTop: 24,
  },
  cameraIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: ORANGE_DIM,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(249, 115, 22, 0.25)",
    marginBottom: 8,
  },
  cameraIconEmoji: {
    fontSize: 44,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  emptyDesc: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: "5%",
  },

  // ── Take Photo Button ─────────────────────────────────────────────────
  takePhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ORANGE,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    marginTop: 12,
    elevation: 6,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: "100%",
    justifyContent: "center",
  },
  takePhotoBtnIcon: {
    fontSize: 20,
  },
  takePhotoBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },

  // ── Info Card ──────────────────────────────────────────────────────────
  infoCard: {
    backgroundColor: BG_CARD,
    borderRadius: 16,
    padding: 18,
    width: "100%",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.04)",
    gap: 6,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: ORANGE_LIGHT,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    lineHeight: 20,
  },

  // ── Preview State ──────────────────────────────────────────────────────
  previewState: {
    gap: 16,
  },
  previewCard: {
    backgroundColor: BG_CARD,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.04)",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.04)",
  },
  previewLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  previewTimestamp: {
    fontSize: 11,
    color: TEXT_MUTED,
  },

  // ── Photo Display ──────────────────────────────────────────────────────
  photoContainer: {
    width: "100%",
    position: "relative",
  },
  photoImage: {
    width: "100%",
    aspectRatio: 4 / 3,
  },
  confirmedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmedBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.9)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  confirmedBadgeText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1,
  },

  // ── Status Bar ─────────────────────────────────────────────────────────
  statusBar: {
    padding: 12,
    alignItems: "center",
  },
  statusPending: {
    backgroundColor: ORANGE_DIM,
  },
  statusConfirmed: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_SECONDARY,
  },

  // ── Action Buttons ─────────────────────────────────────────────────────
  actionButtons: {
    gap: 12,
  },
  confirmBtn: {
    backgroundColor: GREEN,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    elevation: 4,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
  retakeBtn: {
    backgroundColor: BG_CARD_ELEVATED,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.2)",
  },
  retakeBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: ORANGE,
  },
  newPhotoBtn: {
    backgroundColor: BG_CARD,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  newPhotoBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_SECONDARY,
  },
});
