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
  kind?: "TEXT" | "ROUTINE";
  payload?: HealthRoutineResponse;
}

export type Sex = "M" | "F";

export interface HealthProfileInput {
  sex: Sex;
  ageGroup: string;
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
  waistCircumference?: number;
  systolicBp?: number;
  fastingGlucose?: number;
  smoking: boolean;
  drinkingFrequencyPerWeek: number;
  weeklyExerciseDays: number;
  stressLevel: 1 | 2 | 3 | 4 | 5;
  incomeLevel?: string;
}

export interface RoutinePercentileStat {
  metric: string;
  userValue: number | string;
  percentile: number;
  cohortAverage: number | string;
}

export interface HealthRoutineResponse {
  summary: string;
  dataBasis: {
    sourceLabel: string;
    cohort: string;
    percentiles: RoutinePercentileStat[];
  };
  weeklyPlan: Array<{
    day: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
    focus: string;
    items: string[];
  }>;
  cautions: string[];
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

export type AppTab = "chat" | "knhanes" | "healthcare" | "admin";

export type Gender = "male" | "female";
export type ObesityStatus = "obese" | "underweight" | "normal";
export type ConditionStatus = "positive" | "normal" | "unknown";

export interface HealthcareRequest {
  height: number;
  weight: number;
  age: number;
  gender: Gender;
  systolicBp?: number;
  diastolicBp?: number;
  onHypertensionMedication?: boolean;
  fastingBloodSugar?: number;
  hba1c?: number;
  onDiabetesMedication?: boolean;
  totalCholesterol?: number;
  onCholesterolMedication?: boolean;
}

export interface ConditionAssessment {
  status: ConditionStatus;
  label: string;
  criteria: string;
  vulnerabilityGuide: string | null;
  lifestyleGuide: string | null;
}

export interface ObesityAssessment extends Omit<ConditionAssessment, "status"> {
  status: ObesityStatus;
}

export interface HealthcareAssessmentResponse {
  bmi: number;
  obesity: ObesityAssessment;
  hypertension: ConditionAssessment;
  diabetes: ConditionAssessment;
  dyslipidemia: ConditionAssessment;
}

/** Raw shape returned by GET /files/rag/documents */
export interface RagDocument {
  name: string;        // e.g. "fileSearchStores/globalpdfstore-.../documents/bitcoinpdf-..."
  displayName: string; // e.g. "bitcoin.pdf"
}

export interface EmbeddingInfo {
  fileId: string;       // matches PdfFile id, or ragDocumentName when matched by filename
  filename?: string;
  chunkCount?: number;
  embeddedAt?: string;
  ragDocumentName?: string; // full path used for DELETE
  [key: string]: unknown;
}

export interface PdfFile {
  id?: string;
  fileId?: string;
  _id?: string;
  filename?: string;
  originalName?: string;
  storedName?: string;
  name?: string;
  size?: number;
  fileSize?: number;
  createdAt?: string;
  uploadedAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export function resolvePdfFileId(file: PdfFile): string {
  return (file.id ?? file.fileId ?? file._id ?? "") as string;
}

export function resolvePdfFileName(file: PdfFile): string {
  return (
    file.filename ??
    file.originalName ??
    file.storedName ??
    file.name ??
    resolvePdfFileId(file)
  ) as string;
}
