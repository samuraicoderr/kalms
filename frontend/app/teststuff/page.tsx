"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Smile,
  Zap,
  Brain,
  ClipboardList,
  MessageCircle,
  History,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  ChevronRight,
  Sparkles,
  Heart,
  Activity,
  BarChart3,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface MoodLog {
  date: string;
  mood: number;
  energy: number;
  stress: number;
}

interface AssessmentScore {
  date: string;
  phq9: number;
  gad7: number;
  pss10: number;
}

interface User {
  name: string;
  email: string;
  institution?: string;
}

interface Prediction {
  date: string;
  category: "Healthy" | "At Risk" | "Distressed";
  confidence: number;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_MOOD_LOGS: MoodLog[] = [
  { date: "2026-05-04", mood: 6, energy: 5, stress: 7 },
  { date: "2026-05-05", mood: 7, energy: 6, stress: 6 },
  { date: "2026-05-06", mood: 5, energy: 4, stress: 8 },
  { date: "2026-05-07", mood: 6, energy: 5, stress: 7 },
  { date: "2026-05-08", mood: 7, energy: 7, stress: 5 },
  { date: "2026-05-09", mood: 8, energy: 7, stress: 4 },
  { date: "2026-05-10", mood: 7, energy: 6, stress: 5 },
];

const MOCK_ASSESSMENTS: AssessmentScore[] = [
  { date: "2026-04-10", phq9: 12, gad7: 10, pss10: 22 },
  { date: "2026-04-17", phq9: 10, gad7: 8, pss10: 20 },
  { date: "2026-04-24", phq9: 9, gad7: 7, pss10: 18 },
  { date: "2026-05-01", phq9: 8, gad7: 6, pss10: 16 },
  { date: "2026-05-08", phq9: 7, gad7: 5, pss10: 14 },
];

const MOCK_PREDICTIONS: Prediction[] = [
  { date: "2026-04-10", category: "Distressed", confidence: 0.82 },
  { date: "2026-04-17", category: "At Risk", confidence: 0.75 },
  { date: "2026-04-24", category: "At Risk", confidence: 0.68 },
  { date: "2026-05-01", category: "At Risk", confidence: 0.61 },
  { date: "2026-05-08", category: "Healthy", confidence: 0.78 },
];

const MOTIVATIONAL_QUOTES = [
  "Small steps every day lead to big changes.",
  "Your mental health matters. Take time for yourself today.",
  "Progress, not perfection.",
  "Breathe. You are doing better than you think.",
  "Every day is a fresh start.",
  "Be kind to your mind.",
];

// ─── Helper Functions ────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getCategoryColor(category: string): string {
  switch (category) {
    case "Healthy":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "At Risk":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "Distressed":
      return "bg-rose-100 text-rose-700 border-rose-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function getCategoryDot(category: string): string {
  switch (category) {
    case "Healthy":
      return "bg-emerald-500";
    case "At Risk":
      return "bg-amber-500";
    case "Distressed":
      return "bg-rose-500";
    default:
      return "bg-slate-500";
  }
}

function getTrendIcon(trend: "up" | "down" | "stable") {
  switch (trend) {
    case "up":
      return <TrendingUp className="w-5 h-5 text-emerald-500" />;
    case "down":
      return <TrendingDown className="w-5 h-5 text-rose-500" />;
    case "stable":
      return <Minus className="w-5 h-5 text-amber-500" />;
  }
}

// ─── Sub-Components ────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {subtext && <p className="text-slate-400 text-xs mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({
  icon: Icon,
  label,
  description,
  onClick,
  color,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border border-slate-100 bg-white hover:shadow-md transition-all group ${color}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-50 group-hover:bg-white/80 transition-colors">
            <Icon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{label}</p>
            <p className="text-slate-400 text-xs">{description}</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
      </div>
    </button>
  );
}

function DailyCheckIn({
  onSubmit,
}: {
  onSubmit: (data: { mood: number; energy: number; stress: number }) => void;
}) {
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [stress, setStress] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    onSubmit({ mood, energy, stress });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6 text-emerald-600" />
        </div>
        <h3 className="font-semibold text-slate-800">Check-in recorded!</h3>
        <p className="text-slate-500 text-sm mt-1">
          Thank you for taking care of your mental health today.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Heart className="w-4 h-4 text-rose-400" />
        Daily Check-In
      </h3>

      <div className="space-y-5">
        {/* Mood */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-slate-600 flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-amber-500" /> Mood
            </label>
            <span className="text-sm font-semibold text-slate-700">{mood}/10</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={mood}
            onChange={(e) => setMood(Number(e.target.value))}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        {/* Energy */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-slate-600 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-yellow-500" /> Energy
            </label>
            <span className="text-sm font-semibold text-slate-700">{energy}/10</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={energy}
            onChange={(e) => setEnergy(Number(e.target.value))}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        {/* Stress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-slate-600 flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-blue-500" /> Stress
            </label>
            <span className="text-sm font-semibold text-slate-700">{stress}/10</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={stress}
            onChange={(e) => setStress(Number(e.target.value))}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium text-sm transition-colors"
        >
          Log Check-In
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard Component ──────────────────────────────────────────────────

export default function DashboardPage() {
  const [user] = useState<User>({
    name: "Alex",
    email: "alex@university.edu",
    institution: "State University",
  });

  const [quote, setQuote] = useState(MOTIVATIONAL_QUOTES[0]);
  const [currentDate, setCurrentDate] = useState<string>("");
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>(MOCK_MOOD_LOGS);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "Hi! I'm Kalms. How are you feeling today? I'm here to listen and support you. 💙" },
  ]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    setCurrentDate(formatDate(new Date()));
    const randomQuote =
      MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    setQuote(randomQuote);
  }, []);

  // Compute wellness trend
  const wellnessTrend = useMemo<"up" | "down" | "stable">(() => {
    if (MOCK_PREDICTIONS.length < 2) return "stable";
    const latest = MOCK_PREDICTIONS[MOCK_PREDICTIONS.length - 1];
    const prev = MOCK_PREDICTIONS[MOCK_PREDICTIONS.length - 2];
    const order = { Healthy: 3, "At Risk": 2, Distressed: 1 };
    if (order[latest.category] > order[prev.category]) return "up";
    if (order[latest.category] < order[prev.category]) return "down";
    return "stable";
  }, []);

  const latestPrediction = MOCK_PREDICTIONS[MOCK_PREDICTIONS.length - 1];
  const latestAssessment = MOCK_ASSESSMENTS[MOCK_ASSESSMENTS.length - 1];

  const handleCheckIn = (data: { mood: number; energy: number; stress: number }) => {
    const today = new Date().toISOString().split("T")[0];
    setMoodLogs((prev) => [
      ...prev.filter((log) => log.date !== today),
      { date: today, ...data },
    ]);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setChatInput("");

    // Simulate bot response
    setTimeout(() => {
      const responses = [
        "That sounds challenging. Remember, it's okay to not be okay. Would you like to try a breathing exercise?",
        "I'm here for you. Taking small breaks can really help when things feel overwhelming.",
        "Thank you for sharing that with me. Your feelings are valid. Have you considered journaling about this?",
        "I hear you. Sometimes talking about it helps. Is there something specific on your mind?",
        "You're doing great by reaching out. Remember to be gentle with yourself today.",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setChatMessages((prev) => [...prev, { role: "bot", text: randomResponse }]);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-lg leading-tight">MindWell</h1>
              <p className="text-xs text-slate-400">Student Mental Health Support</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg">
              <Calendar className="w-4 h-4" />
              {currentDate}
            </div>
            <div className="w-9 h-9 bg-violet-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-violet-700">
                {user.name.charAt(0)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ─── Greeting & Motivation ────────────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
            {getGreeting()}, {user.name} 👋
          </h2>
          <div className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 px-4 py-2.5 rounded-xl">
            <Sparkles className="w-4 h-4 text-violet-500 flex-shrink-0" />
            <p className="text-sm text-violet-700 font-medium">{quote}</p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Left Column ──────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard
                icon={ClipboardList}
                label="Assessments"
                value={MOCK_ASSESSMENTS.length}
                subtext="Total taken"
                color="bg-violet-500"
              />
              <StatCard
                icon={Activity}
                label="Current Streak"
                value="7 days"
                subtext="Keep it up!"
                color="bg-emerald-500"
              />
              <StatCard
                icon={Heart}
                label="Wellness Status"
                value={latestPrediction.category}
                subtext={`${Math.round(latestPrediction.confidence * 100)}% confidence`}
                color="bg-blue-500"
              />
              <StatCard
                icon={TrendingUp}
                label="Trend"
                value={wellnessTrend === "up" ? "Improving" : wellnessTrend === "down" ? "Declining" : "Stable"}
                subtext="Since last assessment"
                color={wellnessTrend === "up" ? "bg-emerald-500" : wellnessTrend === "down" ? "bg-rose-500" : "bg-amber-500"}
              />
            </div>

            {/* Assessment Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-violet-500" />
                Latest Assessment Scores
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-slate-800">{latestAssessment.phq9}</p>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">PHQ-9</p>
                  <p className="text-xs text-slate-400 mt-0.5">Depression</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-slate-800">{latestAssessment.gad7}</p>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">GAD-7</p>
                  <p className="text-xs text-slate-400 mt-0.5">Anxiety</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-slate-800">{latestAssessment.pss10}</p>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">PSS-10</p>
                  <p className="text-xs text-slate-400 mt-0.5">Perceived Stress</p>
                </div>
              </div>
            </div>

            {/* Trend Visualization */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-500" />
                Wellness Trends
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_ASSESSMENTS}>
                    <defs>
                      <linearGradient id="phq9Gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gad7Gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="pss10Gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(val) =>
                        new Date(val).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                      stroke="#cbd5e1"
                      fontSize={12}
                    />
                    <YAxis stroke="#cbd5e1" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        fontSize: "13px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="phq9"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fill="url(#phq9Gradient)"
                      name="PHQ-9"
                    />
                    <Area
                      type="monotone"
                      dataKey="gad7"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      fill="url(#gad7Gradient)"
                      name="GAD-7"
                    />
                    <Area
                      type="monotone"
                      dataKey="pss10"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fill="url(#pss10Gradient)"
                      name="PSS-10"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Mood Trend Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Smile className="w-4 h-4 text-violet-500" />
                Mood Tracking History
              </h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={moodLogs}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(val) =>
                        new Date(val).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                      stroke="#cbd5e1"
                      fontSize={12}
                    />
                    <YAxis domain={[0, 10]} stroke="#cbd5e1" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        fontSize: "13px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#f59e0b" }}
                      name="Mood"
                    />
                    <Line
                      type="monotone"
                      dataKey="energy"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#8b5cf6" }}
                      name="Energy"
                    />
                    <Line
                      type="monotone"
                      dataKey="stress"
                      stroke="#ef4444"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#ef4444" }}
                      name="Stress"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ─── Right Column ─────────────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Daily Check-In */}
            <DailyCheckIn onSubmit={handleCheckIn} />

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <QuickActionButton
                  icon={ClipboardList}
                  label="Start Assessment"
                  description="Take PHQ-9, GAD-7, or PSS-10"
                  onClick={() => alert("Navigate to assessment page")}
                  color="hover:border-violet-200"
                />
                <QuickActionButton
                  icon={MessageCircle}
                  label="Chat with Kalms"
                  description="Talk to your AI companion"
                  onClick={() => setShowChat(true)}
                  color="hover:border-blue-200"
                />
                <QuickActionButton
                  icon={History}
                  label="View History"
                  description="Past assessments & mood logs"
                  onClick={() => alert("Navigate to history page")}
                  color="hover:border-emerald-200"
                />
                <QuickActionButton
                  icon={Smile}
                  label="Mood Tracker"
                  description="Log and view emotional trends"
                  onClick={() => alert("Navigate to mood tracker page")}
                  color="hover:border-amber-200"
                />
              </div>
            </div>

            {/* Prediction History */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">AI Prediction History</h3>
              <div className="space-y-3">
                {[...MOCK_PREDICTIONS].reverse().map((pred, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${getCategoryDot(pred.category)}`} />
                      <div>
                        <p className="text-sm font-medium text-slate-700">{pred.category}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(pred.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getCategoryColor(
                        pred.category
                      )}`}
                    >
                      {Math.round(pred.confidence * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Chat Companion Modal ───────────────────────────────────────────── */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowChat(false)}
          />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Kalms</p>
                  <p className="text-xs text-violet-100">AI Support Companion</p>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
                ⚠️ Kalms is not a licensed therapist. If you're in crisis, please seek professional help immediately.
              </div>
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-violet-600 text-white rounded-br-md"
                        : "bg-white text-slate-700 border border-slate-200 rounded-bl-md shadow-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendChat}
                  className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}