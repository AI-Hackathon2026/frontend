import type { RoutinePhase } from "./routineTypes";

export function routinePhaseKey(phase: RoutinePhase): string {
  switch (phase.name) {
    case "gate":
      return "gate";
    case "healthStatus":
      return "healthStatus";
    case "healthRecord":
      return phase.fromGate
        ? "healthRecord-gate"
        : `healthRecord-${phase.returnRoutineId ?? "back"}`;
    case "difficulty":
      return "difficulty";
    case "view":
      return `view-${phase.routineId}-${phase.refreshKey ?? 0}`;
    case "chat":
      return `chat-${phase.routineId}-${phase.chatId}`;
    default:
      return "unknown";
  }
}
