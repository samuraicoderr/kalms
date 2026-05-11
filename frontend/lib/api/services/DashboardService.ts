import { apiClient } from "../ApiClient";
import { BackendRoutes } from "../BackendRoutes";
import type { DashboardSummary } from "../types/wellness.types";

export class DashboardService {
  static async summary(): Promise<DashboardSummary> {
    const res = await apiClient.get<DashboardSummary>(BackendRoutes.dashboard.summary, {
      requiresAuth: true,
    });
    return res.data;
  }
}

export default DashboardService;

