import React, { useState, useEffect, useCallback } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors, Spacing, Radius, FontSize } from "../../theme/colors"
import { Card, EmptyState, ScreenHeader, Toggle } from "../../components/ui"
import { loadJSON, saveJSON, STORAGE_KEYS } from "../../lib/storage"

interface NotificationItem {
  id: string
  title: string
  body: string
  type: "task" | "habit" | "journal" | "goal" | "system"
  read: boolean
  createdAt: string
}

interface NotificationSettings {
  taskReminders: boolean
  habitReminders: boolean
  journalPrompts: boolean
  dailyIntention: boolean
}

const DEFAULT_SETTINGS: NotificationSettings = {
  taskReminders: true,
  habitReminders: true,
  journalPrompts: true,
  dailyIntention: true,
}

export function MobileNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS)
  const [showSettings, setShowSettings] = useState(false)

  const loadData = useCallback(async () => {
    const saved = await loadJSON<NotificationItem[]>("intenteo-notifications", [])
    if (saved.length === 0) {
      const defaults: NotificationItem[] = [
        { id: "welcome", title: "Welcome to Inteénteo", body: "Start your journey of intentional living today.", type: "system", read: false, createdAt: new Date().toISOString() },
        { id: "habit-tip", title: "Build Your First Habit", body: "Consistency is key. Start with one small habit today.", type: "habit", read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: "journal-prompt", title: "Journal Prompt", body: "What are you most grateful for right now?", type: "journal", read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
      ]
      setNotifications(defaults)
    } else {
      setNotifications(saved.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    }

    const savedSettings = await loadJSON<Partial<NotificationSettings>>("intenteo-notif-settings", {})
    setSettings({ ...DEFAULT_SETTINGS, ...savedSettings })
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const markAsRead = async (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n)
    setNotifications(updated)
    await saveJSON("intenteo-notifications", updated)
  }

  const markAllRead = async () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    setNotifications(updated)
    await saveJSON("intenteo-notifications", updated)
  }

  const clearAll = async () => {
    setNotifications([])
    await saveJSON("intenteo-notifications", [])
  }

  const updateSetting = async <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    await saveJSON("intenteo-notif-settings", updated)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const getTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case "task": return "checkmark-circle"
      case "habit": return "compass"
      case "journal": return "book"
      case "goal": return "flag"
      default: return "notifications"
    }
  }

  const getTypeColor = (type: string): string => {
    switch (type) {
      case "task": return Colors.priorityProgress
      case "habit": return Colors.success
      case "journal": return Colors.accent
      case "goal": return Colors.primary
      default: return Colors.textSecondary
    }
  }

  const formatTime = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return "Just now"
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days === 1) return "Yesterday"
    return `${days}d ago`
  }

  if (showSettings) {
    return (
      <View style={styles.container}>
        <ScreenHeader
          title="Notification Settings"
          right={
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          }
        />
        <Card style={styles.settingsCard}>
          <Toggle
            label="Task Reminders"
            description="Get reminded about upcoming tasks"
            value={settings.taskReminders}
            onValueChange={v => updateSetting("taskReminders", v)}
          />
          <View style={styles.divider} />
          <Toggle
            label="Habit Reminders"
            description="Daily habit completion reminders"
            value={settings.habitReminders}
            onValueChange={v => updateSetting("habitReminders", v)}
          />
          <View style={styles.divider} />
          <Toggle
            label="Journal Prompts"
            description="Reflection and journaling reminders"
            value={settings.journalPrompts}
            onValueChange={v => updateSetting("journalPrompts", v)}
          />
          <View style={styles.divider} />
          <Toggle
            label="Daily Intention"
            description="Morning intention reminder"
            value={settings.dailyIntention}
            onValueChange={v => updateSetting("dailyIntention", v)}
          />
        </Card>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
        right={
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllRead} style={styles.headerBtn}>
                <Ionicons name="checkmark-done" size={20} color={Colors.primary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.headerBtn}>
              <Ionicons name="settings-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        }
      />

      {notifications.length > 0 && (
        <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title="No notifications"
            description="You're all caught up! Check back later."
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => markAsRead(item.id)}>
            <Card style={[styles.notifCard, !item.read && styles.notifCardUnread]}>
              <View style={styles.notifRow}>
                <View style={[styles.notifIcon, { backgroundColor: getTypeColor(item.type) + "15" }]}>
                  <Ionicons name={getTypeIcon(item.type)} size={20} color={getTypeColor(item.type)} />
                </View>
                <View style={styles.notifContent}>
                  <View style={styles.notifHeader}>
                    <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    {!item.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
                  <Text style={styles.notifTime}>{formatTime(item.createdAt)}</Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.xl },
  headerActions: { flexDirection: "row", gap: Spacing.sm },
  headerBtn: { padding: Spacing.xs },
  clearBtn: { alignSelf: "flex-end", marginBottom: Spacing.sm },
  clearText: { fontSize: FontSize.sm, color: Colors.error, fontWeight: "500" },
  list: { paddingBottom: 100 },
  notifCard: { marginBottom: Spacing.sm },
  notifCardUnread: { borderLeftWidth: 3, borderLeftColor: Colors.primary },
  notifRow: { flexDirection: "row", gap: Spacing.md },
  notifIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  notifContent: { flex: 1 },
  notifHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  notifTitle: { fontSize: FontSize.md, fontWeight: "500", color: Colors.text, flex: 1 },
  notifTitleUnread: { fontWeight: "600" },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  notifBody: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4, lineHeight: 18 },
  notifTime: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4 },
  settingsCard: { padding: Spacing.lg },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.xs },
})
