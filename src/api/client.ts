import type {
  ChatHistory,
  ChatSummary,
  CreateChatResponse,
  KnhanesFilesResponse,
  KnhanesGroundResponse,
  KnhanesQueryRequest,
  KnhanesQueryResponse,
} from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "";
const USERNAME_KEY = "competition_username";

function getCsrfValue(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)csrfValue=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function parseCurrentModel(response: string): string {
  const usingMatch = response.match(/using\s+(.+)$/i);
  if (usingMatch) return usingMatch[1].trim();
  const inList = response.trim();
  return inList;
}

export function matchModelToList(
  current: string,
  models: string[],
): string {
  const parsed = parseCurrentModel(current);
  const exact = models.find((m) => m === parsed);
  if (exact) return exact;
  const partial = models.find(
    (m) => parsed.includes(m) || m.includes(parsed),
  );
  return partial ?? parsed;
}

export function saveUsername(username: string) {
  sessionStorage.setItem(USERNAME_KEY, username);
}

export function loadUsername(): string | null {
  return sessionStorage.getItem(USERNAME_KEY);
}

export function clearUsername() {
  sessionStorage.removeItem(USERNAME_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      (data as { message?: string }).message ??
        `요청 실패 (${response.status})`,
    );
  }

  return data as T;
}

export const api = {
  signIn(email: string, password: string) {
    return request<{ message: string; username: string }>("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  signUp(email: string, username: string, password: string) {
    return request<{ message: string; role: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, username, password }),
    });
  },

  signOut() {
    return request<{ message: string }>("/auth/signout", {
      method: "DELETE",
    });
  },

  refresh() {
    const csrf = getCsrfValue();
    return request<{ message: string }>("/auth/refresh", {
      method: "PATCH",
      headers: csrf ? { "x-csrf-value": csrf } : {},
    });
  },

  checkEmail(email: string) {
    return request<{ message: string }>("/auth/check-email", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  listChats() {
    return request<ChatSummary[]>("/chat");
  },

  createChat(title: string) {
    return request<CreateChatResponse>("/chat", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
  },

  getChatHistory(chatId: string) {
    return request<ChatHistory>(`/chat/${chatId}`);
  },

  updateChat(chatId: string, title: string) {
    return request<CreateChatResponse | void>(`/chat/${chatId}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    });
  },

  deleteChat(chatId: string) {
    return request<void>(`/chat/${chatId}`, { method: "DELETE" });
  },

  saveMessage(chatId: string, text: string) {
    return request<unknown>(`/chat/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  },

  updateMessage(chatId: string, messageId: string, text: string) {
    return request<unknown>(`/chat/${chatId}/messages/${messageId}`, {
      method: "PATCH",
      body: JSON.stringify({ text }),
    });
  },

  deleteMessage(chatId: string, messageId: string) {
    return request<void>(`/chat/${chatId}/messages/${messageId}`, {
      method: "DELETE",
    });
  },

  sendToChatbot(chatId: string, text: string) {
    return request<string>("/chatbot", {
      method: "POST",
      body: JSON.stringify({ chatId, text }),
    });
  },

  getAvailableModels() {
    return request<string[]>("/chatbot/available_models");
  },

  getCurrentModel() {
    return request<string>("/chatbot/model");
  },

  changeModel(model: string) {
    return request<{ message: string }>("/chatbot/model", {
      method: "PATCH",
      body: JSON.stringify({ model }),
    });
  },

  knhanesListFiles() {
    return request<KnhanesFilesResponse>("/knhanes/files");
  },

  knhanesQuery(body: KnhanesQueryRequest) {
    return request<KnhanesQueryResponse>("/knhanes/query", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  knhanesGround(body: { sex?: string; age?: string; income?: string }) {
    return request<KnhanesGroundResponse>("/knhanes/ground", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};

const AUTH_RETRY_MESSAGES = [
  "log in",
  "로그인",
  "Token has expired",
  "Please log in",
];

export async function withAuthRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (AUTH_RETRY_MESSAGES.some((m) => message.includes(m))) {
      await api.refresh();
      return fn();
    }
    throw error;
  }
}
