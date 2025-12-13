// app/stats.tsx - Statistics Screen
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator, Alert, RefreshControl, SafeAreaView, ScrollView,
    StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { runReport } from "../lib/api";

export default function StatsScreen() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  // Actual filter values used in API call
  const [minGrade, setMinGrade] = useState(0);
  const [maxGrade, setMaxGrade] = useState(17);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Input field values (separate from actual filters)
  const [minGradeInput, setMinGradeInput] = useState("0");
  const [maxGradeInput, setMaxGradeInput] = useState("17");
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        min_grade: minGrade,
        max_grade: maxGrade,
      };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const data = await runReport(params);
      setReport(data);
      
      // Set intelligent date defaults on first load
      if (!initialized && data.sample && data.sample.length > 0) {
        const dates = data.sample.map((log: any) => log.date).sort();
        const earliest = dates[0];
        const today = new Date().toISOString().split('T')[0];
        setStartDate(earliest);
        setEndDate(today);
        setStartDateInput(earliest);
        setEndDateInput(today);
        setInitialized(true);
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to load report.");
    } finally {
      setLoading(false);
    }
  }, [minGrade, maxGrade, startDate, endDate, initialized]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const applyFilters = () => {
    setMinGrade(parseInt(minGradeInput) || 0);
    setMaxGrade(parseInt(maxGradeInput) || 17);
    setStartDate(startDateInput);
    setEndDate(endDateInput);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  const bestGrade = report.best_grade_index !== null 
    ? `V${report.best_grade_index}` 
    : "N/A";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadReport} colors={["#6366f1"]} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Climbing Stats</Text>
          <Text style={styles.headerSubtitle}>Based on all your logged climbs</Text>
        </View>

        {/* Filters */}
        <View style={styles.filtersSection}>
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
                    style={styles.input}
                    value={minGradeInput}
                    onChangeText={setMinGradeInput}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={styles.filterInput}>
                  <Text style={styles.filterLabel}>Max Grade (0-17)</Text>
                  <TextInput
                    style={styles.input}
                    value={maxGradeInput}
                    onChangeText={setMaxGradeInput}
                    keyboardType="number-pad"
                    placeholder="17"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
              <View style={styles.filterRow}>
                <View style={styles.filterInput}>
                  <Text style={styles.filterLabel}>Start Date (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.input}
                    value={startDateInput}
                    onChangeText={setStartDateInput}
                    placeholder={startDate || "First log date"}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={styles.filterInput}>
                  <Text style={styles.filterLabel}>End Date (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.input}
                    value={endDateInput}
                    onChangeText={setEndDateInput}
                    placeholder={endDate || "Today"}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: "#ede9fe" }]}>
            <Text style={styles.metricValue}>{report.count || 0}</Text>
            <Text style={styles.metricLabel}>Total Logs</Text>
            <Text style={styles.metricIcon}>📝</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: "#dbeafe" }]}>
            <Text style={styles.metricValue}>
              {report.avg_attempts ? report.avg_attempts.toFixed(1) : "0"}
            </Text>
            <Text style={styles.metricLabel}>Avg Attempts</Text>
            <Text style={styles.metricIcon}>🎯</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: "#fef3c7" }]}>
            <Text style={styles.metricValue}>{bestGrade}</Text>
            <Text style={styles.metricLabel}>Best Grade</Text>
            <Text style={styles.metricIcon}>🏆</Text>
          </View>
        </View>

        {/* Grade Distribution */}
        {report.by_grade && report.by_grade.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sends by Grade</Text>
            <View style={styles.gradeList}>
              {report.by_grade.map((item: any, index: number) => {
                const gradeIndex = parseInt(item.climb__grade_label.substring(1));
                const color = getGradeColor(gradeIndex);
                const maxCount = Math.max(...report.by_grade.map((g: any) => g.n));
                const percentage = (item.n / maxCount) * 100;

                return (
                  <View key={index} style={styles.gradeRow}>
                    <View style={styles.gradeInfo}>
                      <View style={[styles.gradeLabel, { backgroundColor: color }]}>
                        <Text style={styles.gradeLabelText}>{item.climb__grade_label}</Text>
                      </View>
                      <Text style={styles.gradeCount}>{item.n} {item.n === 1 ? 'send' : 'sends'}</Text>
                    </View>
                    <View style={styles.gradeBar}>
                      <View 
                        style={[styles.gradeBarFill, { width: `${percentage}%`, backgroundColor: color }]} 
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* Recent Logs Sample */}
        {report.sample && report.sample.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {report.sample.map((log: any, index: number) => (
              <View key={`log-${log.id}-${index}`} style={styles.recentLog}>
                <View style={styles.recentLogHeader}>
                  <Text style={styles.recentLogClimb}>{log.climb_detail?.name}</Text>
                  <View style={[styles.recentGradeBadge, { backgroundColor: getGradeColor(log.climb_detail?.grade_index || 0) }]}>
                    <Text style={styles.recentGradeText}>{log.climb_detail?.grade_label}</Text>
                  </View>
                </View>
                <View style={styles.recentLogDetails}>
                  <Text style={styles.recentLogDate}>{log.date}</Text>
                  <Text style={styles.recentLogAttempts}>{log.attempts} attempts</Text>
                  {log.sent ? (
                    <Text style={styles.recentLogSent}>✓ Sent</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
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
  scrollContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
    textAlign: "center",
  },
  metricIcon: {
    fontSize: 32,
    marginTop: 8,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  gradeList: {
    gap: 12,
  },
  gradeRow: {
    gap: 8,
  },
  gradeInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  gradeLabel: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gradeLabelText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  gradeCount: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },
  gradeBar: {
    height: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    overflow: "hidden",
  },
  gradeBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  recentLog: {
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingBottom: 12,
    marginBottom: 12,
  },
  recentLogHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  recentLogClimb: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  recentGradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recentGradeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  recentLogDetails: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  recentLogDate: {
    fontSize: 14,
    color: "#6b7280",
  },
  recentLogAttempts: {
    fontSize: 14,
    color: "#6b7280",
  },
  recentLogSent: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
  },
  filtersSection: {
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
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  applyButton: {
    backgroundColor: "#6366f1",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
