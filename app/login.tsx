/**
 * ============================================================================
 * app/login.tsx — Login Screen
 * ============================================================================
 *
 * Premium dark-mode login screen for FlavorDash.
 * Uses reqres.in mock API for JWT authentication.
 *
 * Valid test credentials (reqres.in):
 *   Email: eve.holt@reqres.in
 *   Password: cityslicka (or any non-empty string)
 *
 * ============================================================================
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";

// ─────────────────────────────────────────────────────────────────────────────
// § Constants & Theme
// ─────────────────────────────────────────────────────────────────────────────

const ORANGE = "#f97316";
const ORANGE_LIGHT = "#fb923c";
const ORANGE_DIM = "rgba(249, 115, 22, 0.15)";
const BG_PRIMARY = "#0f0f0f";
const BG_CARD = "#1a1a1a";
const BG_INPUT = "#242424";
const TEXT_PRIMARY = "#f5f5f5";
const TEXT_SECONDARY = "#a3a3a3";
const TEXT_MUTED = "#737373";
const ERROR_RED = "#ef4444";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─────────────────────────────────────────────────────────────────────────────
// § Component
// ─────────────────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  /**
   * handleLogin — Validates input, calls AuthContext.login(), handles errors.
   */
  const handleLogin = async () => {
    // Reset error
    setErrorMsg(null);

    // Client-side validation
    if (!email.trim()) {
      setErrorMsg("Email tidak boleh kosong.");
      return;
    }
    if (!password.trim()) {
      setErrorMsg("Password tidak boleh kosong.");
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg("Format email tidak valid.");
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email.trim(), password);
      // On success, AuthContext updates isAuthenticated → index.tsx redirects
      router.replace("/(protected)/(tabs)/catalog");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login gagal. Coba lagi.";
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Brand Header ─────────────────────────────────────────────── */}
        <View style={styles.brandSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🍽️</Text>
          </View>
          <Text style={styles.brandName}>FlavorDash</Text>
          <Text style={styles.brandTagline}>
            Masuk untuk menjelajahi resep favorit Anda
          </Text>
        </View>

        {/* ── Login Card ───────────────────────────────────────────────── */}
        <View style={styles.loginCard}>
          <Text style={styles.cardTitle}>Login</Text>
          <View style={styles.titleAccent} />

          {/* Error Banner */}
          {errorMsg && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorEmoji}>⚠️</Text>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>📧</Text>
              <TextInput
                style={styles.textInput}
                placeholder="eve.holt@reqres.in"
                placeholderTextColor={TEXT_MUTED}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSubmitting}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Masukkan password"
                placeholderTextColor={TEXT_MUTED}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isSubmitting}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Text style={styles.eyeIcon}>
                  {showPassword ? "🙈" : "👁️"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginBtn, isSubmitting && styles.loginBtnDisabled]}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Masuk</Text>
            )}
          </TouchableOpacity>

          {/* Demo Credentials Hint */}
          <View style={styles.hintBox}>
            <Text style={styles.hintTitle}>💡 Demo Credentials</Text>
            <Text style={styles.hintText}>
              Email: eve.holt@reqres.in
            </Text>
            <Text style={styles.hintText}>Password: cityslicka</Text>
          </View>
        </View>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Secured with JWT Authentication
          </Text>
          <Text style={styles.footerSub}>UAS Pemrograman Mobile • FlavorDash</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// § Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG_PRIMARY,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: "6%",
    paddingVertical: 40,
  },

  // ── Brand ──────────────────────────────────────────────────────────────
  brandSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: ORANGE_DIM,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "rgba(249, 115, 22, 0.3)",
  },
  logoEmoji: {
    fontSize: 40,
  },
  brandName: {
    fontSize: 34,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },

  // ── Login Card ─────────────────────────────────────────────────────────
  loginCard: {
    backgroundColor: BG_CARD,
    borderRadius: 20,
    padding: 24,
    borderTopWidth: 3,
    borderTopColor: ORANGE,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  titleAccent: {
    width: 40,
    height: 3,
    backgroundColor: ORANGE,
    borderRadius: 2,
    marginBottom: 24,
  },

  // ── Error ──────────────────────────────────────────────────────────────
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorEmoji: {
    fontSize: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: ERROR_RED,
    lineHeight: 18,
  },

  // ── Input ──────────────────────────────────────────────────────────────
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_SECONDARY,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG_INPUT,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  inputIcon: {
    fontSize: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: TEXT_PRIMARY,
    height: "100%",
  },
  eyeBtn: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 18,
  },

  // ── Button ─────────────────────────────────────────────────────────────
  loginBtn: {
    backgroundColor: ORANGE,
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    elevation: 4,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },

  // ── Hint Box ───────────────────────────────────────────────────────────
  hintBox: {
    marginTop: 20,
    backgroundColor: ORANGE_DIM,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.2)",
  },
  hintTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: ORANGE_LIGHT,
    marginBottom: 6,
  },
  hintText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    lineHeight: 18,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },

  // ── Footer ─────────────────────────────────────────────────────────────
  footer: {
    alignItems: "center",
    marginTop: 32,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: TEXT_MUTED,
    letterSpacing: 0.5,
  },
  footerSub: {
    fontSize: 11,
    color: "rgba(115, 115, 115, 0.6)",
  },
});
