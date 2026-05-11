import { apiClient } from "../ApiClient";
import { BackendRoutes } from "../BackendRoutes";
import type { MoodLog, MoodLogInput } from "../types/wellness.types";

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export class MoodService {
  static async today(): Promise<MoodLog | null> {
    const res = await apiClient.get<MoodLog | null>(BackendRoutes.wellness.todayMoodLog, {
      requiresAuth: true,
    });
    return res.data;
  }

  static async saveToday(payload: MoodLogInput): Promise<MoodLog> {
    const res = await apiClient.post<MoodLog>(BackendRoutes.wellness.todayMoodLog, payload, {
      requiresAuth: true,
    });
    return res.data;
  }

  static async list(params?: { date_from?: string; date_to?: string }): Promise<MoodLog[]> {
    const res = await apiClient.get<PaginatedResponse<MoodLog> | MoodLog[]>(
      BackendRoutes.wellness.moodLogs,
      { requiresAuth: true, params }
    );
    return Array.isArray(res.data) ? res.data : res.data.results;
  }
}

export default MoodService;

