export type DiseaseKey =
  | "OBESITY"
  | "HYPERTENSION"
  | "DIABETES"
  | "SMOKING"
  | "ALCOHOL"
  | "STRESS";

export const DIFFICULTY_LABELS = {
  EASY: "입문",
  MODERATE: "표준",
  HARD: "고강도",
} as const;

export const DIFFICULTY_FREQUENCY = {
  EASY: "주 2회",
  MODERATE: "주 5회",
  HARD: "매일",
} as const;

export const DISEASE_LABELS: Record<DiseaseKey, string> = {
  OBESITY: "비만",
  HYPERTENSION: "고혈압",
  DIABETES: "당뇨병",
  SMOKING: "흡연",
  ALCOHOL: "음주",
  STRESS: "스트레스",
};

export const DISEASE_ORDER: DiseaseKey[] = [
  "OBESITY",
  "STRESS",
  "HYPERTENSION",
  "ALCOHOL",
  "DIABETES",
  "SMOKING",
];

export function getRiskColor(rate: number): string {
  if (rate >= 40) return "#E05C5C";
  if (rate >= 20) return "#E8883A";
  return "#2E9E6B";
}

export function getHighestRiskDisease(
  rates: Record<string, number>,
): DiseaseKey {
  let maxKey: DiseaseKey = "OBESITY";
  let maxVal = -1;
  for (const key of DISEASE_ORDER) {
    const val = rates[key] ?? 0;
    if (val > maxVal) {
      maxVal = val;
      maxKey = key;
    }
  }
  return maxKey;
}

export const STARTER_PROMPTS = [
  "오늘 운동을 더 쉽게 바꿔줘",
  "나트륨 줄이는 식단 팁 알려줘",
  "이 루틴에서 가장 중요한 게 뭐야?",
  "이번 주 루틴 체크했어",
];
