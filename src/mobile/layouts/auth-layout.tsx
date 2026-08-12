import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors, Spacing, Radius, FontSize } from "@/mobile/theme/colors"
import { Button, Card } from "@/mobile/components/ui"

interface AuthLayoutProps {
  onSignIn: () => void
}

export function AuthLayout({ onSignIn }: AuthLayoutProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password")
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    onSignIn()
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    setLoading(false)
    onSignIn()
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={require("../../../assets/favicon.png")} style={styles.logoIcon} />
            <Text style={styles.logoText}>Intentéo</Text>
          </View>
          <Text style={styles.tagline}>Live with intention</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.welcomeSub}>Sign in to continue your journey</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <Button title={loading ? "Signing in..." : "Sign In"} onPress={handleSignIn} variant="primary" disabled={loading} />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button title="Continue with Google" onPress={handleDemoLogin} variant="outline" icon="logo-google" />
          <Button title="Continue with Apple" onPress={handleDemoLogin} variant="outline" icon="logo-apple" style={{ marginTop: Spacing.sm }} />

          <TouchableOpacity onPress={handleDemoLogin} style={styles.demoBtn}>
            <Ionicons name="play-circle" size={18} color={Colors.accent} />
            <Text style={styles.demoText}>Try Demo Account</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, justifyContent: "center", padding: Spacing.xl },
  header: { alignItems: "center", marginBottom: Spacing.xxxl },
  logoContainer: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  logoIcon: { width: 48, height: 48, borderRadius: 10 },
  logoText: { fontSize: 40, fontWeight: "800", color: Colors.primary },
  tagline: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.sm },
  card: { padding: Spacing.xxl },
  welcomeText: { fontSize: FontSize.xl, fontWeight: "700", color: Colors.text, textAlign: "center" },
  welcomeSub: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: "center", marginTop: Spacing.xs, marginBottom: Spacing.xl },
  inputGroup: { marginBottom: Spacing.lg },
  label: { fontSize: FontSize.sm, fontWeight: "600", color: Colors.text, marginBottom: Spacing.xs },
  input: {
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  passwordRow: { flexDirection: "row", alignItems: "center" },
  eyeBtn: { padding: Spacing.md, marginLeft: Spacing.xs },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: Spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { marginHorizontal: Spacing.md, color: Colors.textMuted, fontSize: FontSize.xs },
  demoBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: Spacing.lg, paddingVertical: Spacing.sm },
  demoText: { fontSize: FontSize.sm, color: Colors.accent, fontWeight: "600", marginLeft: Spacing.sm },
})
