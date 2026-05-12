"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AssessmentService } from "@/lib/api/services/AssessmentService";
import type { AssessmentType, QuestionnaireDefinition } from "@/lib/api/types";
import { Card, PageHeader, SafetyNote } from "./DashboardUI";

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
  const [definitions, setDefinitions] = useState<QuestionnaireDefinition[]>([]);
  const [answers, setAnswers] = useState<Record<string, Record<string, number | undefined>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    AssessmentService.questionnaires()
      .then((items) => {
        setDefinitions(items);
        setAnswers(
          Object.fromEntries(
            items.map((definition) => [
              definition.assessment_type,
              emptyAnswers(definition.questions.length),
            ])
          )
        );
      })
      .catch(() => setError("We could not load the assessment questions yet."))
      .finally(() => setIsLoading(false));
  }, []);

  const sections = useMemo(() => {
    if (assessmentType === "full_scan") return definitions;
    return definitions.filter((definition) => definition.assessment_type === assessmentType);
  }, [assessmentType, definitions]);

  const totalQuestions = sections.reduce((total, section) => total + section.questions.length, 0);
  const answeredQuestions = sections.reduce(
    (total, section) =>
      total + Object.values(answers[section.assessment_type] ?? {}).filter((value) => value !== undefined).length,
    0
  );

  async function submit() {
    setError("");
    if (!totalQuestions) {
      setError("We could not load this assessment yet.");
      return;
    }
    if (answeredQuestions !== totalQuestions) {
      setError("Please answer every prompt before submitting.");
      return;
    }

    const responses =
      assessmentType === "full_scan"
        ? Object.fromEntries(sections.map((section) => [section.assessment_type, answers[section.assessment_type]]))
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

        {isLoading ? (
          <div className="mt-6 rounded-[18px] bg-[#f8fafc] p-6 text-sm font-medium text-[#6b7280]">
            Loading assessment questions...
          </div>
        ) : (
          <div className="mt-6 space-y-8">
            {sections.map((section) => (
              <div key={section.assessment_type} className="space-y-5">
                {assessmentType === "full_scan" && (
                  <h2 className="text-xl font-semibold text-[#111827]">{section.title}</h2>
                )}
                {section.questions.map((question) => {
                  const key = String(question.number);
                  return (
                    <div key={`${section.assessment_type}-${key}`} className="rounded-[18px] border border-[#e5e7eb] bg-[#f8fafc] p-4">
                      <p className="font-semibold leading-7 text-[#111827]">{question.prompt}</p>
                      <div className="mt-4 grid gap-2 md:grid-cols-2">
                        {section.answer_scale.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setAnswers((current) => ({
                                ...current,
                                [section.assessment_type]: {
                                  ...(current[section.assessment_type] ?? {}),
                                  [key]: option.value,
                                },
                              }))
                            }
                            className={`rounded-[14px] border px-4 py-3 text-left text-sm font-medium transition ${
                              answers[section.assessment_type]?.[key] === option.value
                                ? "border-primary bg-[#ede7ff] text-primary"
                                : "border-[#e5e7eb] bg-white text-[#111827] hover:border-primary/25"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={isSubmitting || isLoading}
          className="mt-8 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Submitting..." : "Submit assessment"}
        </button>
      </Card>

      <SafetyNote />
    </div>
  );
}
