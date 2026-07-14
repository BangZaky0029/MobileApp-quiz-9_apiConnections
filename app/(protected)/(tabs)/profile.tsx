/**
 * ============================================================================
 * app/(protected)/(tabs)/profile.tsx — Profile & Logout Screen
 * ============================================================================
 *
 * Halaman profil pengguna yang menampilkan informasi akun dan
 * tombol logout untuk menghapus JWT token dari AsyncStorage.
 *
 * ============================================================================
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../../contexts/AuthContext";

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
const RED = "#ef4444";

const STATUS_BAR_HEIGHT =
  Platform.OS === "ios" ? 48 : (StatusBar.currentHeight || 24) + 8;

// ─────────────────────────────────────────────────────────────────────────────
// § Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const router = useRouter();
  const { userEmail, token, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  /**
   * handleLogout — Confirms and executes logout (removes JWT from storage).
   */
  const handleLogout = () => {
    Alert.alert("Konfirmasi Logout", "Apakah Anda yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          setLoggingOut(true);
          await logout();
          router.replace("/login");
        },
      },
    ]);
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
        {/* ── Header ──────────────────────────────────────────────── */}
        <View style={[styles.header, { paddingTop: STATUS_BAR_HEIGHT }]}>
          <Text style={styles.headerTitle}>👤 Profil</Text>
          <Text style={styles.headerSubtitle}>Informasi akun Anda</Text>
        </View>

        <View style={styles.content}>
          {/* ── Avatar Card ─────────────────────────────────────────── */}
          <View style={styles.avatarCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>👨‍🍳</Text>
            </View>
            <Text style={styles.userName}>
              {userEmail?.split("@")[0] || "User"}
            </Text>
            <Text style={styles.userEmail}>{userEmail || "N/A"}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>🔐 Authenticated User</Text>
            </View>
          </View>

          {/* ── Auth Info Card ──────────────────────────────────────── */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={styles.accentBar} />
              <Text style={styles.infoTitle}>Informasi Autentikasi</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Metode Auth</Text>
              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeText}>JWT (Stateless)</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>JWT Token</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {token ? `${token.substring(0, 20)}...` : "N/A"}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Provider API</Text>
              <Text style={styles.infoValue}>reqres.in</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active Session</Text>
              </View>
            </View>
          </View>

          {/* ── App Info Card ───────────────────────────────────────── */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={styles.accentBar} />
              <Text style={styles.infoTitle}>Tentang Aplikasi</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Aplikasi</Text>
              <Text style={styles.infoValue}>FlavorDash v2.0.0</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Framework</Text>
              <Text style={styles.infoValue}>React Native (Expo)</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mata Kuliah</Text>
              <Text style={styles.infoValue}>Pemrograman Mobile</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tugas</Text>
              <Text style={styles.infoValue}>UAS</Text>
            </View>
          </View>

          {/* ── Logout Button ──────────────────────────────────────── */}
          <TouchableOpacity
            style={[styles.logoutBtn, loggingOut && styles.logoutBtnDisabled]}
            activeOpacity={0.8}
            onPress={handleLogout}
            disabled={loggingOut}
          >
            <Text style={styles.logoutBtnText}>
              {loggingOut ? "Logging out..." : "🚪 Logout"}
            </Text>
          </TouchableOpacity>

          {/* ── Footer ─────────────────────────────────────────────── */}
          <View style={styles.footer}>
            <View style={styles.footerLine} />
            <Text style={styles.footerText}>
              UAS Pemrograman Mobile • Pak Sandy
            </Text>
            <Text style={styles.footerSub}>
              FlavorDash © 2026
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
  },

  // ── Content ────────────────────────────────────────────────────────────
  content: {
    paddingHorizontal: "5%",
    paddingTop: 20,
    gap: 16,
  },

  // ── Avatar Card ────────────────────────────────────────────────────────
  avatarCard: {
    backgroundColor: BG_CARD,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    borderTopWidth: 3,
    borderTopColor: ORANGE,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: ORANGE_DIM,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(249, 115, 22, 0.3)",
    marginBottom: 14,
  },
  avatarEmoji: {
    fontSize: 36,
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    letterSpacing: -0.3,
    textTransform: "capitalize",
  },
  userEmail: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: ORANGE_DIM,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.2)",
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: ORANGE_LIGHT,
  },

  // ── Info Card ──────────────────────────────────────────────────────────
  infoCard: {
    backgroundColor: BG_CARD,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.04)",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  accentBar: {
    width: 4,
    height: 20,
    backgroundColor: ORANGE,
    borderRadius: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: TEXT_MUTED,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    fontWeight: "600",
    maxWidth: "55%",
    textAlign: "right",
  },
  infoBadge: {
    backgroundColor: ORANGE_DIM,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  infoBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: ORANGE,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
  },
  statusText: {
    fontSize: 13,
    color: "#22c55e",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    marginVertical: 10,
  },

  // ── Logout Button ──────────────────────────────────────────────────────
  logoutBtn: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    marginTop: 8,
  },
  logoutBtnDisabled: {
    opacity: 0.5,
  },
  logoutBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: RED,
  },

  // ── Footer ─────────────────────────────────────────────────────────────
  footer: {
    alignItems: "center",
    marginTop: 16,
    gap: 6,
  },
  footerLine: {
    width: 40,
    height: 3,
    backgroundColor: ORANGE,
    borderRadius: 2,
    opacity: 0.3,
  },
  footerText: {
    fontSize: 12,
    color: TEXT_MUTED,
    letterSpacing: 0.3,
  },
  footerSub: {
    fontSize: 11,
    color: "rgba(115, 115, 115, 0.5)",
  },
});
