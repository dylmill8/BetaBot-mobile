// app/logs.tsx - Logs Screen
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator, Alert, FlatList, RefreshControl, SafeAreaView,
    StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import ConfirmModal from "../components/ConfirmModal";
import LogForm from "../components/LogForm";
import { createLog, deleteLog, fetchClimbs, listLogs, updateLog } from "../lib/api";

export default function LogsScreen() {
  const [climbs, setClimbs] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ visible: boolean; id: number | null }>({ visible: false, id: null });
  const [initialized, setInitialized] = useState(false);
  
  // Actual filter values used in API call
  const [minGrade, setMinGrade] = useState("0");
  const [maxGrade, setMaxGrade] = useState("17");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  
  // Input field values (separate from actual filters)
  const [minGradeInput, setMinGradeInput] = useState("0");
  const [maxGradeInput, setMaxGradeInput] = useState("17");
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        min_grade: Number(minGrade),
        max_grade: Number(maxGrade),
        sort,
      };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const [climbsData, logsData] = await Promise.all([
        fetchClimbs(),
        listLogs(params),
      ]);
      setClimbs(climbsData);
      setLogs(logsData);
      
      // Set intelligent date defaults on first load
      if (!initialized && logsData.length > 0) {
        const dates = logsData.map((log: any) => log.date).sort();
        const earliest = dates[0];
        const today = new Date().toISOString().split('T')[0];
        setStartDate(earliest);
        setEndDate(today);
        setStartDateInput(earliest);
        setEndDateInput(today);
        setInitialized(true);
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [minGrade, maxGrade, startDate, endDate, sort, initialized]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const applyFilters = useCallback(() => {
    setMinGrade(minGradeInput);
    setMaxGrade(maxGradeInput);
    setStartDate(startDateInput);
    setEndDate(endDateInput);
    // Filters will trigger loadData via useEffect dependency
  }, [minGradeInput, maxGradeInput, startDateInput, endDateInput]);

  const openNew = () => {
    setEditing(null);
    setModalVisible(true);
  };

  const openEdit = useCallback((log: any) => {
    setEditing({
      id: log.id,
      climb: log.climb,
      date: log.date,
      attempts: log.attempts,
      sent: log.sent,
      note: log.note || "",
    });
    setModalVisible(true);
  }, []);

  const onSubmit = async (payload: any, id?: number | null) => {
    try {
      if (id) await updateLog(id, payload);
      else await createLog(payload);
      setModalVisible(false);
      await loadData();
    } catch (e: any) {
      Alert.alert(
        "Save failed",
        e?.response?.data ? JSON.stringify(e.response.data) : (e?.message ?? "Unknown error")
      );
    }
  };

  const onDelete = useCallback((id: number) => {
    setConfirmDelete({ visible: true, id });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    const id = confirmDelete.id;
    setConfirmDelete({ visible: false, id: null });
    
    if (id) {
      try {
        await deleteLog(id);
        await loadData();
      } catch (e: any) {
        Alert.alert("Delete failed", e?.message ?? "Unknown error");
      }
    }
  }, [confirmDelete.id, loadData]);

  const handleCancelDelete = useCallback(() => {
    setConfirmDelete({ visible: false, id: null });
  }, []);

  const renderLog = useCallback(({ item }: { item: any }) => {
    const gradeColor = getGradeColor(item.climb_detail?.grade_index || 0);
    
    const handleEdit = () => {
      console.log('Edit button pressed for log:', item.id);
      openEdit(item);
    };
    
    const handleDelete = () => {
      console.log('Delete button pressed for log:', item.id);
      onDelete(item.id);
    };
    
    return (
      <View style={styles.logCard}>
        <View style={styles.logHeader}>
          <View style={styles.logInfo}>
            <Text style={styles.climbName}>{item.climb_detail?.name}</Text>
            <View style={[styles.gradeBadge, { backgroundColor: gradeColor }]}>
              <Text style={styles.gradeText}>{item.climb_detail?.grade_label}</Text>
            </View>
          </View>
          <Text style={styles.date}>{item.date}</Text>
        </View>

        <View style={styles.logStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Attempts</Text>
            <Text style={styles.statValue}>{item.attempts}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Status</Text>
            <View style={[styles.statusBadge, item.sent ? styles.sentBadge : styles.projectBadge]}>
              <Text style={styles.statusText}>{item.sent ? "✓ Sent" : "Project"}</Text>
            </View>
          </View>
        </View>

        {item.note ? (
          <View style={styles.noteContainer}>
            <Text style={styles.noteLabel}>Note:</Text>
            <Text style={styles.noteText}>{item.note}</Text>
          </View>
        ) : null}

        <View style={styles.logActions}>
          <TouchableOpacity 
            activeOpacity={0.7}
            style={styles.editButton} 
            onPress={handleEdit}
          >
            <Text style={styles.editButtonText}>✏️ Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            activeOpacity={0.7}
            style={styles.deleteButton} 
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>🗑️ DELETE</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [onDelete, openEdit]);

  const filterHeader = useMemo(() => (
    <View style={styles.filterContainer}>
      <TouchableOpacity 
        style={styles.filterHeader}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Text style={styles.filterTitle}>{showFilters ? "▼" : "▶"} Filters</Text>
      </TouchableOpacity>
      
      {showFilters && (
        <View style={styles.filterContent}>
          <View style={styles.filterRow}>
            <View style={styles.filterInput}>
              <Text style={styles.filterLabel}>Min Grade (0-17)</Text>
              <TextInput
                value={minGradeInput}
                onChangeText={setMinGradeInput}
                keyboardType="number-pad"
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            <View style={styles.filterInput}>
              <Text style={styles.filterLabel}>Max Grade (0-17)</Text>
              <TextInput
                value={maxGradeInput}
                onChangeText={setMaxGradeInput}
                keyboardType="number-pad"
                style={styles.input}
                placeholder="17"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <View style={styles.filterRow}>
            <View style={styles.filterInput}>
              <Text style={styles.filterLabel}>Start Date (YYYY-MM-DD)</Text>
              <TextInput
                value={startDateInput}
                onChangeText={setStartDateInput}
                style={styles.input}
                placeholder={startDate || "First log date"}
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            <View style={styles.filterInput}>
              <Text style={styles.filterLabel}>End Date (YYYY-MM-DD)</Text>
              <TextInput
                value={endDateInput}
                onChangeText={setEndDateInput}
                style={styles.input}
                placeholder={endDate || "Today"}
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <View style={styles.filterActions}>
            <TouchableOpacity 
              style={styles.sortButton}
              onPress={() => setSort(s => s === "asc" ? "desc" : "asc")}
            >
              <Text style={styles.sortText}>{sort === "asc" ? "↑" : "↓"} Date</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  ), [showFilters, minGradeInput, maxGradeInput, startDateInput, endDateInput, sort, applyFilters]);

  if (loading && logs.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={logs}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderLog}
        ListHeaderComponent={filterHeader}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} colors={["#6366f1"]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>No logs yet</Text>
            <Text style={styles.emptyText}>Tap the + button to log your first climb!</Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={openNew}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <ConfirmModal
        visible={confirmDelete.visible}
        title="Delete Log"
        message="Are you sure you want to delete this log?"
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <LogForm
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={onSubmit}
        climbs={climbs}
        initial={editing}
      />
    </SafeAreaView>
  );
}

function getGradeColor(gradeIndex: number): string {
  if (gradeIndex <= 2) return "#10b981";
  if (gradeIndex <= 5) return "#3b82f6";
  if (gradeIndex <= 8) return "#f59e0b";
  if (gradeIndex <= 11) return "#ef4444";
  return "#7c3aed";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  filterContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  filterHeader: {
    padding: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  filterActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  filterInput: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: "#111827",
  },
  sortButton: {
    backgroundColor: "#6366f1",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  sortText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  applyButton: {
    backgroundColor: "#6366f1",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    flex: 2,
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  logCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  logInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  climbName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gradeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  date: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  logStats: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 12,
  },
  statItem: {
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  sentBadge: {
    backgroundColor: "#d1fae5",
  },
  projectBadge: {
    backgroundColor: "#fef3c7",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  noteContainer: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: "#111827",
    lineHeight: 20,
  },
  logActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#6366f1",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6366f1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
