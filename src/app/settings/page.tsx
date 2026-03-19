"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, GripVertical, Clock, Save, Check } from "lucide-react";

interface Question {
  id: string;
  text: string;
  type: string;
  field: string;
  optional?: boolean;
}

interface Settings {
  questions: Record<string, Question[]>;
  schedule: Record<string, { time: string; days: string }>;
}

const TYPE_LABELS: Record<string, string> = {
  questions_morning: "Morning",
  questions_personal: "Personal Check-in",
  questions_work: "Work Check-in",
  questions_week: "Weekly Review",
  questions_month: "Monthly Review",
  questions_relationship: "Relationship Review",
};

const TYPE_ORDER = [
  "questions_morning",
  "questions_personal",
  "questions_work",
  "questions_week",
  "questions_month",
  "questions_relationship",
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/settings");
    const data = await res.json();
    setSettings(data);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  async function saveQuestions(key: string) {
    if (!settings) return;
    setSaving(key);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: settings.questions[key] }),
      });
      if (res.ok) {
        setSaved(key);
        setTimeout(() => setSaved(null), 2000);
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } finally {
      setSaving(null);
    }
  }

  function updateQuestion(key: string, index: number, field: keyof Question, value: string | boolean) {
    if (!settings) return;
    const updated = { ...settings };
    const questions = [...(updated.questions[key] as Question[])];
    questions[index] = { ...questions[index], [field]: value };
    updated.questions[key] = questions;
    setSettings(updated);
  }

  function removeQuestion(key: string, index: number) {
    if (!settings) return;
    const updated = { ...settings };
    const questions = [...(updated.questions[key] as Question[])];
    questions.splice(index, 1);
    updated.questions[key] = questions;
    setSettings(updated);
  }

  function addQuestion(key: string) {
    if (!settings) return;
    const updated = { ...settings };
    const questions = [...(updated.questions[key] as Question[])];
    const newId = `custom_${Date.now()}`;
    questions.push({ id: newId, text: "", type: "text", field: newId, optional: true });
    updated.questions[key] = questions;
    setSettings(updated);
  }

  if (!settings) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-[13px] text-muted-foreground">Loading settings...</p>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-[20px] font-bold mb-6">Settings</h1>

      {error && (
        <div className="rounded-lg bg-destructive/10 text-destructive text-[13px] px-4 py-2 mb-4">
          {error}
        </div>
      )}

      {/* Schedule overview */}
      <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-5 mb-6">
        <h2 className="text-[15px] font-semibold mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Schedule
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(settings.schedule).map(([type, sched]) => (
            <div key={type} className="text-[12px]">
              <span className="font-medium text-foreground capitalize">{type}</span>
              <span className="text-muted-foreground ml-1.5">
                {sched.days} {sched.time}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-3">
          Schedule changes require a code deploy. Use Discord commands anytime: !checkin, !work, !week, !month, !relationship, !nightcap
        </p>
      </div>

      {/* Question editors */}
      {TYPE_ORDER.map((key) => {
        const questions = settings.questions[key] as Question[];
        if (!questions) return null;
        return (
          <div key={key} className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-semibold">{TYPE_LABELS[key]}</h2>
              <Button
                size="sm"
                onClick={() => saveQuestions(key)}
                disabled={saving === key}
                className="text-[12px] h-8 active:translate-y-px"
              >
                {saved === key ? (
                  <><Check className="w-3 h-3 mr-1" /> Saved</>
                ) : saving === key ? (
                  "Saving..."
                ) : (
                  <><Save className="w-3 h-3 mr-1" /> Save</>
                )}
              </Button>
            </div>
            <div className="space-y-2">
              {questions.map((q, i) => (
                <div key={q.id} className="flex items-start gap-2 group">
                  <GripVertical className="w-4 h-4 text-muted-foreground/30 mt-2.5 flex-shrink-0" />
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={q.text}
                      onChange={(e) => updateQuestion(key, i, "text", e.target.value)}
                      placeholder="Question text..."
                      className="text-[13px] flex-1"
                    />
                    <select
                      value={q.type}
                      onChange={(e) => updateQuestion(key, i, "type", e.target.value)}
                      className="text-[12px] bg-secondary rounded-lg px-2 h-9 border-0"
                    >
                      <option value="text">Text</option>
                      <option value="yesno">Yes/No</option>
                      <option value="number">Number</option>
                      <option value="textarea">Long text</option>
                    </select>
                    <label className="flex items-center gap-1 text-[11px] text-muted-foreground whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={q.optional ?? false}
                        onChange={(e) => updateQuestion(key, i, "optional", e.target.checked)}
                        className="rounded"
                      />
                      Optional
                    </label>
                  </div>
                  <button
                    onClick={() => removeQuestion(key, i)}
                    className="p-1.5 text-muted-foreground/40 hover:text-destructive transition-colors mt-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addQuestion(key)}
              className="mt-2 text-[12px] text-muted-foreground"
            >
              <Plus className="w-3 h-3 mr-1" /> Add question
            </Button>
          </div>
        );
      })}
    </main>
  );
}
