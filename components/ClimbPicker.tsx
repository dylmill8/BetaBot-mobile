import React from "react";
import { Pressable, Text, View } from "react-native";

export default function ClimbPicker({
  climbs,
  value,
  onChange,
}: {
  climbs: { id: number; name: string; grade_label: string }[];
  value: number | null;
  onChange: (id: number) => void;
}) {
  if (!climbs || climbs.length === 0) return <Text style={{ marginVertical: 8, color: "#111" }}>Loading climbs…</Text>;

  return (
    <View style={{ marginVertical: 8 }}>
      <Text style={{ fontWeight: "bold", marginBottom: 6, color: "#111" }}>Climb</Text>
      <View style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, overflow: "hidden", backgroundColor: "#fff" }}>
        {climbs.map((c, i) => (
          <Pressable
            key={c.id}
            onPress={() => onChange(c.id)}
            style={{
              padding: 12,
              backgroundColor: value === c.id ? "#e8f0fe" : "#fff",
              borderBottomWidth: i === climbs.length - 1 ? 0 : 1,
              borderBottomColor: "#eee",
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: value === c.id }}
          >
            <Text style={{ color: "#111" }}>
              {c.name} ({c.grade_label})
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
