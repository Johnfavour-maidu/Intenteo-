import React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { AuthLayout } from "@/mobile/layouts/auth-layout"
import { MainLayout } from "@/mobile/layouts/main-layout"

export type RootStackParamList = {
  SignIn: undefined
  Main: undefined
}

export type MainTabParamList = {
  Today: undefined
  Tasks: undefined
  Habits: undefined
  Journal: undefined
  Goals: undefined
  More: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export function MobileNavigator() {
  const [isSignedIn, setIsSignedIn] = React.useState(false)

  return (
    <NavigationContainer>
      <Stack.Navigator id="RootStack" screenOptions={{ headerShown: false }}>
        {!isSignedIn ? (
          <Stack.Screen name="SignIn">
            {() => <AuthLayout onSignIn={() => setIsSignedIn(true)} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Main" component={MainLayout} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
