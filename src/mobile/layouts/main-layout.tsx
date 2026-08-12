import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
import { Colors, FontSize } from "@/mobile/theme/colors"

import { TodayScreen } from "@/mobile/screens/Today/today"
import { TasksScreen } from "@/mobile/screens/Tasks/tasks"
import { HabitsScreen } from "@/mobile/screens/Habits/habits"
import { MobileJournal } from "@/mobile/screens/Journal/journal"
import { GoalsScreen } from "@/mobile/screens/Goals/goals"
import { MoreScreen } from "@/mobile/screens/More/more"

const Tab = createBottomTabNavigator()

export type MainTabParamList = {
  Today: undefined
  Tasks: undefined
  Habits: undefined
  Journal: undefined
  Goals: undefined
  More: undefined
}

export function MainLayout() {
  return (
    <Tab.Navigator
      id="MainTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home"
          switch (route.name) {
            case "Today": iconName = focused ? "home" : "home-outline"; break
            case "Tasks": iconName = focused ? "checkmark-circle" : "checkmark-circle-outline"; break
            case "Habits": iconName = focused ? "compass" : "compass-outline"; break
            case "Journal": iconName = focused ? "book" : "book-outline"; break
            case "Goals": iconName = focused ? "flag" : "flag-outline"; break
            case "More": iconName = focused ? "menu" : "menu-outline"; break
          }
          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: FontSize.xs, fontWeight: "500" },
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          paddingBottom: 4,
          height: 60,
        },
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Habits" component={HabitsScreen} />
      <Tab.Screen name="Journal" component={MobileJournal} />
      <Tab.Screen name="Goals" component={GoalsScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  )
}
