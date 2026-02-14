import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SectionList,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "../../constants/Colors";
import { MeetingCard } from "../../components/MeetingCard";
import { Search, FileAudio } from "lucide-react-native";
import { useFocusEffect } from "expo-router";
import { useMeetingList } from "../../hooks/useMeetings";

const FILTERS = ["All", "Processing", "Completed"];

export default function MeetingsScreen() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    loading,
    loadingMore,
    refreshing,
    sections,
    hasMore,
    page,
    setRefreshing,
    fetchMeetings,
  } = useMeetingList();

  // Filter changes - Immediate fetch
  useEffect(() => {
    fetchMeetings(1, true, searchQuery, activeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]); // Only run when filter changes. We omit searchQuery to avoid triggering on typing.

  // Search changes - Debounced fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMeetings(1, true, searchQuery, activeFilter, true);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]); // Only run when search string changes. We omit activeFilter to avoid double triggers.

  useFocusEffect(
    useCallback(() => {
      // Refresh list when screen comes into focus
      fetchMeetings(1, true, searchQuery, activeFilter, true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      console.log("Load more triggered, page:", page + 1);
      fetchMeetings(page + 1, false, searchQuery, activeFilter);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMeetings(1, true, searchQuery, activeFilter);
  };

  const toggleSearch = useCallback(() => {
    setIsSearching((prev) => !prev);
    if (isSearching) {
      setSearchQuery("");
    }
  }, [isSearching]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  const cancelSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>PocketTranscribe</Text>
            <Text style={styles.headerSubtitle}>Your recorded sessions</Text>
          </View>
          {!isSearching && (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={toggleSearch}
              >
                <Search size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {isSearching && (
          <View style={styles.searchContainer}>
            <View style={styles.searchBarWrapper}>
              <Search size={20} color="#9EA0A5" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search meetings..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                placeholderTextColor="#9EA0A5"
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={clearSearch}
                  style={styles.clearButton}
                >
                  <View style={styles.clearIconBg}>
                    <Text style={styles.clearIconText}>×</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={cancelSearch}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                activeFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && sections.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          renderItem={({ item }) => (
            <MeetingCard
              id={item.id}
              title={item.title || "Untitled Meeting"}
              date={item.date}
              duration={item.duration || "--"}
              status={item.status}
              description={item.description}
              progress={item.progress}
              onDelete={() =>
                fetchMeetings(1, true, searchQuery, activeFilter, true)
              }
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
              <View style={styles.sectionLine} />
            </View>
          )}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyStateIcon}>
                <FileAudio size={48} color={Colors.primary} />
              </View>
              <Text style={styles.emptyStateTitle}>
                {searchQuery ? "No matches found" : "No meetings yet"}
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                {searchQuery
                  ? "Try adjusting your search or filters."
                  : "Record your first conversation to get started."}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  header: {
    backgroundColor: "#F8F9FB",
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Outfit_700Bold",
    color: "#1A1C1E",
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    color: "#74777F",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterContainer: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "#FFF",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  filterChipActive: {
    backgroundColor: "#00BCD4",
    borderColor: "#00BCD4",
  },
  filterText: {
    fontSize: 14,
    fontFamily: "Outfit_600SemiBold",
    color: "#74777F",
  },
  filterTextActive: {
    color: "#FFF",
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Outfit_700Bold",
    color: "#C4C7CF",
    letterSpacing: 1,
    marginRight: 12,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#EEE",
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    color: "#1A1C1E",
    height: "100%",
  },
  clearButton: {
    padding: 4,
  },
  clearIconBg: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#C4C7CF",
    justifyContent: "center",
    alignItems: "center",
  },
  clearIconText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
    lineHeight: 14,
    marginTop: -1,
  },
  cancelText: {
    fontSize: 16,
    fontFamily: "Outfit_500Medium",
    color: Colors.primary,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: "Outfit_600SemiBold",
    color: "#1A1C1E",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: "#74777F",
    textAlign: "center",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footerLoader: {
    paddingVertical: 20,
  },
});
