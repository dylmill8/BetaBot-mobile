import React from "react";
import { Text, View } from "react-native";

export default function ReportPanel({ data }: { data: any }) {
  if (!data) return null;
  return (
    <View style={{ padding: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd", borderRadius: 8, marginVertical: 12 }}>
      <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 6, color: "#111" }}>Report</Text>
      <Text style={{ color: "#111" }}>Total logs: {data.count ?? 0}</Text>
      <Text style={{ color: "#111" }}>Avg attempts: {data.avg_attempts ? Number(data.avg_attempts).toFixed(2) : "0.00"}</Text>
      <Text style={{ color: "#111" }}>Best grade index: {data.best_grade_index ?? "-"}</Text>
      <View style={{ height: 8 }} />
      <Text style={{ fontWeight: "bold", color: "#111" }}>By grade</Text>
      {(data.by_grade || []).map((g: any) => (
        <Text key={g.climb__grade_label} style={{ color: "#111" }}>
          {g.climb__grade_label}: {g.n}
        </Text>
      ))}
    </View>
  );
}
