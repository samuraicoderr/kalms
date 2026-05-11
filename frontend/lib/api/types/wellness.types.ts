export type AssessmentType = "phq9" | "gad7" | "pss10" | "full_scan";
export type AssessmentStatus = "draft" | "completed" | "archived";
export type WellnessCategory = "healthy" | "at_risk" | "distressed";
export type TrendSignal = "improving" | "stable" | "worsening" | "unknown";

export interface Recommendation {
  id: string;
  recommendation_type: string;
  title: string;
  body: string;
  priority: number;
  is_active: boolean;
  created_at: string;
  dismissed_at: string | null;
}

export interface Prediction {
  id: string;
  category: WellnessCategory;
  confidence: string | null;
  trend_signal: TrendSignal;
  model_name: string;
  model_version: string;
  input_snapshot: Record<string, unknown>;
  explanation: string;
  recommendations: Recommendation[];
  created_at: string;
}

export interface Assessment {
  id: string;
  assessment_type: AssessmentType;
  status: AssessmentStatus;
  phq9_score: number | null;
  gad7_score: number | null;
  pss10_score: number | null;
  score_summary: {
    phq9: number | null;
    gad7: number | null;
    pss10: number | null;
    total: number;
  };
  responses: Record<string, Record<string, number>>;
  submitted_via: string;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  prediction: Prediction | null;
}

export interface AssessmentSubmission {
  assessment_type: AssessmentType;
  responses: Record<string, unknown>;
  submitted_via?: string;
}

export interface MoodLog {
  id: string;
  log_date: string;
  mood_score: number;
  energy_score: number;
  stress_score: number;
  mood_label: string;
  note: string;
  source: string;
  metadata: Record<string, unknown>;
  wellness_score: number;
  created_at: string;
  updated_at: string;
}

export interface MoodLogInput {
  log_date?: string;
  mood_score: number;
  energy_score: number;
  stress_score: number;
  mood_label?: string;
  note?: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface WeeklyMoodPoint {
  date: string;
  mood_score: number | null;
  energy_score: number | null;
  stress_score: number | null;
  wellness_score: number | null;
  mood_label: string;
}

export interface DashboardSummary {
  total_assessments: number;
  current_streak: number;
  latest_category: WellnessCategory | null;
  trend_signal: TrendSignal;
  latest_scores: Assessment["score_summary"];
  latest_assessment: Assessment | null;
  weekly_mood: WeeklyMoodPoint[];
  today_mood_log: MoodLog | null;
  recommendations: Recommendation[];
}

export interface ChatConversation {
  id: string;
  title: string;
  status: "active" | "archived" | "deleted";
  metadata: Record<string, unknown>;
  started_at: string;
  last_message_at: string | null;
  updated_at: string;
  latest_message: ChatMessage | null;
}

export interface ChatMessage {
  id: string;
  conversation: string;
  role: "user" | "assistant" | "system";
  content: string;
  model_name: string;
  safety_flags: Record<string, unknown>;
  metadata: Record<string, unknown>;
  token_count: number | null;
  created_at: string;
}

