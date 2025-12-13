// app/index.tsx - Climbs Screen
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator, Alert, FlatList, RefreshControl, SafeAreaView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import ClimbForm from "../components/ClimbForm";
import ConfirmModal from "../components/ConfirmModal";
import { createClimb, deleteClimb, fetchClimbs, updateClimb } from "../lib/api";

export default function ClimbsScreen() {
  const [climbs, setClimbs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ visible: boolean; id: number | null }>({ visible: false, id: null });
  
  // Actual filter values used in API call
  const [minGrade, setMinGrade] = useState("0");
  const [maxGrade, setMaxGrade] = useState("17");
  const [sort, setSort] = useState<"asc" | "desc">("asc");
  
  // Input field values (separate from actual filters)
  const [minGradeInput, setMinGradeInput] = useState("0");
  const [maxGradeInput, setMaxGradeInput] = useState("17");

  const loadClimbs = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        min_grade: Number(minGrade),
        max_grade: Number(maxGrade),
        sort,
      };
      const data = await fetchClimbs(params);
      setClimbs(data);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to load climbs.");
    } finally {
      setLoading(false);
    }
  }, [minGrade, maxGrade, sort]);

  useEffect(() => {
    loadClimbs();
  }, [loadClimbs]);

  const applyFilters = useCallback(() => {
    setMinGrade(minGradeInput);
    setMaxGrade(maxGradeInput);
  }, [minGradeInput, maxGradeInput]);

  const openNew = () => {
    setEditing(null);
    setModalVisible(true);
  };

  const onSubmit = async (payload: any, id?: number | null) => {
    try {
      if (id) await updateClimb(id, payload);
      else await createClimb(payload);
      setModalVisible(false);
      await loadClimbs();
    } catch (e: any) {
      const errorMsg = e?.response?.data 
        ? JSON.stringify(e.response.data, null, 2)
        : (e?.message ?? "Unknown error");
      Alert.alert("Save failed", errorMsg);
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
        await deleteClimb(id);
        await loadClimbs();
      } catch (e: any) {
        const msg = e?.response?.status === 400 || e?.response?.status === 409
          ? "Cannot delete climb - logs are referencing it"
          : (e?.message ?? "Unknown error");
        Alert.alert("Delete failed", msg);
      }
    }
  }, [confirmDelete.id, loadClimbs]);

  const handleCancelDelete = useCallback(() => {
    setConfirmDelete({ visible: false, id: null });
  }, []);

  const openEdit = useCallback((climb: any) => {
    setEditing({
      id: climb.id,
      name: climb.name,
      grade_label: climb.grade_label,
      grade_index: climb.grade_index,
      location: climb.location || "",
    });
    setModalVisible(true);
  }, []);

  const renderClimb = useCallback(({ item }: { item: any }) => {
    const gradeColor = getGradeColor(item.grade_index);
    
    const handleEdit = () => {
      console.log('Edit button pressed for item:', item.id);
      openEdit(item);
    };
    
    const handleDelete = () => {
      console.log('Delete button pressed for item:', item.id);
      onDelete(item.id);
    };
    
    return (
      <View style={styles.climbCard}>
        <View style={styles.climbHeader}>
          <View style={styles.climbInfo}>
            <Text style={styles.climbName}>{item.name}</Text>
            {item.location ? (
              <Text style={styles.climbLocation}>📍 {item.location}</Text>
            ) : null}
            <View style={styles.metaInfo}>
              <Text style={styles.metaText}>By {item.owner?.display_name || "Unknown"}</Text>
              <Text style={styles.metaText}> • </Text>
              <Text style={styles.metaText}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
          </View>
          <View style={[styles.gradeBadge, { backgroundColor: gradeColor }]}>
            <Text style={styles.gradeText}>{item.grade_label}</Text>
          </View>
        </View>
        
        <View style={styles.climbStats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.total_ascents || 0}</Text>
            <Text style={styles.statLabel}>Ascents</Text>
          </View>
        </View>

        <View style={styles.climbActions}>
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

          <View style={styles.filterActions}>
            <TouchableOpacity 
              style={styles.sortButton}
              onPress={() => setSort(s => s === "asc" ? "desc" : "asc")}
            >
              <Text style={styles.sortText}>{sort === "asc" ? "↑" : "↓"} Grade</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  ), [showFilters, minGradeInput, maxGradeInput, sort, applyFilters]);

  if (loading && climbs.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={climbs}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderClimb}
        ListHeaderComponent={filterHeader}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadClimbs} colors={["#6366f1"]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🧗</Text>
            <Text style={styles.emptyTitle}>No climbs yet</Text>
            <Text style={styles.emptyText}>Tap the + button to add your first climb!</Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={openNew}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <ConfirmModal
        visible={confirmDelete.visible}
        title="Delete Climb"
        message="Are you sure you want to delete this climb? This will fail if logs reference it."
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <ClimbForm
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={onSubmit}
        initial={editing}
      />
    </SafeAreaView>
  );
}

// Helper function for grade colors
function getGradeColor(gradeIndex: number): string {
  if (gradeIndex <= 2) return "#10b981"; // Green for V0-V2
  if (gradeIndex <= 5) return "#3b82f6"; // Blue for V3-V5
  if (gradeIndex <= 8) return "#f59e0b"; // Orange for V6-V8
  if (gradeIndex <= 11) return "#ef4444"; // Red for V9-V11
  return "#7c3aed"; // Purple for V12+
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
  climbCard: {
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
  climbHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  climbInfo: {
    flex: 1,
    marginRight: 12,
  },
  climbName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  climbLocation: {
    fontSize: 14,
    color: "#6b7280",
  },
  gradeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  gradeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  climbStats: {
    flexDirection: "row",
    marginBottom: 12,
  },
  stat: {
    alignItems: "center",
    marginRight: 24,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#6366f1",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  climbActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  editButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#6b7280",
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
