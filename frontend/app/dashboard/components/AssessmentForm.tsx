"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AssessmentService } from "@/lib/api/services/AssessmentService";
import type { AssessmentType } from "@/lib/api/types";
import { Card, PageHeader, SafetyNote } from "./DashboardUI";

const OPTION_LABELS_0_3 = ["Not at all", "Several days", "More than half the days", "Nearly every day"];
const OPTION_LABELS_0_4 = ["Never", "Almost never", "Sometimes", "Fairly often", "Very often"];

const QUESTIONS = {
  phq9: [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself, or that you are a failure",
    "Trouble concentrating on things",
    "Moving or speaking slowly, or being unusually restless",
    "Thoughts that you would be better off dead or of hurting yourself",
  ],
  gad7: [
    "Feeling nervous, anxious, or on edge",
    "Not being able to stop or control worrying",
    "Worrying too much about different things",
    "Trouble relaxing",
    "Being so restless that it is hard to sit still",
    "Becoming easily annoyed or irritable",
    "Feeling afraid as if something awful might happen",
  ],
  pss10: [
    "Upset because of something that happened unexpectedly",
    "Unable to control important things in your life",
    "Felt nervous and stressed",
    "Felt confident about your ability to handle personal problems",
    "Felt that things were going your way",
    "Could not cope with all the things you had to do",
    "Able to control irritations in your life",
    "Felt that you were on top of things",
    "Angered because of things outside your control",
    "Felt difficulties were piling up so high you could not overcome them",
  ],
} as const;

const TITLES = {
  phq9: "PHQ-9 Assessment",
  gad7: "GAD-7 Assessment",
  pss10: "PSS-10 Assessment",
  full_scan: "Full Wellness Scan",
};

function emptyAnswers(count: number) {
  return Object.fromEntries(Array.from({ length: count }, (_, index) => [String(index + 1), undefined]));
}

export function AssessmentForm({ assessmentType }: { assessmentType: AssessmentType }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, Record<string, number | undefined>>>(() => ({
    phq9: emptyAnswers(QUESTIONS.phq9.length),
    gad7: emptyAnswers(QUESTIONS.gad7.length),
    pss10: emptyAnswers(QUESTIONS.pss10.length),
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const sections = useMemo(() => {
    if (assessmentType === "full_scan") return ["phq9", "gad7", "pss10"] as const;
    return [assessmentType] as const;
  }, [assessmentType]);

  const totalQuestions = sections.reduce((total, section) => total + QUESTIONS[section].length, 0);
  const answeredQuestions = sections.reduce(
    (total, section) => total + Object.values(answers[section]).filter((value) => value !== undefined).length,
    0
  );

  async function submit() {
    setError("");
    if (answeredQuestions !== totalQuestions) {
      setError("Please answer every prompt before submitting.");
      return;
    }

    const responses =
      assessmentType === "full_scan"
        ? Object.fromEntries(sections.map((section) => [section, answers[section]]))
        : answers[assessmentType];

    try {
      setIsSubmitting(true);
      await AssessmentService.submit({ assessment_type: assessmentType, responses });
      router.push("/dashboard/assessments/results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not submit this assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Private assessment"
        title={TITLES[assessmentType]}
        description="Answer based on your recent experience. Kalms scores this privately and turns the result into supportive next steps."
      />

      <Card>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-primary">
            {answeredQuestions}/{totalQuestions} answered
          </p>
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        </div>

        <div className="mt-6 space-y-8">
          {sections.map((section) => (
            <div key={section} className="space-y-5">
              {assessmentType === "full_scan" && (
                <h2 className="text-xl font-semibold text-[#111827]">{TITLES[section]}</h2>
              )}
              {QUESTIONS[section].map((question, index) => {
                const key = String(index + 1);
                const options = section === "pss10" ? OPTION_LABELS_0_4 : OPTION_LABELS_0_3;
                return (
                  <div key={`${section}-${key}`} className="rounded-[18px] border border-[#e5e7eb] bg-[#f8fafc] p-4">
                    <p className="font-semibold leading-7 text-[#111827]">{question}</p>
                    <div className="mt-4 grid gap-2 md:grid-cols-2">
                      {options.map((option, value) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setAnswers((current) => ({
                              ...current,
                              [section]: { ...current[section], [key]: value },
                            }))
                          }
                          className={`rounded-[14px] border px-4 py-3 text-left text-sm font-medium transition ${
                            answers[section][key] === value
                              ? "border-primary bg-[#ede7ff] text-primary"
                              : "border-[#e5e7eb] bg-white text-[#111827] hover:border-primary/25"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={isSubmitting}
          className="mt-8 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Submitting..." : "Submit assessment"}
        </button>
      </Card>

      <SafetyNote />
    </div>
  );
}

