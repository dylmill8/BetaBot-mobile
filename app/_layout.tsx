// app/_layout.tsx
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, Text } from "react-native";

/**
 * Tab-based navigation layout with modern design
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerStyle: { 
            backgroundColor: "#6366f1",
            ...Platform.select({
              ios: { height: 100 },
            }),
          },
          headerTintColor: "#fff",
          headerTitleStyle: { 
            color: "#fff", 
            fontWeight: "700",
            fontSize: 20,
          },
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
            height: Platform.OS === "ios" ? 85 : 60,
            paddingBottom: Platform.OS === "ios" ? 20 : 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: "#6366f1",
          tabBarInactiveTintColor: "#9ca3af",
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Climbs",
            tabBarLabel: "Climbs",
            tabBarIcon: ({ color }) => <TabIcon name="🧗" color={color} />,
          }}
        />
        <Tabs.Screen
          name="logs"
          options={{
            title: "My Logs",
            tabBarLabel: "Logs",
            tabBarIcon: ({ color }) => <TabIcon name="📝" color={color} />,
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: "Statistics",
            tabBarLabel: "Stats",
            tabBarIcon: ({ color }) => <TabIcon name="📊" color={color} />,
          }}
        />
        <Tabs.Screen
          name="+not-found"
          options={{
            href: null, // Hide from tabs
          }}
        />
      </Tabs>
    </>
  );
}

// Simple emoji-based icon component
function TabIcon({ name, color }: { name: string; color: string }) {
  return <Text style={{ fontSize: 24, opacity: color === "#9ca3af" ? 0.5 : 1 }}>{name}</Text>;
}
