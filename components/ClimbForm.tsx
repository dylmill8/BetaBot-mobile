import React, { useEffect, useState } from "react";
import { Alert, Button, Modal, ScrollView, Text, TextInput, View } from "react-native";

type ClimbInit = { id?: number; name?: string; grade_label?: string; grade_index?: number; location?: string };

const GRADES = [
  { label: "V0", index: 0 },
  { label: "V1", index: 1 },
  { label: "V2", index: 2 },
  { label: "V3", index: 3 },
  { label: "V4", index: 4 },
  { label: "V5", index: 5 },
  { label: "V6", index: 6 },
  { label: "V7", index: 7 },
  { label: "V8", index: 8 },
  { label: "V9", index: 9 },
  { label: "V10", index: 10 },
  { label: "V11", index: 11 },
  { label: "V12", index: 12 },
  { label: "V13", index: 13 },
  { label: "V14", index: 14 },
  { label: "V15", index: 15 },
  { label: "V16", index: 16 },
  { label: "V17", index: 17 },
];

export default function ClimbForm({
  visible,
  onClose,
  onSubmit,
  initial,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string; grade_label: string; grade_index: number; location?: string }, id?: number | null) => void;
  initial?: ClimbInit | null;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [gradeIndex, setGradeIndex] = useState(initial?.grade_index ?? 0);
  const [location, setLocation] = useState(initial?.location ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(initial?.name ?? "");
    setGradeIndex(initial?.grade_index ?? 0);
    setLocation(initial?.location ?? "");
  }, [initial, visible]);

  const submit = async () => {
    if (!name.trim()) return Alert.alert("Missing field", "Please enter a climb name.");
    
    const grade = GRADES.find(g => g.index === gradeIndex);
    if (!grade) return Alert.alert("Invalid grade", "Please select a valid grade.");

    setSaving(true);
    try {
      const payload: any = { 
        name: name.trim(), 
        grade_label: grade.label, 
        grade_index: grade.index,
        owner_id: 1,  // Demo user ID
      };
      
      // Only include location if it's not empty
      if (location.trim()) {
        payload.location = location.trim();
      }
      
      await onSubmit(payload, initial?.id ?? null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: "#fff" }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#111" }}>
          {initial?.id ? "Edit Climb" : "New Climb"}
        </Text>

        <Text style={{ fontWeight: "bold", marginTop: 8, color: "#111" }}>Climb Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g., Moon Arete"
          placeholderTextColor="#777"
          style={{ 
            color: "#111", 
            borderWidth: 1, 
            borderColor: "#ccc", 
            padding: 10, 
            borderRadius: 8, 
            marginTop: 4, 
            backgroundColor: "#fff" 
          }}
        />

        <Text style={{ fontWeight: "bold", marginTop: 12, color: "#111" }}>Grade</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {GRADES.map((grade) => (
              <Button
                key={grade.index}
                title={grade.label}
                onPress={() => setGradeIndex(grade.index)}
                color={gradeIndex === grade.index ? "#007AFF" : "#999"}
              />
            ))}
          </View>
        </ScrollView>
        <Text style={{ marginTop: 4, color: "#666", fontSize: 12 }}>
          Selected: {GRADES.find(g => g.index === gradeIndex)?.label ?? "V0"}
        </Text>

        <Text style={{ fontWeight: "bold", marginTop: 12, color: "#111" }}>Location (optional)</Text>
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="e.g., Kilter Board, Home Wall"
          placeholderTextColor="#777"
          style={{ 
            color: "#111", 
            borderWidth: 1, 
            borderColor: "#ccc", 
            padding: 10, 
            borderRadius: 8, 
            marginTop: 4, 
            backgroundColor: "#fff" 
          }}
        />

        <View style={{ height: 20 }} />
        <Button title={saving ? "Saving..." : "Save"} onPress={submit} disabled={saving} />
        <View style={{ height: 8 }} />
        <Button title="Cancel" color="#999" onPress={onClose} />
      </ScrollView>
    </Modal>
  );
}
