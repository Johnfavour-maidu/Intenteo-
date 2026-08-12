import React from "react"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { MobileNavigator } from "@/mobile/navigation"

export function MobileApp() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <MobileNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
