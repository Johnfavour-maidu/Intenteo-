import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors, Spacing, Radius, FontSize } from "../../theme/colors"
import { saveJSON, loadJSON, STORAGE_KEYS } from "../../lib/storage"
import type { Habit } from "../../types"

interface Props {
  visible: boolean
  onClose: () => void
  onSave: () => void
}

const EMOJIS = ["🎯", "💪", "📚", "🧘", "🏃", "💧", "😴", "✍️", "🎵", "🍎", "🧹", "💡"]
const CATEGORIES = ["Health", "Mindfulness", "Learning", "Productivity", "Wellness", "Custom"]

export function CreateHabitModal({ visible, onClose, onSave }: Props) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [emoji, setEmoji] = useState("🎯")
  const [category, setCategory] = useState("Custom")
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily")

  const handleSave = async () => {
    if (!name.trim()) return
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      emoji,
      category,
      frequency,
      completions: {},
      streak: 0,
      bestStreak: 0,
      completionRate: 0,
      paused: false,
      pinned: false,
      createdAt: new Date().toISOString(),
    }
    const existing = await loadJSON<Habit[]>(STORAGE_KEYS.HABITS, [])
    await saveJSON(STORAGE_KEYS.HABITS, [...existing, newHabit])
    setName("")
    setDescription("")
    setEmoji("🎯")
    setCategory("Custom")
    setFrequency("daily")
    onSave()
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>New Habit</Text>
          <TouchableOpacity onPress={handleSave}><Text style={styles.saveText}>Save</Text></TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Habit Name *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="What habit do you want to build?" placeholderTextColor={Colors.textMuted} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Emoji</Text>
            <View style={styles.emojiRow}>
              {EMOJIS.map(e => (
                <TouchableOpacity key={e} onPress={() => setEmoji(e)} style={[styles.emojiBtn, emoji === e && styles.emojiBtnActive]}>
                  <Text style={styles.emojiText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.emojiRow}>
              {CATEGORIES.map(c => (
                <TouchableOpacity key={c} onPress={() => setCategory(c)} style={[styles.catBtn, category === c && styles.catBtnActive]}>
                  <Text style={[styles.catText, category === c && styles.catTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Frequency</Text>
            <View style={styles.emojiRow}>
              {(["daily", "weekly"] as const).map(f => (
                <TouchableOpacity key={f} onPress={() => setFrequency(f)} style={[styles.catBtn, frequency === f && styles.catBtnActive]}>
                  <Text style={[styles.catText, frequency === f && styles.catTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Why is this habit important?" placeholderTextColor={Colors.textMuted} multiline numberOfLines={3} />
          </View>
        </ScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: FontSize.lg, fontWeight: "600", color: Colors.text },
  cancelText: { fontSize: FontSize.md, color: Colors.textSecondary },
  saveText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: "600" },
  content: { padding: Spacing.xl },
  inputGroup: { marginBottom: Spacing.xl },
  label: { fontSize: FontSize.sm, fontWeight: "600", color: Colors.text, marginBottom: Spacing.sm },
  input: { backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.inputBorder, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSize.md, color: Colors.text },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  emojiRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  emojiBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.inputBg, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.border },
  emojiBtnActive: { backgroundColor: Colors.primarySoft, borderColor: Colors.primary },
  emojiText: { fontSize: 20 },
  catBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.border },
  catBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  catTextActive: { color: Colors.textInverse },
})
