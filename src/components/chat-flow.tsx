"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { QUESTIONS } from "@/lib/questions";
import { CheckInInput, Question, calculateScore } from "@/lib/types";
import { ChatBubble } from "./chat-bubble";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Check, SkipForward, Send } from "lucide-react";

interface Message {
  sender: "bot" | "user";
  text: string;
}

const EMPTY_INPUT: CheckInInput = {
  date: "",
  weight: null,
  journaled: false,
  journal_detail: null,
  worked_out: false,
  workout_detail: null,
  built_shipped: null,
  felt_spirit: false,
  brightened_day: false,
  daily_journal: null,
};

export function ChatFlow({ date }: { date: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [answers, setAnswers] = useState<CheckInInput>({ ...EMPTY_INPUT, date });
  const [questionQueue, setQuestionQueue] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [started, setStarted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentQuestion, scrollToBottom]);

  // Start the flow
  useEffect(() => {
    if (started) return;
    setStarted(true);
    const queue = [...QUESTIONS];
    const greeting: Message = {
      sender: "bot",
      text: `Hey Charles, let's check in for ${date}.`,
    };
    setMessages([greeting]);

    // Show first question after a delay
    setTimeout(() => {
      const first = queue.shift()!;
      setQuestionQueue(queue);
      setCurrentQuestion(first);
      setMessages((prev) => [...prev, { sender: "bot", text: first.text }]);
    }, 500);
  }, [date, started]);

  // Focus input when question changes
  useEffect(() => {
    if (!currentQuestion) return;
    setTimeout(() => {
      if (currentQuestion.type === "textarea") {
        textareaRef.current?.focus();
      } else if (currentQuestion.type !== "yesno") {
        inputRef.current?.focus();
      }
    }, 350);
  }, [currentQuestion]);

  function advanceToNext(queue: Question[]) {
    if (queue.length === 0) {
      setCurrentQuestion(null);
      setDone(true);
      return;
    }
    const next = queue.shift()!;
    setQuestionQueue([...queue]);
    setCurrentQuestion(next);
    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "bot", text: next.text }]);
    }, 300);
  }

  function handleAnswer(value: string | boolean, displayText?: string) {
    if (!currentQuestion) return;

    // Add user message
    const text = displayText || String(value);
    setMessages((prev) => [...prev, { sender: "user", text }]);

    // Update answers
    const field = currentQuestion.field;
    const updatedAnswers = { ...answers };
    if (currentQuestion.type === "number") {
      (updatedAnswers as Record<string, unknown>)[field] = value === "" ? null : parseFloat(value as string);
    } else if (currentQuestion.type === "yesno") {
      (updatedAnswers as Record<string, unknown>)[field] = value;
    } else {
      (updatedAnswers as Record<string, unknown>)[field] = (value as string).trim() || null;
    }
    setAnswers(updatedAnswers);

    // Check for follow-up
    const newQueue = [...questionQueue];
    if (
      currentQuestion.followUp &&
      value === currentQuestion.followUp.condition
    ) {
      newQueue.unshift(currentQuestion.followUp.question as Question);
    }

    setInputValue("");
    advanceToNext(newQueue);
  }

  function handleNumberSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleAnswer(inputValue, inputValue ? `${inputValue} lbs` : "Skipped");
  }

  function handleTextSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentQuestion?.optional && !inputValue.trim()) return;
    handleAnswer(inputValue, inputValue.trim() || "Skipped");
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      if (res.ok) {
        setSaved(true);
      }
    } finally {
      setSaving(false);
    }
  }

  const score = calculateScore(answers);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <ChatBubble key={i} sender={msg.sender} animate={i > 0}>
            {msg.text}
          </ChatBubble>
        ))}

        {/* Summary card */}
        {done && !saved && (
          <div className="self-center w-full max-w-sm animate-bubble-in mt-4">
            <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[14px] font-semibold">Check-in Summary</h3>
                <span className="text-[12px] font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-4xl">
                  {score}/6
                </span>
              </div>
              <div className="space-y-1.5 text-[12px]">
                {answers.weight && (
                  <p>
                    <span className="text-muted-foreground">Weight:</span>{" "}
                    <span className="font-medium">{answers.weight} lbs</span>
                  </p>
                )}
                <SummaryRow label="Journal" value={answers.journaled} detail={answers.journal_detail} />
                <SummaryRow label="Workout" value={answers.worked_out} detail={answers.workout_detail} />
                {answers.built_shipped && (
                  <p>
                    <span className="text-muted-foreground">Built/Shipped:</span>{" "}
                    <span className="font-medium">{answers.built_shipped}</span>
                  </p>
                )}
                <SummaryRow label="Felt the Spirit" value={answers.felt_spirit} />
                <SummaryRow label="Catherine's day" value={answers.brightened_day} />
                {answers.daily_journal && (
                  <div className="pt-1.5 border-t mt-2">
                    <p className="text-muted-foreground mb-0.5">Journal:</p>
                    <p className="font-medium whitespace-pre-wrap">{answers.daily_journal}</p>
                  </div>
                )}
              </div>
              <Button
                className="w-full mt-4 active:translate-y-px"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Check-in"}
              </Button>
            </div>
          </div>
        )}

        {/* Saved confirmation */}
        {saved && (
          <div className="self-center animate-bubble-in mt-2">
            <div className="flex items-center gap-2 text-[13px] text-emerald-600 dark:text-emerald-400 font-medium">
              <Check className="w-4 h-4" />
              Saved! <a href="/" className="underline text-primary">View Dashboard</a>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      {currentQuestion && !done && (
        <div className="border-t bg-card px-4 py-3 animate-bubble-in">
          {currentQuestion.type === "yesno" && (
            <div className="flex gap-2 justify-center">
              <Button
                variant="default"
                className="flex-1 max-w-[140px] active:translate-y-px"
                onClick={() => handleAnswer(true, "Yes")}
              >
                Yes
              </Button>
              <Button
                variant="secondary"
                className="flex-1 max-w-[140px] active:translate-y-px"
                onClick={() => handleAnswer(false, "No")}
              >
                No
              </Button>
            </div>
          )}

          {currentQuestion.type === "number" && (
            <form onSubmit={handleNumberSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                type="number"
                step="0.1"
                placeholder="e.g. 185.5"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon" className="active:translate-y-px">
                <Send className="w-4 h-4" />
              </Button>
              {currentQuestion.optional && (
                <Button type="button" variant="ghost" size="icon" onClick={() => handleAnswer("", "Skipped")}>
                  <SkipForward className="w-4 h-4" />
                </Button>
              )}
            </form>
          )}

          {currentQuestion.type === "text" && (
            <form onSubmit={handleTextSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                type="text"
                placeholder={currentQuestion.optional ? "Type or skip..." : "Type your answer..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon" className="active:translate-y-px">
                <Send className="w-4 h-4" />
              </Button>
              {currentQuestion.optional && (
                <Button type="button" variant="ghost" size="icon" onClick={() => handleAnswer("", "Skipped")}>
                  <SkipForward className="w-4 h-4" />
                </Button>
              )}
            </form>
          )}

          {currentQuestion.type === "textarea" && (
            <form onSubmit={handleTextSubmit} className="flex flex-col gap-2">
              <Textarea
                ref={textareaRef}
                placeholder="How was your day?"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2 justify-end">
                {currentQuestion.optional && (
                  <Button type="button" variant="ghost" onClick={() => handleAnswer("", "Skipped")}>
                    <SkipForward className="w-4 h-4 mr-1" /> Skip
                  </Button>
                )}
                <Button type="submit" className="active:translate-y-px">
                  <Send className="w-4 h-4 mr-1" /> Submit
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: boolean;
  detail?: string | null;
}) {
  return (
    <p className="flex items-center gap-1.5">
      <span
        className={
          value
            ? "text-emerald-500 dark:text-emerald-400"
            : "text-muted-foreground/30"
        }
      >
        {value ? "✓" : "✗"}
      </span>
      <span className="text-muted-foreground">{label}</span>
      {detail && (
        <span className="text-foreground font-medium ml-1">— {detail}</span>
      )}
    </p>
  );
}
