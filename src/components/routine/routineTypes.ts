export type RoutinePhase =
  | { name: "gate" }
  | { name: "healthStatus" }
  | { name: "healthRecord"; fromGate?: boolean; returnRoutineId?: string; returnChatId?: string }
  | { name: "difficulty" }
  | { name: "view"; routineId: string; chatId?: string; refreshKey?: number }
  | { name: "chat"; routineId: string; chatId: string };

export type RoutineNavigate = (phase: RoutinePhase) => void;
