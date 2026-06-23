export interface ChatSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  from: "USER" | "AI";
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
}

export interface CreateChatResponse {
  id?: string;
  userId?: string;
  title: string;
}

export interface KnhanesFilters {
  sex?: string;
  age?: string;
  income?: string;
}

export interface KnhanesQueryRequest {
  fileName: string;
  metric: string;
  filters?: KnhanesFilters;
  userValue?: number;
}

export interface KnhanesSourceInfo {
  file: string;
  sheet: string;
  rowIndex?: number;
  colIndex?: number;
  raw: unknown;
}

export interface KnhanesQueryResponse {
  metricName: string;
  nationalAverage: number | null;
  source: KnhanesSourceInfo;
  userDeviation?: number;
  userDeviationPercent?: number;
}

export interface KnhanesFilesResponse {
  files: string[];
}

export interface KnhanesFinding {
  available: boolean;
  value?: number | null;
  raw?: unknown;
  message?: string;
}

export interface KnhanesRoutine {
  title: string;
  week: string[];
  reason: string;
}

export interface KnhanesGroundResponse {
  demographics: KnhanesFilters;
  findings: {
    mealSkip?: KnhanesFinding;
    protein?: KnhanesFinding;
    calories?: KnhanesFinding;
  };
  routine: KnhanesRoutine | null;
}

export type AppTab = "chat" | "knhanes";
