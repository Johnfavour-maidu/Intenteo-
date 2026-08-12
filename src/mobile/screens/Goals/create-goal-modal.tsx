import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors, Spacing, Radius, FontSize } from "../../theme/colors"
import { saveJSON, loadJSON, STORAGE_KEYS } from "../../lib/storage"
import type { Goal } from "../../types"

interface Props {
  visible: boolean
  onClose: () => void
  onSave: () => void
}

const CATEGORIES = ["Personal", "Career", "Health", "Finance", "Relationships", "Learning", "Spiritual", "Custom"]

export function CreateGoalModal({ visible, onClose, onSave }: Props) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Personal")
  const [deadline, setDeadline] = useState("")

  const handleSave = async () => {
    if (!title.trim()) return
    const today = new Date().toISOString().split("T")[0]
    const goal: Goal = {
      id: `goal-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      progress: 0,
      deadline: deadline || new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
      status: "active",
      createdAt: today,
      updatedAt: today,
      lastActivity: today,
    }
    const existing = await loadJSON<Goal[]>(STORAGE_KEYS.GOALS, [])
    await saveJSON(STORAGE_KEYS.GOALS, [...existing, goal])
    setTitle("")
    setDescription("")
    setCategory("Personal")
    setDeadline("")
    onSave()
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>New Goal</Text>
          <TouchableOpacity onPress={handleSave}><Text style={styles.saveText}>Save</Text></TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Goal Name *</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="What do you want to achieve?" placeholderTextColor={Colors.textMuted} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Describe your goal in detail" placeholderTextColor={Colors.textMuted} multiline numberOfLines={3} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.chipRow}>
              {CATEGORIES.map(c => (
                <TouchableOpacity key={c} onPress={() => setCategory(c)} style={[styles.chip, category === c && styles.chipActive]}>
                  <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Deadline (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} value={deadline} onChangeText={setDeadline} placeholder="2026-12-31" placeholderTextColor={Colors.textMuted} keyboardType="numbers-and-punctuation" />
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
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  chipTextActive: { color: Colors.textInverse },
})
