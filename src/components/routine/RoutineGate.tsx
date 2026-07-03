import { useEffect } from "react";
import { api, withAuthRetry } from "../../api/client";
import type { RoutineNavigate } from "./routineTypes";

interface Props {
  onNavigate: RoutineNavigate;
}

export function RoutineGate({ onNavigate }: Props) {
  useEffect(() => {
    async function route() {
      try {
        const healthRecord = await withAuthRetry(() => api.getHealthRecordMe());

        if (!healthRecord) {
          onNavigate({ name: "healthStatus" });
          return;
        }

        const routine = await withAuthRetry(() => api.getRoutineMe());

        if (!routine) {
          onNavigate({ name: "healthRecord", fromGate: true });
          return;
        }

        onNavigate({
          name: "view",
          routineId: routine.id,
          chatId: routine.chats?.[0]?.id,
        });
      } catch {
        onNavigate({ name: "healthStatus" });
      }
    }

    void route();
  }, [onNavigate]);

  return (
    <div className="routine-gate">
      <div className="spinner" />
      <p>루틴 정보를 불러오는 중...</p>
    </div>
  );
}
