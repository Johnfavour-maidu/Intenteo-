import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors, Spacing, Radius, FontSize } from "../../theme/colors"
import { saveJSON, loadJSON, STORAGE_KEYS } from "../../lib/storage"
import type { JournalEntry } from "../../types"

interface Props {
  visible: boolean
  onClose: () => void
  onSave: () => void
}

const MOODS = ["😊", "😐", "😢", "😤", "😴", "🥰", "😰", "🤔"]
const TYPES = [
  { value: "daily", label: "Daily", icon: "document-text" },
  { value: "gratitude", label: "Gratitude", icon: "heart" },
  { value: "reflection", label: "Reflection", icon: "bulb" },
] as const

export function CreateJournalModal({ visible, onClose, onSave }: Props) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [type, setType] = useState<"daily" | "gratitude" | "reflection">("daily")
  const [mood, setMood] = useState("")
  const [tags, setTags] = useState("")

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return
    const today = new Date().toISOString().split("T")[0]
    const entry: JournalEntry = {
      id: `journal-${Date.now()}`,
      title: title.trim() || "Untitled Entry",
      content: content.trim(),
      date: today,
      type,
      mood: mood || undefined,
      tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const existing = await loadJSON<JournalEntry[]>(STORAGE_KEYS.JOURNAL, [])
    await saveJSON(STORAGE_KEYS.JOURNAL, [...existing, entry])
    setTitle("")
    setContent("")
    setType("daily")
    setMood("")
    setTags("")
    onSave()
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>New Entry</Text>
          <TouchableOpacity onPress={handleSave}><Text style={styles.saveText}>Save</Text></TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.typeRow}>
              {TYPES.map(t => (
                <TouchableOpacity key={t.value} onPress={() => setType(t.value)} style={[styles.typeBtn, type === t.value && styles.typeBtnActive]}>
                  <Ionicons name={t.icon as any} size={16} color={type === t.value ? Colors.textInverse : Colors.primary} />
                  <Text style={[styles.typeText, type === t.value && styles.typeTextActive]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mood</Text>
            <View style={styles.emojiRow}>
              {MOODS.map(m => (
                <TouchableOpacity key={m} onPress={() => setMood(mood === m ? "" : m)} style={[styles.emojiBtn, mood === m && styles.emojiBtnActive]}>
                  <Text style={styles.emojiText}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Give your entry a title" placeholderTextColor={Colors.textMuted} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Write</Text>
            <TextInput style={[styles.input, styles.textArea]} value={content} onChangeText={setContent} placeholder="What's on your mind?" placeholderTextColor={Colors.textMuted} multiline textAlignVertical="top" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags (comma separated)</Text>
            <TextInput style={styles.input} value={tags} onChangeText={setTags} placeholder="e.g. grateful, growth, family" placeholderTextColor={Colors.textMuted} />
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
  textArea: { minHeight: 160 },
  typeRow: { flexDirection: "row", gap: Spacing.sm },
  typeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.xs, paddingVertical: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  typeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: "500" },
  typeTextActive: { color: Colors.textInverse },
  emojiRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  emojiBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.inputBg, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.border },
  emojiBtnActive: { backgroundColor: Colors.primarySoft, borderColor: Colors.primary },
  emojiText: { fontSize: 20 },
})
