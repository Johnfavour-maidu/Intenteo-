import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Colors } from "../../theme/colors"

export function MoreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>More</Text>
      <Text style={styles.subtitle}>Settings and more</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 8 },
})
