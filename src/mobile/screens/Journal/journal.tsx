import React, { useState, useEffect, useCallback } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors, Spacing, Radius, FontSize, Shadow } from "../../theme/colors"
import { Card, EmptyState, ScreenHeader } from "../../components/ui"
import { loadJSON, STORAGE_KEYS } from "../../lib/storage"
import type { JournalEntry } from "../../types"
import { CreateJournalModal } from "./create-journal-modal"

export function MobileJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [view, setView] = useState<"timeline" | "calendar">("timeline")
  const [showCreate, setShowCreate] = useState(false)

  const loadData = useCallback(async () => {
    const all = await loadJSON<JournalEntry[]>(STORAGE_KEYS.JOURNAL, [])
    setEntries(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const grouped = groupByDate(entries)

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Journal"
        subtitle={`${entries.length} entries`}
        right={
          <View style={styles.viewToggle}>
            <TouchableOpacity onPress={() => setView("timeline")} style={[styles.viewBtn, view === "timeline" && styles.viewBtnActive]}>
              <Ionicons name="list" size={18} color={view === "timeline" ? Colors.textInverse : Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setView("calendar")} style={[styles.viewBtn, view === "calendar" && styles.viewBtnActive]}>
              <Ionicons name="calendar" size={18} color={view === "calendar" ? Colors.textInverse : Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        }
      />

      <FlatList
        data={view === "timeline" ? Object.entries(grouped) : []}
        keyExtractor={item => item[0]}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="book-outline"
            title="No journal entries"
            description="Start writing to capture your thoughts and reflections"
          />
        }
        renderItem={({ item: [date, dayEntries] }) => (
          <View style={styles.dayGroup}>
            <Text style={styles.dayDate}>{formatDayDate(date)}</Text>
            {dayEntries.map(entry => (
              <Card key={entry.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryTypeBadge}>
                    <Ionicons name={getTypeIcon(entry.type)} size={14} color={Colors.primary} />
                    <Text style={styles.entryType}>{entry.type}</Text>
                  </View>
                  {entry.mood && <Text style={styles.entryMood}>{entry.mood}</Text>}
                </View>
                <Text style={styles.entryTitle} numberOfLines={1}>{entry.title}</Text>
                <Text style={styles.entryContent} numberOfLines={2}>{entry.content}</Text>
                {entry.tags && entry.tags.length > 0 && (
                  <View style={styles.tagsRow}>
                    {entry.tags.slice(0, 3).map(tag => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            ))}
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowCreate(true)}>
        <Ionicons name="add" size={28} color={Colors.textInverse} />
      </TouchableOpacity>

      <CreateJournalModal visible={showCreate} onClose={() => setShowCreate(false)} onSave={loadData} />
    </View>
  )
}

function groupByDate(entries: JournalEntry[]): Record<string, JournalEntry[]> {
  const groups: Record<string, JournalEntry[]> = {}
  entries.forEach(e => {
    const date = e.date || e.createdAt.split("T")[0]
    if (!groups[date]) groups[date] = []
    groups[date].push(e)
  })
  return groups
}

function formatDayDate(date: string): string {
  const d = new Date(date)
  const today = new Date().toISOString().split("T")[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
  if (date === today) return "Today"
  if (date === yesterday) return "Yesterday"
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
}

function getTypeIcon(type: string): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case "daily": return "document-text"
    case "gratitude": return "heart"
    case "reflection": return "bulb"
    case "legacy": return "ribbon"
    default: return "document-text"
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.xl },
  viewToggle: { flexDirection: "row", backgroundColor: Colors.primarySoft, borderRadius: Radius.sm, padding: 2 },
  viewBtn: { padding: Spacing.sm, borderRadius: Radius.sm },
  viewBtnActive: { backgroundColor: Colors.primary },
  list: { paddingBottom: 100 },
  dayGroup: { marginBottom: Spacing.lg },
  dayDate: { fontSize: FontSize.sm, fontWeight: "600", color: Colors.textSecondary, marginBottom: Spacing.sm, textTransform: "uppercase", letterSpacing: 0.5 },
  entryCard: { marginBottom: Spacing.sm },
  entryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.sm },
  entryTypeBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: Colors.primarySoft, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.sm },
  entryType: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: "500", textTransform: "capitalize" },
  entryMood: { fontSize: 20 },
  entryTitle: { fontSize: FontSize.md, fontWeight: "600", color: Colors.text, marginBottom: 4 },
  entryContent: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  tagsRow: { flexDirection: "row", gap: Spacing.xs, marginTop: Spacing.sm },
  tag: { backgroundColor: Colors.primarySoft, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.sm },
  tagText: { fontSize: FontSize.xs, color: Colors.primary },
  fab: { position: "absolute", bottom: 30, right: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center", ...Shadow.lg },
})
