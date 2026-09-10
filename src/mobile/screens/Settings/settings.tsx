import React, { useState, useEffect, useCallback } from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors, Spacing, Radius, FontSize } from "../../theme/colors"
import { Card, Toggle, ScreenHeader } from "../../components/ui"
import { loadJSON, saveJSON, STORAGE_KEYS } from "../../lib/storage"

interface Settings {
  completionSound: boolean
  carryTasksForward: boolean
  enableDailyReview: boolean
  showIntentScore: boolean
  showStreakCelebrations: boolean
  keyboardShortcuts: boolean
  theme: "light" | "dark" | "system"
}

const DEFAULT_SETTINGS: Settings = {
  completionSound: true,
  carryTasksForward: false,
  enableDailyReview: true,
  showIntentScore: true,
  showStreakCelebrations: true,
  keyboardShortcuts: true,
  theme: "light",
}

export function MobileSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [profile, setProfile] = useState({ name: "", email: "", username: "" })

  const loadData = useCallback(async () => {
    const saved = await loadJSON<Partial<Settings>>(STORAGE_KEYS.SETTINGS, {})
    setSettings({ ...DEFAULT_SETTINGS, ...saved })
    const p = await loadJSON<typeof profile>(STORAGE_KEYS.PROFILE, { name: "", email: "", username: "" })
    setProfile(p)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const updateSetting = async <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    await saveJSON(STORAGE_KEYS.SETTINGS, updated)
  }

  const resetDefaults = () => {
    Alert.alert("Reset Settings", "Reset all settings to defaults?", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: async () => {
        setSettings(DEFAULT_SETTINGS)
        await saveJSON(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
      }}
    ])
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader title="Settings" subtitle="Customize your Intentéo experience" />

      {/* Profile */}
      <Text style={styles.sectionTitle}>Profile</Text>
      <Card style={styles.card}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.profileName}>{profile.name || "Not set"}</Text>
            <Text style={styles.profileEmail}>{profile.email || "Not set"}</Text>
          </View>
        </View>
      </Card>

      {/* Focus & Productivity */}
      <Text style={styles.sectionTitle}>Focus & Productivity</Text>
      <Card style={styles.card}>
        <Toggle
          label="Play Completion Sound"
          description="Play a subtle sound on task/habit completion"
          value={settings.completionSound}
          onValueChange={v => updateSetting("completionSound", v)}
        />
        <View style={styles.divider} />
        <Toggle
          label="Carry Tasks Forward"
          description="Move incomplete tasks to the next day"
          value={settings.carryTasksForward}
          onValueChange={v => updateSetting("carryTasksForward", v)}
        />
        <View style={styles.divider} />
        <Toggle
          label="Enable Daily Review"
          description="Show end-of-day review prompt"
          value={settings.enableDailyReview}
          onValueChange={v => updateSetting("enableDailyReview", v)}
        />
        <View style={styles.divider} />
        <Toggle
          label="Show Intent Score"
          description="Display your daily Intent Score"
          value={settings.showIntentScore}
          onValueChange={v => updateSetting("showIntentScore", v)}
        />
        <View style={styles.divider} />
        <Toggle
          label="Streak Celebrations"
          description="Celebrate streak milestones"
          value={settings.showStreakCelebrations}
          onValueChange={v => updateSetting("showStreakCelebrations", v)}
        />
      </Card>

      {/* Appearance */}
      <Text style={styles.sectionTitle}>Appearance</Text>
      <Card style={styles.card}>
        <Text style={styles.settingLabel}>Theme</Text>
        <View style={styles.themeRow}>
          {(["light", "dark", "system"] as const).map(t => (
            <TouchableOpacity key={t} onPress={() => updateSetting("theme", t)} style={[styles.themeBtn, settings.theme === t && styles.themeBtnActive]}>
              <Ionicons name={t === "light" ? "sunny" : t === "dark" ? "moon" : "phone-portrait"} size={18} color={settings.theme === t ? Colors.textInverse : Colors.textSecondary} />
              <Text style={[styles.themeText, settings.theme === t && styles.themeTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Notifications */}
      <Text style={styles.sectionTitle}>Notifications</Text>
      <Card style={styles.card}>
        {[
          { label: "Task Reminders", desc: "Get reminded about upcoming tasks", icon: "checkmark-circle" },
          { label: "Habit Reminders", desc: "Daily habit completion reminders", icon: "target" },
          { label: "Journal Prompts", desc: "Reflection and journaling reminders", icon: "book" },
          { label: "Daily Intention", desc: "Morning intention reminder", icon: "compass" },
        ].map((item, i) => (
          <View key={i}>
            <View style={styles.notifRow}>
              <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.notifLabel}>{item.label}</Text>
                <Text style={styles.notifDesc}>{item.desc}</Text>
              </View>
              <View style={[styles.notifDot, { backgroundColor: Colors.success }]} />
            </View>
            {i < 3 && <View style={styles.divider} />}
          </View>
        ))}
      </Card>

      {/* Data */}
      <Text style={styles.sectionTitle}>Data</Text>
      <Card style={styles.card}>
        <TouchableOpacity style={styles.dataRow}>
          <Ionicons name="download-outline" size={20} color={Colors.primary} />
          <Text style={styles.dataLabel}>Export Data</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.dataRow}>
          <Ionicons name="cloud-upload-outline" size={20} color={Colors.primary} />
          <Text style={styles.dataLabel}>Import from Web</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.dataRow} onPress={resetDefaults}>
          <Ionicons name="refresh-outline" size={20} color={Colors.error} />
          <Text style={[styles.dataLabel, { color: Colors.error }]}>Reset to Defaults</Text>
        </TouchableOpacity>
      </Card>

      {/* About */}
      <Text style={styles.sectionTitle}>About</Text>
      <Card style={styles.card}>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Build</Text>
          <Text style={styles.aboutValue}>1</Text>
        </View>
      </Card>

      <View style={{ height: 60 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, paddingBottom: 100 },
  sectionTitle: { fontSize: FontSize.xs, fontWeight: "600", color: Colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: Spacing.sm, marginTop: Spacing.lg, marginLeft: Spacing.xs },
  card: { padding: Spacing.lg },
  profileRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primarySoft, alignItems: "center", justifyContent: "center" },
  profileName: { fontSize: FontSize.lg, fontWeight: "600", color: Colors.text },
  profileEmail: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.xs },
  settingLabel: { fontSize: FontSize.sm, fontWeight: "600", color: Colors.text, marginBottom: Spacing.sm },
  themeRow: { flexDirection: "row", gap: Spacing.sm },
  themeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.xs, paddingVertical: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.border },
  themeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  themeText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: "500" },
  themeTextActive: { color: Colors.textInverse },
  notifRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md, paddingVertical: Spacing.sm },
  notifLabel: { fontSize: FontSize.md, fontWeight: "500", color: Colors.text },
  notifDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  notifDot: { width: 8, height: 8, borderRadius: 4 },
  dataRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md, paddingVertical: Spacing.sm },
  dataLabel: { flex: 1, fontSize: FontSize.md, fontWeight: "500", color: Colors.text },
  aboutRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: Spacing.sm },
  aboutLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  aboutValue: { fontSize: FontSize.md, fontWeight: "500", color: Colors.text },
})
