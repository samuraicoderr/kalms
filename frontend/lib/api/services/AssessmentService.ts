import { apiClient } from "../ApiClient";
import { BackendRoutes } from "../BackendRoutes";
import type {
  Assessment,
  AssessmentSubmission,
  QuestionnaireDefinition,
  Recommendation,
} from "../types/wellness.types";

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

function normalizeList<T>(data: PaginatedResponse<T> | T[]): T[] {
  return Array.isArray(data) ? data : data.results;
}

export class AssessmentService {
  static async submit(payload: AssessmentSubmission): Promise<Assessment> {
    const res = await apiClient.post<Assessment>(BackendRoutes.wellness.submitAssessment, payload, {
      requiresAuth: true,
    });
    return res.data;
  }

  static async latest(): Promise<Assessment | null> {
    const res = await apiClient.get<Assessment | null>(BackendRoutes.wellness.latestAssessment, {
      requiresAuth: true,
    });
    return res.data;
  }

  static async history(): Promise<Assessment[]> {
    const res = await apiClient.get<PaginatedResponse<Assessment> | Assessment[]>(
      BackendRoutes.wellness.assessmentHistory,
      { requiresAuth: true }
    );
    return normalizeList(res.data);
  }

  static async recommendations(): Promise<Recommendation[]> {
    const res = await apiClient.get<PaginatedResponse<Recommendation> | Recommendation[]>(
      BackendRoutes.wellness.recommendations,
      { requiresAuth: true, params: { is_active: true } }
    );
    return normalizeList(res.data);
  }

  static async questionnaires(): Promise<QuestionnaireDefinition[]> {
    const res = await apiClient.get<{ results: QuestionnaireDefinition[] }>(
      BackendRoutes.wellness.questionnaires,
      { requiresAuth: true }
    );
    return res.data.results;
  }
}

export default AssessmentService;
