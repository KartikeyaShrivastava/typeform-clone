import axios from "axios";
import type {
  Form,
  FormListItem,
  FormResponse,
  FormStatistics,
  PublishResponse,
  Question,
  ResponseSubmission,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error?.response?.data?.detail ??
      error?.response?.data?.message ??
      error?.message ??
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

// ---------- Forms ----------

export async function listForms(): Promise<FormListItem[]> {
  const { data } = await apiClient.get<FormListItem[]>("/forms");
  return data;
}

export async function createForm(payload: { title: string }): Promise<Form> {
  const { data } = await apiClient.post<Form>("/forms", payload);
  return data;
}

export async function getForm(formId: string): Promise<Form> {
  const { data } = await apiClient.get<Form>(`/forms/${formId}`);
  return data;
}

export async function updateForm(
  formId: string,
  payload: Partial<Pick<Form, "title" | "description" | "theme_config" | "thank_you_title" | "thank_you_message">>
): Promise<Form> {
  const { data } = await apiClient.patch<Form>(`/forms/${formId}`, payload);
  return data;
}

export async function deleteForm(formId: string): Promise<void> {
  await apiClient.delete(`/forms/${formId}`);
}

export async function duplicateForm(formId: string): Promise<Form> {
  const { data } = await apiClient.post<Form>(`/forms/${formId}/duplicate`);
  return data;
}

export async function publishForm(formId: string): Promise<PublishResponse> {
  const { data } = await apiClient.post<PublishResponse>(`/forms/${formId}/publish`);
  return data;
}

export async function unpublishForm(formId: string): Promise<PublishResponse> {
  const { data } = await apiClient.post<PublishResponse>(`/forms/${formId}/unpublish`);
  return data;
}

// ---------- Questions ----------

export async function createQuestion(
  formId: string,
  payload: Partial<Omit<Question, "id" | "form_id">>
): Promise<Question> {
  const { data } = await apiClient.post<Question>(`/forms/${formId}/questions`, payload);
  return data;
}

export async function updateQuestion(
  questionId: string,
  payload: Partial<Omit<Question, "id" | "form_id">>
): Promise<Question> {
  const { data } = await apiClient.patch<Question>(`/questions/${questionId}`, payload);
  return data;
}

export async function deleteQuestion(questionId: string): Promise<void> {
  await apiClient.delete(`/questions/${questionId}`);
}

export async function reorderQuestions(formId: string, questionIds: string[]): Promise<void> {
  await apiClient.post(`/forms/${formId}/questions/reorder`, { question_ids: questionIds });
}

// ---------- Public ----------

export async function getPublicForm(slug: string): Promise<Form> {
  const { data } = await apiClient.get<Form>(`/public/forms/${slug}`);
  return data;
}

export async function submitResponse(slug: string, payload: ResponseSubmission): Promise<void> {
  await apiClient.post(`/public/forms/${slug}/responses`, payload);
}

// ---------- Results ----------

export async function listResponses(
  formId: string,
  page = 1,
  pageSize = 20
): Promise<{ items: FormResponse[]; total: number }> {
  const { data } = await apiClient.get(`/forms/${formId}/responses`, {
    params: { page, limit: pageSize },
  });
  if (Array.isArray(data)) return { items: data, total: data.length };
  return { items: data.items ?? data.results ?? [], total: data.total ?? (data.items ?? []).length };
}

export async function getResponse(formId: string, responseId: string): Promise<FormResponse> {
  const { data } = await apiClient.get<FormResponse>(`/forms/${formId}/responses/${responseId}`);
  return data;
}

export async function getStatistics(formId: string): Promise<FormStatistics> {
  const { data } = await apiClient.get(`/forms/${formId}/statistics`);

  // Normalize backend's nested statistics structure into the flat QuestionStat shape
  const questions = (data.questions ?? []).map((q: any) => {
    const s = q.statistics ?? {};
    const flat: any = {
      question_id: q.question_id,
      question_text: q.question_text,
      question_type: q.question_type,
    };

    const qt = q.question_type as string;

    if (qt === "multiple_choice" || qt === "dropdown") {
      flat.option_counts = s.counts ?? {};
    } else if (qt === "yes_no") {
      flat.option_counts = {
        Yes: s.true_count ?? 0,
        No: s.false_count ?? 0,
      };
    } else if (qt === "rating") {
      flat.average = s.average ?? null;
      flat.distribution = s.distribution ?? {};
    } else if (qt === "number") {
      flat.min = s.min ?? null;
      flat.max = s.max ?? null;
      flat.average = s.average ?? null;
    } else {
      // short_text, long_text, email
      flat.response_count = s.answered_count ?? 0;
      flat.recent_answers = s.recent_answers ?? [];
    }

    return flat;
  });

  return {
    total_responses: data.total_responses ?? 0,
    average_completion_seconds: data.average_completion_seconds,
    questions,
  };
}
