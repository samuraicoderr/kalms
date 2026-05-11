"use client";

import { useEffect, useState } from "react";
import { MoodService } from "@/lib/api/services/MoodService";
import type { MoodLog } from "@/lib/api/types";
import { Card, SoftIcon } from "./DashboardUI";
import { Heart, Wind, Zap } from "lucide-react";

export function DailyCheckInForm() {
  const [mood, setMood] = useState(7);
  const [energy, setEnergy] = useState(6);
  const [stress, setStress] = useState(4);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState<MoodLog | null>(null);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    MoodService.today().then((log) => {
      if (!log) return;
      setSaved(log);
      setMood(log.mood_score);
      setEnergy(log.energy_score);
      setStress(log.stress_score);
      setNote(log.note);
    });
  }, []);

  async function save() {
    setIsSaving(true);
    setMessage("");
    try {
      const log = await MoodService.saveToday({
        mood_score: mood,
        energy_score: energy,
        stress_score: stress,
        note,
        source: "daily_check_in",
      });
      setSaved(log);
      setMessage("Today's check-in is saved.");
    } catch {
      setMessage("We could not save that check-in yet.");
    } finally {
      setIsSaving(false);
    }
  }

  const sliders = [
    { label: "Mood", value: mood, setter: setMood, icon: Heart },
    { label: "Energy", value: energy, setter: setEnergy, icon: Zap },
    { label: "Stress", value: stress, setter: setStress, icon: Wind },
  ] as const;

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Daily check-in</p>
          <h2 className="mt-2 text-xl font-semibold text-[#111827]">
            {saved ? "Update today's check-in" : "How are you arriving today?"}
          </h2>
        </div>
        <SoftIcon icon={Heart} tone="purple" />
      </div>
      <div className="mt-6 space-y-5">
        {sliders.map((item) => (
          <label key={item.label} className="block">
            <span className="mb-2 flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2 font-medium text-[#111827]">
                <item.icon size={16} className="text-primary" />
                {item.label}
              </span>
              <span className="text-[#6b7280]">{item.value}/10</span>
            </span>
            <input
              type="range"
              min={1}
              max={10}
              value={item.value}
              onChange={(event) => item.setter(Number(event.target.value))}
              className="w-full accent-primary"
            />
          </label>
        ))}
      </div>
      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Optional note"
        className="mt-5 min-h-24 w-full rounded-[18px] border border-[#e5e7eb] bg-[#f8fafc] p-4 text-sm outline-none focus:border-primary"
      />
      {message && <p className="mt-3 text-sm font-medium text-[#6b7280]">{message}</p>}
      <button
        onClick={save}
        disabled={isSaving}
        className="mt-5 w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-strong disabled:opacity-60"
      >
        {isSaving ? "Saving..." : "Save today's check-in"}
      </button>
    </Card>
  );
}

