import React, { useState, useEffect, useCallback } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors, Spacing, Radius, FontSize, Shadow } from "../../theme/colors"
import { Card, EmptyState, ScreenHeader } from "../../components/ui"
import { loadJSON, STORAGE_KEYS } from "../../lib/storage"
import { CreateGoalModal } from "./create-goal-modal"
import type { Goal } from "../../types"

export function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")
  const [showCreate, setShowCreate] = useState(false)

  const loadData = useCallback(async () => {
    const all = await loadJSON<Goal[]>(STORAGE_KEYS.GOALS, [])
    setGoals(all)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const filtered = goals.filter(g => {
    if (filter === "active") return g.status === "active"
    if (filter === "completed") return g.status === "completed"
    return true
  })

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Goals"
        subtitle="Your life vision in action"
      />

      <View style={styles.filterRow}>
        {(["all", "active", "completed"] as const).map(f => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.filterBtn, filter === f && styles.filterBtnActive]}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="flag-outline"
            title="No goals yet"
            description="Set meaningful goals to align with your life vision"
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <View style={styles.goalTitleRow}>
                <Text style={styles.goalTitle} numberOfLines={1}>{item.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: item.status === "completed" ? Colors.success + "20" : Colors.primarySoft }]}>
                  <Text style={[styles.statusText, { color: item.status === "completed" ? Colors.success : Colors.primary }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>

            {item.description && (
              <Text style={styles.goalDescription} numberOfLines={2}>{item.description}</Text>
            )}

            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(item.progress, 100)}%` }]} />
              </View>
              <Text style={styles.progressText}>{item.progress}%</Text>
            </View>

            {/* Milestones */}
            {item.milestones && item.milestones.length > 0 && (
              <View style={styles.milestonesSection}>
                <Text style={styles.milestonesLabel}>Milestones</Text>
                <View style={styles.milestonesRow}>
                  {item.milestones.slice(0, 4).map(m => (
                    <View key={m.id} style={[styles.milestoneDot, m.completed && styles.milestoneDotDone]}>
                      {m.completed && <Ionicons name="checkmark" size={10} color={Colors.textInverse} />}
                    </View>
                  ))}
                  {item.milestones.length > 4 && (
                    <Text style={styles.milestoneMore}>+{item.milestones.length - 4}</Text>
                  )}
                </View>
              </View>
            )}

            {/* Footer */}
            <View style={styles.goalFooter}>
              <Text style={styles.deadline}>
                <Ionicons name="calendar-outline" size={12} color={Colors.textMuted} /> {item.deadline}
              </Text>
            </View>
          </Card>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowCreate(true)}>
        <Ionicons name="add" size={28} color={Colors.textInverse} />
      </TouchableOpacity>

      <CreateGoalModal visible={showCreate} onClose={() => setShowCreate(false)} onSave={loadData} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.xl },
  filterRow: { flexDirection: "row", marginBottom: Spacing.lg, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 3 },
  filterBtn: { flex: 1, paddingVertical: Spacing.sm, alignItems: "center", borderRadius: Radius.sm },
  filterBtnActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: FontSize.sm, fontWeight: "500", color: Colors.textSecondary },
  filterTextActive: { color: Colors.textInverse },
  list: { paddingBottom: 100 },
  goalCard: { marginBottom: Spacing.md },
  goalHeader: { marginBottom: Spacing.sm },
  goalTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  goalTitle: { fontSize: FontSize.lg, fontWeight: "600", color: Colors.text, flex: 1 },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.sm },
  statusText: { fontSize: FontSize.xs, fontWeight: "600", textTransform: "capitalize" },
  goalDescription: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md, lineHeight: 18 },
  progressContainer: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  progressBar: { flex: 1, height: 8, backgroundColor: Colors.primarySoft, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: Colors.primary, borderRadius: 4 },
  progressText: { fontSize: FontSize.sm, fontWeight: "600", color: Colors.primary, minWidth: 35, textAlign: "right" },
  milestonesSection: { marginTop: Spacing.md },
  milestonesLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: Spacing.sm },
  milestonesRow: { flexDirection: "row", gap: Spacing.sm, alignItems: "center" },
  milestoneDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  milestoneDotDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  milestoneMore: { fontSize: FontSize.xs, color: Colors.textMuted },
  goalFooter: { marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border },
  deadline: { fontSize: FontSize.xs, color: Colors.textMuted },
  fab: { position: "absolute", bottom: 30, right: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center", ...Shadow.lg },
})
