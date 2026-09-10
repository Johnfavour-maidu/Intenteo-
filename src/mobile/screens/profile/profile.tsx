import React, { useState, useEffect, useCallback } from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors, Spacing, Radius, FontSize, Shadow } from "../../theme/colors"
import { Card, StatCard, ScreenHeader } from "../../components/ui"
import { loadJSON, saveJSON, STORAGE_KEYS } from "../../lib/storage"
import type { UserProfile, Task, Habit, Goal, JournalEntry } from "../../types"

export function MobileProfile() {
  const [profile, setProfile] = useState<UserProfile>({ name: "", username: "", email: "" })
  const [editing, setEditing] = useState(false)
  const [stats, setStats] = useState({ tasks: 0, habits: 0, goals: 0, journal: 0, bestStreak: 0 })

  const loadData = useCallback(async () => {
    const p = await loadJSON<UserProfile>(STORAGE_KEYS.PROFILE, { name: "", username: "", email: "" })
    setProfile(p)

    const tasks = await loadJSON<Task[]>(STORAGE_KEYS.TASKS, [])
    const habits = await loadJSON<Habit[]>(STORAGE_KEYS.HABITS, [])
    const goals = await loadJSON<Goal[]>(STORAGE_KEYS.GOALS, [])
    const journal = await loadJSON<JournalEntry[]>(STORAGE_KEYS.JOURNAL, [])
    const bestStreak = habits.reduce((best, h) => Math.max(best, h.bestStreak || 0), 0)

    setStats({
      tasks: tasks.filter(t => t.completed).length,
      habits: habits.length,
      goals: goals.length,
      journal: journal.length,
      bestStreak,
    })
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleSave = async () => {
    await saveJSON(STORAGE_KEYS.PROFILE, profile)
    setEditing(false)
  }

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => {} },
    ])
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader title="Profile" subtitle="Your Intentéo identity" />

      {/* Avatar & Name */}
      <Card style={styles.profileCard}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={Colors.primary} />
          </View>
          {editing ? (
            <View style={styles.editFields}>
              <TextInput
                style={styles.input}
                value={profile.name}
                onChangeText={v => setProfile({ ...profile, name: v })}
                placeholder="Full Name"
                placeholderTextColor={Colors.textMuted}
              />
              <TextInput
                style={styles.input}
                value={profile.username}
                onChangeText={v => setProfile({ ...profile, username: v })}
                placeholder="Username"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                value={profile.email}
                onChangeText={v => setProfile({ ...profile, email: v })}
                placeholder="Email"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          ) : (
            <View style={styles.nameSection}>
              <Text style={styles.profileName}>{profile.name || "Not set"}</Text>
              {profile.username && <Text style={styles.profileUsername}>@{profile.username}</Text>}
              <Text style={styles.profileEmail}>{profile.email || "Not set"}</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => editing ? handleSave() : setEditing(true)}
            style={[styles.editBtn, editing && styles.editBtnActive]}
          >
            <Ionicons name={editing ? "checkmark" : "pencil"} size={16} color={editing ? Colors.textInverse : Colors.primary} />
            <Text style={[styles.editBtnText, editing && styles.editBtnTextActive]}>
              {editing ? "Save" : "Edit"}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Stats */}
      <Text style={styles.sectionTitle}>Your Progress</Text>
      <View style={styles.statsGrid}>
        <StatCard label="Tasks Done" value={stats.tasks} icon="checkmark-circle" />
        <StatCard label="Habits" value={stats.habits} icon="compass" />
        <StatCard label="Goals" value={stats.goals} icon="flag" />
        <StatCard label="Journal" value={stats.journal} icon="book" />
        <StatCard label="Best Streak" value={`${stats.bestStreak}d`} icon="flame" color={Colors.streak} />
      </View>

      {/* Menu */}
      <Text style={styles.sectionTitle}>Account</Text>
      <Card style={styles.menuCard}>
        {[
          { icon: "notifications-outline", label: "Notifications", desc: "Manage your reminders" },
          { icon: "lock-closed-outline", label: "Privacy & Security", desc: "Password and data settings" },
          { icon: "help-circle-outline", label: "Help & Support", desc: "Get help with Intentéo" },
          { icon: "information-circle-outline", label: "About", desc: "Version 1.0.0" },
        ].map((item, i, arr) => (
          <View key={i}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDesc}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
            {i < arr.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </Card>

      {/* Sign Out */}
      <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 60 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, paddingBottom: 100 },
  profileCard: { padding: Spacing.xl },
  avatarSection: { alignItems: "center" },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primarySoft, alignItems: "center", justifyContent: "center", marginBottom: Spacing.lg },
  nameSection: { alignItems: "center", marginBottom: Spacing.lg },
  profileName: { fontSize: FontSize.xl, fontWeight: "700", color: Colors.text },
  profileUsername: { fontSize: FontSize.sm, color: Colors.primary, marginTop: 2 },
  profileEmail: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  editFields: { width: "100%", marginBottom: Spacing.lg },
  input: { backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.inputBorder, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSize.md, color: Colors.text, marginBottom: Spacing.sm },
  editBtn: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.primary },
  editBtnActive: { backgroundColor: Colors.primary },
  editBtnText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: "600" },
  editBtnTextActive: { color: Colors.textInverse },
  sectionTitle: { fontSize: FontSize.xs, fontWeight: "600", color: Colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: Spacing.sm, marginTop: Spacing.lg, marginLeft: Spacing.xs },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  menuCard: { padding: 0 },
  menuItem: { flexDirection: "row", alignItems: "center", padding: Spacing.lg, gap: Spacing.md },
  menuIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primarySoft, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: FontSize.md, fontWeight: "500", color: Colors.text },
  menuDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: 68 },
  signOutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, marginTop: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.error + "30" },
  signOutText: { fontSize: FontSize.md, color: Colors.error, fontWeight: "600" },
})
