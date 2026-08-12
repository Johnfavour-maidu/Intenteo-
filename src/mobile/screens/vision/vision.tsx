import React, { useState, useEffect, useCallback } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors, Spacing, Radius, FontSize, Shadow } from "../../theme/colors"
import { Card, EmptyState, ScreenHeader } from "../../components/ui"
import { loadJSON, STORAGE_KEYS } from "../../lib/storage"
import type { Vision } from "../../types"

export function MobileVision() {
  const [visions, setVisions] = useState<Vision[]>([])
  const [selectedVision, setSelectedVision] = useState<Vision | null>(null)

  const loadData = useCallback(async () => {
    const all = await loadJSON<Vision[]>(STORAGE_KEYS.VISIONS, [])
    setVisions(all)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  if (selectedVision) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => setSelectedVision(null)} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          <Text style={styles.backText}>Visions</Text>
        </TouchableOpacity>

        <Card style={styles.detailCard}>
          {selectedVision.heroImage && <View style={styles.heroPlaceholder}><Ionicons name="image" size={32} color={Colors.textMuted} /></View>}
          <Text style={styles.detailTitle}>{selectedVision.title}</Text>
          {selectedVision.description && <Text style={styles.detailDesc}>{selectedVision.description}</Text>}
          <View style={styles.detailMeta}>
            {selectedVision.lifeArea && (
              <View style={styles.metaTag}><Text style={styles.metaTagText}>{selectedVision.lifeArea}</Text></View>
            )}
            {selectedVision.timeHorizon && (
              <View style={styles.metaTag}><Text style={styles.metaTagText}>{selectedVision.timeHorizon}</Text></View>
            )}
          </View>
          <View style={styles.detailStatus}>
            <View style={[styles.statusDot, { backgroundColor: selectedVision.status === "active" ? Colors.success : Colors.textMuted }]} />
            <Text style={styles.statusText}>{selectedVision.status}</Text>
          </View>
        </Card>
      </ScrollView>
    )
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Visions" subtitle="Your future begins with clarity" />

      <FlatList
        data={visions}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="eye-outline"
            title="No visions yet"
            description="Create a vision to define the future you're intentionally building"
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.visionCard} onPress={() => setSelectedVision(item)}>
            <View style={styles.visionHeader}>
              <View style={styles.visionIcon}>
                <Ionicons name="eye" size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.visionTitle}>{item.title}</Text>
                {item.lifeArea && <Text style={styles.visionArea}>{item.lifeArea}</Text>}
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </View>
            {item.description && <Text style={styles.visionDesc} numberOfLines={2}>{item.description}</Text>}
            <View style={styles.visionFooter}>
              {item.timeHorizon && <Text style={styles.visionMeta}>{item.timeHorizon}</Text>}
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: item.status === "active" ? Colors.success : Colors.textMuted }]} />
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
          </Card>
        )}
      />

      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={28} color={Colors.textInverse} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl },
  list: { paddingBottom: 100 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginBottom: Spacing.xl },
  backText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: "500" },
  visionCard: { marginBottom: Spacing.md },
  visionHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  visionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primarySoft, alignItems: "center", justifyContent: "center" },
  visionTitle: { fontSize: FontSize.lg, fontWeight: "600", color: Colors.text },
  visionArea: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 2 },
  visionDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.md, lineHeight: 18 },
  visionFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border },
  visionMeta: { fontSize: FontSize.xs, color: Colors.textMuted },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: FontSize.xs, color: Colors.textSecondary, textTransform: "capitalize" },
  detailCard: { padding: Spacing.xl },
  heroPlaceholder: { height: 160, backgroundColor: Colors.primarySoft, borderRadius: Radius.md, alignItems: "center", justifyContent: "center", marginBottom: Spacing.lg },
  detailTitle: { fontSize: FontSize.xxl, fontWeight: "700", color: Colors.text },
  detailDesc: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.md, lineHeight: 22 },
  detailMeta: { flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.lg },
  metaTag: { backgroundColor: Colors.primarySoft, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.sm },
  metaTagText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: "500" },
  detailStatus: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginTop: Spacing.lg },
  fab: { position: "absolute", bottom: 30, right: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center", ...Shadow.lg },
})
