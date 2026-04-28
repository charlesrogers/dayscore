"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, GripVertical, Clock, Save, Check, X } from "lucide-react";

interface Question {
  id: string;
  text: string;
  type: string;
  field: string;
  optional?: boolean;
}

interface CustomType {
  key: string;
  label: string;
}

interface Settings {
  questions: Record<string, Question[]>;
  schedule: Record<string, { time: string; days: string }>;
  customTypes: CustomType[];
}

const BUILT_IN_LABELS: Record<string, string> = {
  questions_morning: "Morning",
  questions_personal: "Personal Check-in",
  questions_work: "Work Check-in",
  questions_week: "Weekly Review",
  questions_month: "Monthly Review",
  questions_relationship: "Relationship Review",
  questions_nightcap: "Nightcap",
};

const BUILT_IN_ORDER = [
  "questions_morning",
  "questions_personal",
  "questions_work",
  "questions_week",
  "questions_month",
  "questions_relationship",
  "questions_nightcap",
];

const BUILT_IN_KEYS = new Set(["morning", "personal", "work", "week", "month", "relationship", "nightcap", "todo", "log"]);

function slugify(label: string): string {
  return label.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showAddType, setShowAddType] = useState(false);
  const [newTypeLabel, setNewTypeLabel] = useState("");
  const [creatingType, setCreatingType] = useState(false);

  const [dragSource, setDragSource] = useState<{ key: string; index: number } | null>(null);

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/settings");
    const data = await res.json();
    setSettings(data);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  async function persist(key: string, value: unknown) {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Save failed");
    }
  }

  async function saveQuestions(key: string) {
    if (!settings) return;
    setSaving(key);
    setError(null);
    try {
      await persist(key, settings.questions[key]);
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(null);
    }
  }

  function updateQuestion(key: string, index: number, field: keyof Question, value: string | boolean) {
    if (!settings) return;
    const updated = { ...settings };
    const questions = [...updated.questions[key]];
    questions[index] = { ...questions[index], [field]: value };
    updated.questions[key] = questions;
    setSettings(updated);
  }

  function removeQuestion(key: string, index: number) {
    if (!settings) return;
    const updated = { ...settings };
    const questions = [...updated.questions[key]];
    questions.splice(index, 1);
    updated.questions[key] = questions;
    setSettings(updated);
  }

  function addQuestion(key: string) {
    if (!settings) return;
    const updated = { ...settings };
    const questions = [...(updated.questions[key] ?? [])];
    const newId = `custom_${Date.now()}`;
    questions.push({ id: newId, text: "", type: "text", field: newId, optional: true });
    updated.questions[key] = questions;
    setSettings(updated);
  }

  function reorderQuestion(key: string, fromIdx: number, toIdx: number) {
    if (!settings) return;
    if (fromIdx === toIdx) return;
    const updated = { ...settings };
    const questions = [...updated.questions[key]];
    const [moved] = questions.splice(fromIdx, 1);
    questions.splice(toIdx, 0, moved);
    updated.questions[key] = questions;
    setSettings(updated);
  }

  async function createCustomType() {
    if (!settings) return;
    const label = newTypeLabel.trim();
    if (!label) {
      setError("Name is required");
      return;
    }
    const key = slugify(label);
    if (!key) {
      setError("Name must contain at least one letter or number");
      return;
    }
    if (BUILT_IN_KEYS.has(key)) {
      setError(`"${key}" is reserved — pick a different name`);
      return;
    }
    if (settings.customTypes.some((t) => t.key === key)) {
      setError(`"${key}" already exists`);
      return;
    }

    setCreatingType(true);
    setError(null);
    try {
      const newCustomTypes = [...settings.customTypes, { key, label }];
      await persist("custom_types", newCustomTypes);
      await persist(`questions_${key}`, []);

      const updated = { ...settings };
      updated.customTypes = newCustomTypes;
      updated.questions = { ...updated.questions, [`questions_${key}`]: [] };
      setSettings(updated);

      setNewTypeLabel("");
      setShowAddType(false);
    } catch (err) {
      setError(String(err));
    } finally {
      setCreatingType(false);
    }
  }

  async function deleteCustomType(key: string) {
    if (!settings) return;
    if (!confirm(`Delete check-in type "${key}"? Saved questions will be removed.`)) return;
    setError(null);
    try {
      const newCustomTypes = settings.customTypes.filter((t) => t.key !== key);
      await persist("custom_types", newCustomTypes);
      const updated = { ...settings };
      updated.customTypes = newCustomTypes;
      const newQuestions = { ...updated.questions };
      delete newQuestions[`questions_${key}`];
      updated.questions = newQuestions;
      setSettings(updated);
    } catch (err) {
      setError(String(err));
    }
  }

  if (!settings) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-[13px] text-muted-foreground">Loading settings...</p>
      </main>
    );
  }

  const customSettingKeys = settings.customTypes.map((t) => `questions_${t.key}`);
  const allKeys = [...BUILT_IN_ORDER, ...customSettingKeys];

  function labelFor(settingKey: string): string {
    if (BUILT_IN_LABELS[settingKey]) return BUILT_IN_LABELS[settingKey];
    const t = settings!.customTypes.find((ct) => `questions_${ct.key}` === settingKey);
    return t ? t.label : settingKey;
  }

  function isCustom(settingKey: string): boolean {
    return !BUILT_IN_LABELS[settingKey];
  }

  function customKey(settingKey: string): string | null {
    const t = settings!.customTypes.find((ct) => `questions_${ct.key}` === settingKey);
    return t ? t.key : null;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[20px] font-bold">Settings</h1>
        <Button
          size="sm"
          onClick={() => { setShowAddType(true); setError(null); }}
          className="text-[12px] h-8 active:translate-y-px"
        >
          <Plus className="w-3 h-3 mr-1" /> New Check-in Type
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 text-destructive text-[13px] px-4 py-2 mb-4">
          {error}
        </div>
      )}

      {showAddType && (
        <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-5 mb-6">
          <h2 className="text-[15px] font-semibold mb-3">New Check-in Type</h2>
          <div className="flex gap-2 items-center">
            <Input
              value={newTypeLabel}
              onChange={(e) => setNewTypeLabel(e.target.value)}
              placeholder="e.g. Workout Log"
              className="text-[13px] flex-1"
              onKeyDown={(e) => { if (e.key === "Enter") createCustomType(); }}
              autoFocus
            />
            <Button
              size="sm"
              onClick={createCustomType}
              disabled={creatingType}
              className="text-[12px] h-8 active:translate-y-px"
            >
              {creatingType ? "Creating..." : "Create"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setShowAddType(false); setNewTypeLabel(""); setError(null); }}
              className="text-[12px] h-8"
            >
              Cancel
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            Trigger via <code className="bg-secondary px-1 rounded">/api/start-checkin?type={newTypeLabel ? slugify(newTypeLabel) : "your_key"}</code> or the web check-in page. Add a scheduled cron later if you want it on a timer.
          </p>
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
          Schedule changes require a code deploy. Use Discord commands anytime: !checkin, !work, !week, !month, !relationship, !nightcap, !log, !todo, !commands
        </p>
      </div>

      {/* Question editors */}
      {allKeys.map((key) => {
        const questions = settings.questions[key];
        if (!questions) return null;
        return (
          <div key={key} className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-semibold">{labelFor(key)}</h2>
                {isCustom(key) && (
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-4xl">custom</span>
                )}
              </div>
              <div className="flex items-center gap-2">
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
                {isCustom(key) && (
                  <button
                    onClick={() => { const k = customKey(key); if (k) deleteCustomType(k); }}
                    className="p-1.5 text-muted-foreground/40 hover:text-destructive transition-colors"
                    title="Delete check-in type"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {questions.map((q, i) => {
                const isDragging = dragSource?.key === key && dragSource.index === i;
                return (
                  <div
                    key={q.id}
                    className={`flex items-start gap-2 group transition-opacity ${isDragging ? "opacity-40" : ""}`}
                    onDragOver={(e) => {
                      if (dragSource?.key === key) e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragSource?.key === key) {
                        reorderQuestion(key, dragSource.index, i);
                      }
                      setDragSource(null);
                    }}
                  >
                    <span
                      draggable
                      onDragStart={() => setDragSource({ key, index: i })}
                      onDragEnd={() => setDragSource(null)}
                      className="cursor-grab active:cursor-grabbing mt-2 flex-shrink-0 text-muted-foreground/40 hover:text-muted-foreground"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-4 h-4" />
                    </span>
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
                );
              })}
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
