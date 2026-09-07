import {
  Type,
  AlignLeft,
  ListChecks,
  ChevronDownSquare,
  Mail,
  Hash,
  ToggleLeft,
  Star,
  type LucideIcon,
} from "lucide-react";
import type { QuestionType } from "./types";

export interface QuestionTypeMeta {
  type: QuestionType;
  label: string;
  icon: LucideIcon;
  hasOptions: boolean;
  hint: string;
}

export const QUESTION_TYPES: QuestionTypeMeta[] = [
  { type: "short_text", label: "Short text", icon: Type, hasOptions: false, hint: "A single line answer" },
  { type: "long_text", label: "Long text", icon: AlignLeft, hasOptions: false, hint: "A paragraph answer" },
  { type: "multiple_choice", label: "Multiple choice", icon: ListChecks, hasOptions: true, hint: "Pick one option" },
  { type: "dropdown", label: "Dropdown", icon: ChevronDownSquare, hasOptions: true, hint: "Choose from a list" },
  { type: "email", label: "Email", icon: Mail, hasOptions: false, hint: "Validated email address" },
  { type: "number", label: "Number", icon: Hash, hasOptions: false, hint: "Numeric answer" },
  { type: "yes_no", label: "Yes / No", icon: ToggleLeft, hasOptions: false, hint: "A simple choice" },
  { type: "rating", label: "Rating", icon: Star, hasOptions: false, hint: "A scale, like stars" },
];

export function getQuestionTypeMeta(type: QuestionType): QuestionTypeMeta {
  return QUESTION_TYPES.find((q) => q.type === type) ?? QUESTION_TYPES[0];
}
