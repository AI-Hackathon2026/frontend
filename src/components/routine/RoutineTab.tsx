import { useCallback, useState } from "react";
import { ScreenTransition } from "../ScreenTransition";
import { RoutineGate } from "./RoutineGate";
import { HealthStatusForm } from "./HealthStatusForm";
import { HealthRecordScreen } from "./HealthRecordScreen";
import { DifficultyPickerScreen } from "./DifficultyPickerScreen";
import { RoutineViewScreen } from "./RoutineViewScreen";
import { RoutineChatScreen } from "./RoutineChatScreen";
import { routinePhaseKey } from "./routinePhaseKey";
import type { RoutinePhase } from "./routineTypes";

export function RoutineTab() {
  const [phase, setPhase] = useState<RoutinePhase>({ name: "gate" });
  const [viewRefreshKey, setViewRefreshKey] = useState(0);

  const navigate = useCallback((next: RoutinePhase) => {
    setPhase(next);
  }, []);

  function renderPhase() {
    switch (phase.name) {
      case "gate":
        return <RoutineGate onNavigate={navigate} />;
      case "healthStatus":
        return (
          <HealthStatusForm
            onComplete={() => navigate({ name: "healthRecord", fromGate: true })}
          />
        );
      case "healthRecord":
        return (
          <HealthRecordScreen
            fromGate={phase.fromGate}
            onStartRoutine={() => navigate({ name: "difficulty" })}
            onBack={
              phase.fromGate
                ? undefined
                : () =>
                    navigate({
                      name: "view",
                      routineId: phase.returnRoutineId!,
                      chatId: phase.returnChatId,
                      refreshKey: viewRefreshKey,
                    })
            }
          />
        );
      case "difficulty":
        return (
          <DifficultyPickerScreen
            onGenerated={(routineId, chatId) =>
              navigate({ name: "view", routineId, chatId })
            }
          />
        );
      case "view":
        return (
          <RoutineViewScreen
            key={`${phase.routineId}-${phase.refreshKey ?? 0}`}
            routineId={phase.routineId}
            chatId={phase.chatId}
            onOpenChat={(routineId, chatId) =>
              navigate({ name: "chat", routineId, chatId })
            }
            onRegenerate={() => navigate({ name: "difficulty" })}
            onViewHealthRecord={() =>
              navigate({
                name: "healthRecord",
                fromGate: false,
                returnRoutineId: phase.routineId,
                returnChatId: phase.chatId,
              })
            }
          />
        );
      case "chat":
        return (
          <RoutineChatScreen
            routineId={phase.routineId}
            chatId={phase.chatId}
            onBack={() =>
              navigate({
                name: "view",
                routineId: phase.routineId,
                chatId: phase.chatId,
                refreshKey: viewRefreshKey,
              })
            }
            onRoutineUpdated={() => {
              const next = viewRefreshKey + 1;
              setViewRefreshKey(next);
              navigate({
                name: "view",
                routineId: phase.routineId,
                chatId: phase.chatId,
                refreshKey: next,
              });
            }}
          />
        );
      default:
        return null;
    }
  }

  return (
    <ScreenTransition
      screenKey={routinePhaseKey(phase)}
      className="routine-tab-transition"
    >
      {renderPhase()}
    </ScreenTransition>
  );
}
