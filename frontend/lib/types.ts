export type FormStatus = "draft" | "published";

export type QuestionType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "dropdown"
  | "email"
  | "number"
  | "yes_no"
  | "rating";

export interface QuestionSettings {
  max_rating?: number;
  [key: string]: unknown;
}

export interface Question {
  id: string;
  form_id: string;
  question_text: string;
  description?: string;
  question_type: QuestionType;
  required: boolean;
  position: number;
  options?: string[];
  settings?: QuestionSettings;
}

export interface ThemeConfig {
  primary_color?: string;
  background_color?: string;
  [key: string]: unknown;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  status: FormStatus;
  public_slug?: string;
  response_count?: number;
  questions: Question[];
  theme_config?: ThemeConfig;
  thank_you_title?: string;
  thank_you_message?: string;
  created_at: string;
  updated_at: string;
}

export interface FormListItem {
  id: string;
  title: string;
  status: FormStatus;
  response_count: number;
  created_at: string;
  updated_at: string;
}

export interface PublishResponse {
  id: string;
  status: FormStatus;
  public_url: string;
}

export interface AnswerPayload {
  question_id: string;
  answer_value: string | number | string[] | boolean | null;
}

export interface ResponseSubmission {
  answers: AnswerPayload[];
  completion_time_seconds?: number;
}

export interface ResponseAnswer {
  question_id: string;
  question_text?: string;
  question_type?: QuestionType;
  answer_value: string | number | string[] | boolean | null;
}

export interface FormResponse {
  id: string;
  form_id: string;
  submitted_at: string;
  completion_time_seconds?: number;
  answers: ResponseAnswer[];
}

export interface QuestionStat {
  question_id: string;
  question_text: string;
  question_type: QuestionType;
  // multiple_choice / dropdown / yes_no
  option_counts?: Record<string, number>;
  // rating
  average?: number;
  distribution?: Record<string, number>;
  // number
  min?: number;
  max?: number;
  // text
  response_count?: number;
  recent_answers?: string[];
}

export interface FormStatistics {
  total_responses: number;
  average_completion_seconds?: number;
  questions: QuestionStat[];
}
