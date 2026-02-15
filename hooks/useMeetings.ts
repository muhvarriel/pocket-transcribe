import { useState, useCallback, useRef } from "react";
import { Alert } from "react-native";
import { format, isToday, parseISO } from "date-fns";
import { getApiUrl } from "../constants/Config";
import { useAuthSession } from "./useAuthSession";
import { getErrorMessage } from "../utils/errorUtils";
import {
  Meeting,
  MeetingListItem,
  MeetingListResponse,
} from "../types/meeting";
export function useMeetingList() {
  const { user } = useAuthSession();
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sections, setSections] = useState<
    { title: string; data: MeetingListItem[] }[]
  >([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Refs for stable access
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isAlertActive = useRef(false);
  const retryCount = useRef(0);
  const MAX_RETRIES = 2;

  const groupMeetings = useCallback((data: MeetingListItem[]) => {
    const todayMeetings: MeetingListItem[] = [];
    const earlierMeetings: MeetingListItem[] = [];

    data.forEach((meeting) => {
      if (!meeting.created_at) return;
      const meetingDate = parseISO(meeting.created_at);
      if (isToday(meetingDate)) {
        todayMeetings.push(meeting);
      } else {
        earlierMeetings.push(meeting);
      }
    });

    const newSections = [];
    if (todayMeetings.length > 0)
      newSections.push({ title: "TODAY", data: todayMeetings });
    if (earlierMeetings.length > 0)
      newSections.push({ title: "EARLIER", data: earlierMeetings });
    return newSections;
  }, []);

  const fetchMeetings = useCallback(
    async (
      pageNum: number,
      reset: boolean = false,
      searchQuery: string = "",
      activeFilter: string = "All",
      isSilent: boolean = false,
    ) => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (reset) {
        if (!isSilent) setLoading(true);
        setPage(1);
        hasMoreRef.current = true;
        setHasMore(true);
      } else {
        if (!hasMoreRef.current || loadingMoreRef.current) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
      }

      try {
        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: "10",
        });
        if (user?.id) params.append("user_id", user.id);
        if (searchQuery) params.append("search", searchQuery);
        if (activeFilter !== "All") params.append("status", activeFilter);

        const response = await fetch(
          `${getApiUrl()}/meetings?${params.toString()}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const resJson = (await response.json()) as MeetingListResponse;
        const rawData = resJson.data || [];
        const meta = resJson.meta || {};

        retryCount.current = 0; // Reset on success

        const mappedMeetings: MeetingListItem[] = rawData.map((m: Meeting) => ({
          ...m,
          date: m.created_at
            ? format(parseISO(m.created_at), "MMM d, yyyy")
            : "Unknown",
          duration: m.duration ? formatDuration(m.duration) : "--",
          status: m.status === "processing" ? "processing" : "ready",
          description: m.summary || undefined,
          progress: m.status === "processing" ? 0.4 : undefined,
        }));

        if (reset) {
          setSections(groupMeetings(mappedMeetings));
        } else {
          setSections((prev) => {
            const existing = prev.flatMap((s) => s.data);
            const newList = [...existing, ...mappedMeetings];
            const uniqueList = newList.filter(
              (v, i, a) => a.findIndex((t) => t.id === v.id) === i,
            );
            return groupMeetings(uniqueList);
          });
        }

        const newHasMore = meta.has_more ?? mappedMeetings.length === 10;
        hasMoreRef.current = newHasMore;
        setHasMore(newHasMore);

        if (!reset) setPage(pageNum);
      } catch (e: unknown) {
        if (e instanceof Error && e.name === "AbortError") return;
        console.error("Error fetching meetings:", e);
        if (!isSilent) {
          const errorMessage = getErrorMessage(e);
          let message =
            "Could not load your meetings. Please check your internet connection.";
          if (errorMessage.includes("Network request failed")) {
            message = "Network error. Please check your connection.";
          } else if (errorMessage.includes("500")) {
            message = "Server error. We are working on it.";
          }

          if (retryCount.current < MAX_RETRIES) {
            retryCount.current += 1;
            console.log(
              `Retrying fetch (${retryCount.current}/${MAX_RETRIES})...`,
            );
            setTimeout(() => {
              fetchMeetings(pageNum, reset, searchQuery, activeFilter, true);
            }, 3000);
          } else if (!isAlertActive.current) {
            isAlertActive.current = true;
            Alert.alert("Oops!", message, [
              {
                text: "OK",
                onPress: () => {
                  isAlertActive.current = false;
                  retryCount.current = 0;
                },
              },
            ]);
          }
        }
      } finally {
        if (abortControllerRef.current === controller) {
          setLoading(false);
          setLoadingMore(false);
          loadingMoreRef.current = false;
          setRefreshing(false);
          abortControllerRef.current = null;
        }
      }
    },
    [user?.id, groupMeetings],
  );

  return {
    loading,
    loadingMore,
    refreshing,
    sections,
    hasMore,
    page,
    setRefreshing,
    fetchMeetings,
  };
}

export function useMeetingDetails(id?: string) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const isAlertActive = useRef(false);
  const retryCount = useRef(0);
  const MAX_RETRIES = 2;

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/meetings/${id}`);
      const data = (await response.json()) as Meeting;
      setMeeting(data);
      retryCount.current = 0; // Reset on success
    } catch (error) {
      console.error("Error fetching meeting:", error);

      if (retryCount.current < MAX_RETRIES) {
        retryCount.current += 1;
        setTimeout(fetchDetails, 3000);
      } else if (!isAlertActive.current) {
        isAlertActive.current = true;
        Alert.alert("Error", "Could not load meeting details.", [
          {
            text: "OK",
            onPress: () => {
              isAlertActive.current = false;
              retryCount.current = 0;
            },
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  const updateTitle = async (newTitle: string): Promise<boolean> => {
    if (!id) return false;
    try {
      const response = await fetch(`${getApiUrl()}/meetings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (response.ok) {
        setMeeting((prev: Meeting | null) =>
          prev ? { ...prev, title: newTitle } : null,
        );
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const deleteMeeting = async () => {
    if (!id) return false;
    try {
      await fetch(`${getApiUrl()}/meetings/${id}`, { method: "DELETE" });
      return true;
    } catch {
      return false;
    }
  };

  return {
    meeting,
    loading,
    fetchDetails,
    updateTitle,
    deleteMeeting,
  };
}

// Helper to format duration
function formatDuration(seconds?: number | string) {
  if (!seconds) return "--";
  const secNum = typeof seconds === "string" ? parseFloat(seconds) : seconds;
  const mins = Math.floor(secNum / 60);
  const secs = Math.floor(secNum % 60);
  return `${mins}m ${secs}s`;
}
