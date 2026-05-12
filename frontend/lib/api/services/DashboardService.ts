import { apiClient } from "../ApiClient";
import { BackendRoutes } from "../BackendRoutes";
import type { DashboardSummary, InsightsSummary } from "../types/wellness.types";

export class DashboardService {
  static async summary(): Promise<DashboardSummary> {
    const res = await apiClient.get<DashboardSummary>(BackendRoutes.dashboard.summary, {
      requiresAuth: true,
    });
    return res.data;
  }

  static async insights(): Promise<InsightsSummary> {
    const res = await apiClient.get<InsightsSummary>(BackendRoutes.wellness.insightsSummary, {
      requiresAuth: true,
    });
    return res.data;
  }
}

export default DashboardService;
