// app/index.tsx
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, Button, FlatList, RefreshControl, SafeAreaView,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import LogForm from "../components/LogForm";
import ReportPanel from "../components/ReportPanel";
import { createLog, deleteLog, fetchClimbs, listLogs, runReport, updateLog } from "../lib/api";

export default function Index() {
  // Data
  const [climbs, setClimbs] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);

  // Filters
  const [minGrade, setMinGrade] = useState("0");
  const [maxGrade, setMaxGrade] = useState("10");
  const [sort, setSort] = useState<"asc" | "desc">("desc");

  // UI state
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  // Loaders
  const loadClimbs = useCallback(async () => {
    try {
      const data = await fetchClimbs();
      setClimbs(data);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to load climbs.");
    }
  }, []);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listLogs({
        min_grade: Number(minGrade),
        max_grade: Number(maxGrade),
        sort,
      });
      setLogs(data);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to load logs.");
    } finally {
      setLoading(false);
    }
  }, [minGrade, maxGrade, sort]);

  const loadInitial = useCallback(async () => {
    try {
      await Promise.all([loadClimbs(), loadLogs()]);
    } finally {
      setInitializing(false);
    }
  }, [loadClimbs, loadLogs]);

  const loadReport = useCallback(async () => {
    try {
      const data = await runReport({
        min_grade: Number(minGrade),
        max_grade: Number(maxGrade),
      });
      setReport(data);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to load report.");
    }
  }, [minGrade, maxGrade]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  // Actions
  const openNew = () => {
    setEditing(null);
    setModalVisible(true);
  };

  const openEdit = (log: any) => {
    setEditing({
      id: log.id,
      climb: log.climb,
      date: log.date,
      attempts: log.attempts,
      sent: log.sent,
      note: log.note || "",
    });
    setModalVisible(true);
  };

  const onSubmit = async (payload: any, id?: number | null) => {
    try {
      if (id) await updateLog(id, payload);
      else await createLog(payload);
      setModalVisible(false);
      await loadLogs();
    } catch (e: any) {
      Alert.alert(
        "Save failed",
        e?.response?.data ? JSON.stringify(e.response.data) : (e?.message ?? "Unknown error")
      );
    }
  };

  const onDelete = async (id: number) => {
    try {
      await deleteLog(id);
      await loadLogs();
    } catch (e: any) {
      Alert.alert("Delete failed", e?.message ?? "Unknown error");
    }
  };

  const toggleSort = () => setSort((s) => (s === "asc" ? "desc" : "asc"));

  // UI: Row renderer
  const renderItem = ({ item }: { item: any }) => (
    <View
      style={{
        padding: 12,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#eee",
        borderRadius: 10,
        marginBottom: 10,
      }}
    >
      <Text style={{ fontWeight: "bold", color: "#111" }}>
        {item.climb_detail?.name} ({item.climb_detail?.grade_label})
      </Text>
      <Text style={{ color: "#111" }}>Date: {item.date}</Text>
      <Text style={{ color: "#111" }}>Attempts: {item.attempts}</Text>
      <Text style={{ color: "#111" }}>Sent: {item.sent ? "Yes" : "No"}</Text>
      {item.note ? <Text style={{ color: "#111" }}>Note: {item.note}</Text> : null}

      <View style={{ flexDirection: "row", marginTop: 8 }}>
        <View style={{ marginRight: 8 }}>
          <Button title="Edit" onPress={() => openEdit(item)} />
        </View>
        <Button title="Delete" color="#b00020" onPress={() => onDelete(item.id)} />
      </View>
    </View>
  );

  // Initial splash
  if (initializing) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: "#111" }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12, color: "#111" }}>Climb Logs</Text>

        {/* Filters */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
          <Text style={{ color: "#111" }}>Min grade:</Text>
          <TextInput
            value={minGrade}
            onChangeText={setMinGrade}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor="#777"
            style={{
              color: "#111",
              borderWidth: 1,
              borderColor: "#ccc",
              padding: 6,
              borderRadius: 6,
              width: 50,
              backgroundColor: "#fff",
            }}
          />
          <Text style={{ color: "#111" }}>Max grade:</Text>
          <TextInput
            value={maxGrade}
            onChangeText={setMaxGrade}
            keyboardType="number-pad"
            placeholder="10"
            placeholderTextColor="#777"
            style={{
              color: "#111",
              borderWidth: 1,
              borderColor: "#ccc",
              padding: 6,
              borderRadius: 6,
              width: 50,
              backgroundColor: "#fff",
            }}
          />
          <TouchableOpacity
            onPress={toggleSort}
            style={{ padding: 8, borderWidth: 1, borderColor: "#ccc", borderRadius: 6, backgroundColor: "#fff" }}
          >
            <Text style={{ color: "#111" }}>Sort: {sort}</Text>
          </TouchableOpacity>
          <Button title="Apply" onPress={loadLogs} />
        </View>

        {/* Report */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <Button title="Run Report" onPress={loadReport} />
        </View>
        <ReportPanel data={report} />

        {/* Empty state */}
        {logs.length === 0 ? (
          <View style={{ padding: 16, backgroundColor: "#fff", borderWidth: 1, borderColor: "#eee", borderRadius: 10, marginBottom: 10 }}>
            <Text style={{ color: "#111" }}>No logs yet. Tap “New Log” to add your first entry.</Text>
          </View>
        ) : null}

        {/* List */}
        <FlatList
          data={logs}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadLogs} />}
        />

        <View style={{ height: 10 }} />
        <Button title="New Log" onPress={openNew} />

        <LogForm
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={onSubmit}
          climbs={climbs}
          initial={editing}
        />
      </View>
    </SafeAreaView>
  );
}
