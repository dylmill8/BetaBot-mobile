// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

/**
 * Single-screen stack with a white background.
 * We remove tabs entirely and use one index route.
 */
export default function RootLayout() {
  useEffect(() => {
    // Small nicety: on Android, set StatusBar style to dark-content via Expo component
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          // Force a light background everywhere
          contentStyle: { backgroundColor: "#fff" },
          headerStyle: { backgroundColor: "#fff" },
          headerTintColor: "#111",
          headerTitleStyle: { color: "#111", fontWeight: "600" },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Climb Logs",
          }}
        />
        {/* Keep not-found route support if you want */}
        <Stack.Screen name="+not-found" options={{ title: "Not found" }} />
      </Stack>
    </>
  );
}
