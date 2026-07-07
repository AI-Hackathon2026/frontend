export const LEVEL_LABELS: Record<number, string> = {
  1: "고도비만",
  2: "과체중",
  3: "약간 과체중",
  4: "정상 체중",
  5: "건강 체형",
  6: "운동선수",
};

export const LEVEL_COLORS: Record<number, string> = {
  1: "#ff5050",
  2: "#f0a030",
  3: "#f0c040",
  4: "#00c9a7",
  5: "#00c9a7",
  6: "#f0c040",
};

export const LEVEL_BADGES: Record<number, string[]> = {
  1: ["루틴 시작"],
  2: ["7일 연속", "첫 식단 완료"],
  3: ["21일 달성", "운동 10회"],
  4: ["한달 완주", "체중 감량"],
  5: ["3개월 달성", "만성질환 개선"],
  6: ["6개월 완주", "최고 건강"],
};

export const AVATAR_MAX_LEVEL = 6;
export const AVATAR_XP_PER_LEVEL = 100;
