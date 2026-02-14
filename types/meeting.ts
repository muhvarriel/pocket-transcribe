export interface Meeting {
  id: string;
  title: string | null;
  created_at: string | null;
  duration: string | number | null;
  status: "processing" | "ready";
  transcript: string | null;
  summary: string | null;
  audio_url: string | null;
  user_id?: string;
}

export interface MeetingListItem extends Meeting {
  date: string;
  progress?: number;
  description?: string;
}

export interface MeetingListResponse {
  data: Meeting[];
  meta: {
    has_more: boolean;
    total: number;
    page: number;
    limit: number;
  };
}
