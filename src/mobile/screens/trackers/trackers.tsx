import React, { useState } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors, Spacing, Radius, FontSize } from "../../theme/colors"
import { Card, ScreenHeader } from "../../components/ui"

interface TrackerTemplate {
  id: string
  name: string
  icon: string
  color: string
  category: string
  description: string
  benefits: string[]
}

const TRACKER_TEMPLATES: TrackerTemplate[] = [
  { id: "meditation", name: "Meditation", icon: "leaf", color: "#22C55E", category: "Mindfulness", description: "Track your meditation practice and build inner calm", benefits: ["Reduced stress", "Better focus", "Emotional balance"] },
  { id: "reading", name: "Reading", icon: "book", color: "#3B82F6", category: "Learning", description: "Monitor your reading habits and grow through knowledge", benefits: ["Knowledge growth", "Better vocabulary", "Critical thinking"] },
  { id: "exercise", name: "Exercise", icon: "fitness", color: "#EF4444", category: "Health", description: "Log workouts and track your fitness journey", benefits: ["Stronger body", "More energy", "Better mood"] },
  { id: "water", name: "Water Intake", icon: "water", color: "#06B6D4", category: "Health", description: "Stay hydrated throughout the day", benefits: ["Better hydration", "Improved skin", "More energy"] },
  { id: "sleep", name: "Sleep", icon: "moon", color: "#8B5CF6", category: "Health", description: "Track sleep quality and duration", benefits: ["Better rest", "Improved focus", "Healthier body"] },
  { id: "mood", name: "Mood", icon: "happy", color: "#F59E0B", category: "Wellness", description: "Log your daily emotional state", benefits: ["Self-awareness", "Pattern recognition", "Emotional health"] },
  { id: "journal", name: "Journaling", icon: "pencil", color: "#EC4899", category: "Reflection", description: "Build a consistent writing practice", benefits: ["Clarity", "Self-reflection", "Creative expression"] },
  { id: "custom", name: "Custom Tracker", icon: "add-circle", color: "#1E0E6B", category: "Custom", description: "Create your own tracker for anything", benefits: ["Flexibility", "Personal growth", "Accountability"] },
]

export function MobileTrackers() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const categories = ["All", ...new Set(TRACKER_TEMPLATES.map(t => t.category))]

  const filtered = selectedCategory === "All"
    ? TRACKER_TEMPLATES
    : TRACKER_TEMPLATES.filter(t => t.category === selectedCategory)

  return (
    <View style={styles.container}>
      <ScreenHeader title="Browse Trackers" subtitle="Discover new ways to track your growth" />

      <FlatList
        data={categories}
        keyExtractor={item => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedCategory(item)} style={[styles.filterChip, selectedCategory === item && styles.filterChipActive]}>
            <Text style={[styles.filterText, selectedCategory === item && styles.filterTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.trackerCard}>
            <View style={styles.trackerHeader}>
              <View style={[styles.trackerIcon, { backgroundColor: item.color + "15" }]}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.trackerName}>{item.name}</Text>
                <Text style={styles.trackerCategory}>{item.category}</Text>
              </View>
            </View>
            <Text style={styles.trackerDesc}>{item.description}</Text>
            <View style={styles.benefitsRow}>
              {item.benefits.map((b, i) => (
                <View key={i} style={styles.benefitChip}>
                  <Ionicons name="checkmark-circle" size={12} color={item.color} />
                  <Text style={styles.benefitText}>{b}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: item.color + "10" }]}>
              <Ionicons name="add" size={18} color={item.color} />
              <Text style={[styles.addText, { color: item.color }]}>Add Tracker</Text>
            </TouchableOpacity>
          </Card>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.xl },
  filterRow: { paddingBottom: Spacing.lg, gap: Spacing.sm },
  filterChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: "500" },
  filterTextActive: { color: Colors.textInverse },
  list: { paddingBottom: 100 },
  trackerCard: { marginBottom: Spacing.md },
  trackerHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  trackerIcon: { width: 48, height: 48, borderRadius: Radius.lg, alignItems: "center", justifyContent: "center" },
  trackerName: { fontSize: FontSize.lg, fontWeight: "600", color: Colors.text },
  trackerCategory: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  trackerDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.md, lineHeight: 18 },
  benefitsRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginTop: Spacing.md },
  benefitChip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: Colors.inputBg, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.sm },
  benefitText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  addButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.xs, marginTop: Spacing.lg, paddingVertical: Spacing.md, borderRadius: Radius.md },
  addText: { fontSize: FontSize.sm, fontWeight: "600" },
})
