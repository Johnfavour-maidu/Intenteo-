import React, { useState, useEffect, useCallback } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors, Spacing, Radius, FontSize, Shadow } from "../../theme/colors"
import { Card, EmptyState, ScreenHeader } from "../../components/ui"
import { loadJSON, saveJSON, STORAGE_KEYS } from "../../lib/storage"
import { CreateHabitModal } from "./create-habit-modal"
import type { Habit } from "../../types"

export function HabitsScreen() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const today = new Date().toISOString().split("T")[0]

  const loadData = useCallback(async () => {
    const all = await loadJSON<Habit[]>(STORAGE_KEYS.HABITS, [])
    setHabits(all.filter(h => !h.paused))
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const toggleHabit = async (id: string) => {
    const updated = habits.map(h => {
      if (h.id !== id) return h
      const wasCompleted = h.completions[today]?.completed
      const newCompletions = { ...h.completions }
      if (wasCompleted) {
        delete newCompletions[today]
      } else {
        newCompletions[today] = { completed: true, time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) }
      }
      const streak = calcStreak(newCompletions)
      return { ...h, completions: newCompletions, streak, bestStreak: Math.max(h.bestStreak, streak) }
    })
    setHabits(updated)
    await saveJSON(STORAGE_KEYS.HABITS, updated)
  }

  const totalCompleted = habits.filter(h => h.completions[today]?.completed).length

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Habits"
        subtitle={`${totalCompleted}/${habits.length} completed today`}
      />

      <FlatList
        data={habits}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="compass-outline"
            title="No habits yet"
            description="Start building your identity through consistent action"
          />
        }
        renderItem={({ item }) => {
          const done = item.completions[today]?.completed
          const last7 = getLast7Days()
          return (
            <Card style={styles.habitCard}>
              <View style={styles.habitHeader}>
                <Text style={styles.habitEmoji}>{item.emoji || "🎯"}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.habitName}>{item.name}</Text>
                  <View style={styles.habitMeta}>
                    <Ionicons name="flame" size={12} color={Colors.streak} />
                    <Text style={styles.habitStreak}>{item.streak} day streak</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => toggleHabit(item.id)} style={[styles.checkBtn, done && styles.checkBtnDone]}>
                  {done && <Ionicons name="checkmark" size={20} color={Colors.textInverse} />}
                </TouchableOpacity>
              </View>

              {/* Week view */}
              <View style={styles.weekRow}>
                {last7.map(day => {
                  const completed = item.completions[day.date]?.completed
                  const isToday = day.date === today
                  return (
                    <View key={day.date} style={styles.dayCol}>
                      <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>{day.label}</Text>
                      <View style={[styles.dayDot, completed && styles.dayDotCompleted, isToday && !completed && styles.dayDotToday]} />
                    </View>
                  )
                })}
              </View>

              <View style={styles.habitStats}>
                <Text style={styles.habitStat}>Best: {item.bestStreak}d</Text>
                <Text style={styles.habitStat}>Rate: {item.completionRate}%</Text>
              </View>
            </Card>
          )
        }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowCreate(true)}>
        <Ionicons name="add" size={28} color={Colors.textInverse} />
      </TouchableOpacity>

      <CreateHabitModal visible={showCreate} onClose={() => setShowCreate(false)} onSave={loadData} />
    </View>
  )
}

function calcStreak(completions: Record<string, { completed?: boolean }>): number {
  const sorted = Object.keys(completions).filter(k => completions[k].completed).sort().reverse()
  if (sorted.length === 0) return 0
  let streak = 0
  const today = new Date().toISOString().split("T")[0]
  for (let i = 0; i < sorted.length; i++) {
    const expected = new Date()
    expected.setDate(expected.getDate() - i)
    const expectedISO = expected.toISOString().split("T")[0]
    if (sorted[i] === expectedISO) streak++
    else break
  }
  return streak
}

function getLast7Days() {
  const days = []
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({ date: d.toISOString().split("T")[0], label: dayNames[d.getDay()] })
  }
  return days
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.xl },
  list: { paddingBottom: 100 },
  habitCard: { marginBottom: Spacing.md },
  habitHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  habitEmoji: { fontSize: 28 },
  habitName: { fontSize: FontSize.md, fontWeight: "600", color: Colors.text },
  habitMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  habitStreak: { fontSize: FontSize.xs, color: Colors.streak, fontWeight: "500" },
  checkBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  checkBtnDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  weekRow: { flexDirection: "row", justifyContent: "space-between", marginTop: Spacing.lg, paddingHorizontal: Spacing.sm },
  dayCol: { alignItems: "center", gap: 6 },
  dayLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  dayLabelToday: { color: Colors.primary, fontWeight: "600" },
  dayDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.border },
  dayDotCompleted: { backgroundColor: Colors.success },
  dayDotToday: { borderWidth: 1.5, borderColor: Colors.primary },
  habitStats: { flexDirection: "row", justifyContent: "space-around", marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border },
  habitStat: { fontSize: FontSize.xs, color: Colors.textSecondary },
  fab: { position: "absolute", bottom: 30, right: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center", ...Shadow.lg },
})
