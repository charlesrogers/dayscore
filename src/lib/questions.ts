import { Question } from "./types";

export const QUESTIONS: Question[] = [
  {
    id: "weight",
    text: "Weight?",
    type: "number",
    field: "weight",
  },
  {
    id: "journaled",
    text: "Did you journal?",
    type: "yesno",
    field: "journaled",
    followUp: {
      condition: true,
      question: {
        id: "journal_detail",
        text: "What about?",
        type: "text",
        field: "journal_detail",
      },
    },
  },
  {
    id: "worked_out",
    text: "Did you workout?",
    type: "yesno",
    field: "worked_out",
    followUp: {
      condition: true,
      question: {
        id: "workout_detail",
        text: "What did you do?",
        type: "text",
        field: "workout_detail",
      },
    },
  },
  {
    id: "built_shipped",
    text: "What did you build/ship?",
    type: "text",
    field: "built_shipped",
    optional: true,
  },
  {
    id: "felt_spirit",
    text: "Did you feel the Spirit?",
    type: "yesno",
    field: "felt_spirit",
  },
  {
    id: "brightened_day",
    text: "Did you make Catherine's day bright?",
    type: "yesno",
    field: "brightened_day",
  },
  {
    id: "daily_journal",
    text: "Daily journal entry (or skip):",
    type: "textarea",
    field: "daily_journal",
    optional: true,
  },
];
