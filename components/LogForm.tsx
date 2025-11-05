import React, { useEffect, useState } from "react";
import { Alert, Button, Modal, ScrollView, Switch, Text, TextInput, View } from "react-native";
import ClimbPicker from "./ClimbPicker";

type LogInit = { id?: number; climb?: number; date?: string; attempts?: number; sent?: boolean; note?: string };

const today = () => new Date().toISOString().slice(0, 10);
const isValidDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

export default function LogForm({
  visible,
  onClose,
  onSubmit,
  climbs,
  initial,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: { climb: number; date: string; attempts: number; sent: boolean; note?: string }, id?: number | null) => void;
  climbs: { id: number; name: string; grade_label: string }[];
  initial?: LogInit | null;
}) {
  const [climb, setClimb] = useState<number | null>(initial?.climb ?? null);
  const [date, setDate] = useState(initial?.date ?? today());
  const [attempts, setAttempts] = useState(String(initial?.attempts ?? 1));
  const [sent, setSent] = useState(Boolean(initial?.sent ?? false));
  const [note, setNote] = useState(initial?.note ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setClimb(initial?.climb ?? null);
    setDate(initial?.date ?? today());
    setAttempts(String(initial?.attempts ?? 1));
    setSent(Boolean(initial?.sent ?? false));
    setNote(initial?.note ?? "");
  }, [initial, visible]);

  const submit = async () => {
    if (!climb) return Alert.alert("Missing field", "Please select a climb.");
    if (!isValidDate(date)) return Alert.alert("Invalid date", "Use YYYY-MM-DD format.");
    const n = Number(attempts);
    if (!Number.isFinite(n) || n < 1) return Alert.alert("Invalid attempts", "Attempts must be a positive integer.");

    setSaving(true);
    try {
      await onSubmit({ climb, date, attempts: n, sent, note }, initial?.id ?? null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: "#fff" }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#111" }}>
          {initial?.id ? "Edit Log" : "New Log"}
        </Text>

        <ClimbPicker climbs={climbs} value={climb} onChange={setClimb} />

        <Text style={{ fontWeight: "bold", marginTop: 8, color: "#111" }}>Date (YYYY-MM-DD)</Text>
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#777"
          autoCapitalize="none"
          autoCorrect={false}
          style={{ color: "#111", borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8, marginTop: 4, backgroundColor: "#fff" }}
        />

        <Text style={{ fontWeight: "bold", marginTop: 8, color: "#111" }}>Attempts</Text>
        <TextInput
          value={attempts}
          onChangeText={setAttempts}
          keyboardType="number-pad"
          placeholder="1"
          placeholderTextColor="#777"
          style={{ color: "#111", borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8, marginTop: 4, backgroundColor: "#fff" }}
        />

        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
          <Text style={{ fontWeight: "bold", marginRight: 8, color: "#111" }}>Sent</Text>
          <Switch value={sent} onValueChange={setSent} />
        </View>

        <Text style={{ fontWeight: "bold", marginTop: 8, color: "#111" }}>Note</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Optional note"
          placeholderTextColor="#777"
          multiline
          style={{
            color: "#111",
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 10,
            borderRadius: 8,
            marginTop: 4,
            minHeight: 80,
            backgroundColor: "#fff",
          }}
        />

        <View style={{ height: 12 }} />
        <Button title={saving ? "Saving..." : "Save"} onPress={submit} disabled={saving} />
        <View style={{ height: 8 }} />
        <Button title="Cancel" color="#999" onPress={onClose} />
      </ScrollView>
    </Modal>
  );
}
