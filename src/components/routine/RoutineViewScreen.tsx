import { useCallback, useEffect, useState } from "react";
import { api, withAuthRetry } from "../../api/client";
import { DIFFICULTY_LABELS } from "../../constants/routine";
import type { Routine, RoutineLog } from "../../types";
import { RoutineLogCalendar } from "./RoutineLogCalendar";

type ViewTab = "nutrition" | "workout" | "log";

interface Props {
  routineId: string;
  chatId?: string;
  onOpenChat: (routineId: string, chatId: string) => void;
  onRegenerate: () => void;
  onViewHealthRecord: () => void;
}

export function RoutineViewScreen({
  routineId,
  chatId: initialChatId,
  onOpenChat,
  onRegenerate,
  onViewHealthRecord,
}: Props) {
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [logs, setLogs] = useState<RoutineLog[]>([]);
  const [activeTab, setActiveTab] = useState<ViewTab>("nutrition");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadRoutine = useCallback(async () => {
    const data = await withAuthRetry(() => api.getRoutineMe());
    setRoutine(data);
    if (data) {
      const today = new Date().toISOString().slice(0, 10);
      const completedToday =
        data.logs?.some((l) => l.date.startsWith(today) && l.completed) ?? false;
      setTodayCompleted(completedToday);
    }
    return data;
  }, []);

  useEffect(() => {
    Promise.all([
      loadRoutine(),
      withAuthRetry(() => api.getRoutineLogs(routineId)),
    ])
      .then(([, logData]) => {
        setLogs(logData);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "루틴을 불러올 수 없습니다.",
        );
      })
      .finally(() => setLoading(false));
  }, [loadRoutine, routineId]);

  const chatId =
    initialChatId ?? routine?.chats?.[0]?.id;

  async function onMarkComplete() {
    setActionLoading(true);
    setError("");
    try {
      await withAuthRetry(() =>
        api.logRoutineCompletion(routineId, true),
      );
      setTodayCompleted(true);
      const logData = await withAuthRetry(() => api.getRoutineLogs(routineId));
      setLogs(logData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "기록 저장 실패");
    } finally {
      setActionLoading(false);
    }
  }

  async function onNewRoutine() {
    if (!confirm("현재 루틴을 비활성화하고 새 루틴을 만드시겠습니까?")) return;
    setActionLoading(true);
    setError("");
    try {
      await withAuthRetry(() => api.deactivateRoutine(routineId));
      onRegenerate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "루틴 비활성화 실패");
      setActionLoading(false);
    }
  }

  function onOpenChatClick() {
    if (!chatId) {
      setError("연결된 채팅을 찾을 수 없습니다.");
      return;
    }
    onOpenChat(routineId, chatId);
  }

  if (loading) {
    return (
      <div className="routine-gate">
        <div className="spinner" />
        <p>루틴 불러오는 중...</p>
      </div>
    );
  }

  if (!routine) {
    return (
      <div className="routine-page">
        <div className="banner-error">{error || "루틴을 찾을 수 없습니다."}</div>
      </div>
    );
  }

  return (
    <div className="routine-page">
      {error && <div className="banner-error">{error}</div>}

      <section className="routine-section routine-view">
        <header className="routine-view-header">
          <h2>나의 루틴</h2>
          <span className="routine-difficulty-badge">
            {DIFFICULTY_LABELS[routine.difficulty]}
          </span>
          <span className="routine-view-title">{routine.title}</span>
          <button
            type="button"
            className="ghost-btn routine-health-link"
            onClick={onViewHealthRecord}
          >
            내 건강 현황
          </button>
        </header>

        <div className="routine-view-tabs" role="tablist">
          {(
            [
              ["nutrition", "영양 계획"],
              ["workout", "운동 계획"],
              ["log", "기록"],
            ] as const
          ).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="routine-view-panel">
          {activeTab === "nutrition" && (
            <div className="routine-plan-text">{routine.nutritionPlan}</div>
          )}
          {activeTab === "workout" && (
            <div className="routine-plan-text">{routine.workoutPlan}</div>
          )}
          {activeTab === "log" && (
            <div className="routine-log-calendar">
              <RoutineLogCalendar logs={logs} />
              {logs.length === 0 ? (
                <p className="muted">아직 완료 기록이 없습니다.</p>
              ) : (
                <ul className="routine-log-list">
                  {logs.map((log) => (
                    <li
                      key={log.id ?? log.date}
                      className={log.completed ? "completed" : ""}
                    >
                      <span>{log.date.slice(0, 10)}</span>
                      <span>{log.completed ? "완료 ✓" : "미완료"}</span>
                    </li>
                  ))}
                </ul>
              )}
              {todayCompleted && (
                <p className="routine-log-today">오늘 루틴을 완료했습니다 ✓</p>
              )}
            </div>
          )}
        </div>

        <div className="routine-view-actions">
          <button
            type="button"
            className="primary-btn"
            disabled={todayCompleted || actionLoading}
            onClick={() => void onMarkComplete()}
          >
            {todayCompleted ? "오늘 완료됨 ✓" : "✅ 오늘 완료"}
          </button>
          <button
            type="button"
            className="ghost-btn"
            disabled={!chatId || actionLoading}
            onClick={onOpenChatClick}
          >
            💬 AI 멘토
          </button>
          <button
            type="button"
            className="ghost-btn"
            disabled={actionLoading}
            onClick={() => void onNewRoutine()}
          >
            🔄 새 루틴
          </button>
        </div>
      </section>
    </div>
  );
}
