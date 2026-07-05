import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api, withAuthRetry } from "../../api/client";
import type { Gender, Routine, RoutineDifficulty } from "../../types";
import {
  getDefaultAvatarProfile,
  type AvatarProfile,
} from "../../utils/avatarAppearance";
import {
  computeRoutineProgress,
  countCompletedTasks,
  type RoutineProgress,
} from "../../utils/routineProgress";
import {
  daysUntilRoutineRefresh,
  getRoutineWeekAnchor,
  isRoutineWeekExpired,
  resetRoutineWeekAnchor,
  simulateWeekElapsedForTest,
} from "../../utils/routineWeek";
import { ExerciseRoutineTracker } from "./ExerciseRoutineTracker";
import { LevelUpModal } from "./LevelUpModal";
import { NutritionRoutineTracker } from "./NutritionRoutineTracker";
import { RoutineGeneratingOverlay } from "./RoutineGeneratingOverlay";
import { RoutineReadyOverlay } from "./RoutineReadyOverlay";
import { RoutineChatFabPopup } from "./RoutineChatFabPopup";
import { ProgressSummaryCard } from "./view/ProgressSummaryCard";
import { RoutineInfoSheet } from "./view/RoutineInfoSheet";
import { RoutinePlanTabBar } from "./view/RoutinePlanTabBar";
import { RoutineViewHeader } from "./view/RoutineViewHeader";

import type { RoutinePlanTab } from "./RoutinePlanTabSlider";

interface Props {
  routineId: string;
  chatId?: string;
  refreshKey?: number;
  onChangeDifficulty: (previousDifficulty: RoutineDifficulty) => void;
  onViewHealthRecord: () => void;
  onRoutineDeleted: () => void;
}

export function RoutineViewScreen({
  routineId,
  chatId: initialChatId,
  refreshKey = 0,
  onChangeDifficulty,
  onViewHealthRecord,
  onRoutineDeleted,
}: Props) {
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [avatarProfile, setAvatarProfile] = useState<AvatarProfile>(
    getDefaultAvatarProfile(),
  );
  const [activeTab, setActiveTab] = useState<RoutinePlanTab>("nutrition");
  const [infoOpen, setInfoOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [updatingPlanId, setUpdatingPlanId] = useState<string | null>(null);
  const [levelUp, setLevelUp] = useState<RoutineProgress | null>(null);
  const [weekOverlayPhase, setWeekOverlayPhase] = useState<
    "hidden" | "generating" | "ready"
  >("hidden");
  const [weekRefreshDifficulty, setWeekRefreshDifficulty] =
    useState<RoutineDifficulty | null>(null);
  const weekCheckDoneRef = useRef(false);

  const refreshRoutineForNewWeek = useCallback(async (current: Routine) => {
    setWeekOverlayPhase("generating");
    setWeekRefreshDifficulty(current.difficulty);
    setError("");
    try {
      await withAuthRetry(() =>
        api.replaceRoutineMe({ difficulty: current.difficulty }),
      );
      resetRoutineWeekAnchor(current.id);
      const data = await withAuthRetry(() => api.getRoutineMe());
      if (data) setRoutine(data);
      setWeekOverlayPhase("ready");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "새 주차 루틴을 불러올 수 없습니다.",
      );
      setWeekOverlayPhase("hidden");
      setWeekRefreshDifficulty(null);
    }
  }, []);

  function dismissWeekReadyOverlay() {
    setWeekOverlayPhase("hidden");
    setWeekRefreshDifficulty(null);
  }

  useEffect(() => {
    weekCheckDoneRef.current = false;
  }, [routineId, refreshKey]);

  useEffect(() => {
    if (!routine?.id || weekCheckDoneRef.current) return;
    getRoutineWeekAnchor(routine.id);
    weekCheckDoneRef.current = true;
    if (isRoutineWeekExpired(routine.id)) {
      void refreshRoutineForNewWeek(routine);
    }
  }, [routine, refreshRoutineForNewWeek]);

  useEffect(() => {
    setLoading(true);
    setError("");

    async function load() {
      try {
        const [data, record, healthStatus] = await Promise.all([
          withAuthRetry(() => api.getRoutineMe()),
          withAuthRetry(() => api.getHealthRecordMe()),
          withAuthRetry(() => api.getHealthStatus()),
        ]);

        setRoutine(data);

        if (record || healthStatus) {
          setAvatarProfile({
            gender: (healthStatus?.gender ?? "MALE") as Gender,
            bmi: record?.bmi ?? 23,
            obesityRate: record?.exposureRates?.OBESITY ?? 0,
          });
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "루틴을 불러올 수 없습니다.",
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [routineId, refreshKey]);

  const hasExerciseTracker = (routine?.exerciseRoutine?.length ?? 0) > 0;
  const hasNutritionTracker = (routine?.nutritionRoutine?.length ?? 0) > 0;

  const taskCompletedCount = useMemo(
    () => (routine ? countCompletedTasks(routine) : 0),
    [routine],
  );

  const progress = useMemo(
    () => computeRoutineProgress(taskCompletedCount),
    [taskCompletedCount],
  );

  const nutritionStats = useMemo(() => {
    const meals =
      routine?.nutritionRoutine?.flatMap((day) => day.meals) ?? [];
    return {
      done: meals.filter((m) => m.isCompleted).length,
      total: meals.length,
    };
  }, [routine]);

  const workoutStats = useMemo(() => {
    const items = routine?.exerciseRoutine ?? [];
    return {
      done: items.filter((i) => i.isCompleted).length,
      total: items.length,
    };
  }, [routine]);

  async function refreshRoutineAfterTaskUpdate(wasCompleted: boolean) {
    const prevProgress = computeRoutineProgress(
      routine ? countCompletedTasks(routine) : 0,
    );

    const data = await withAuthRetry(() => api.getRoutineMe());
    setRoutine(data);

    if (!wasCompleted && data) {
      const newProgress = computeRoutineProgress(countCompletedTasks(data));
      if (newProgress.level > prevProgress.level) {
        setLevelUp(newProgress);
      }
    }
  }

  async function onToggleExercisePlan(planId: string, isCompleted: boolean) {
    setUpdatingPlanId(planId);
    setError("");
    try {
      await withAuthRetry(() =>
        api.updateExercisePlanProgress(planId, !isCompleted),
      );
      await refreshRoutineAfterTaskUpdate(isCompleted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "운동 루틴 저장 실패");
    } finally {
      setUpdatingPlanId(null);
    }
  }

  async function onToggleNutritionPlan(planId: string, isCompleted: boolean) {
    setUpdatingPlanId(planId);
    setError("");
    try {
      await withAuthRetry(() =>
        api.updateNutritionPlanProgress(planId, !isCompleted),
      );
      await refreshRoutineAfterTaskUpdate(isCompleted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "영양 루틴 저장 실패");
    } finally {
      setUpdatingPlanId(null);
    }
  }

  async function onDeleteRoutine() {
    if (
      !confirm(
        "루틴을 삭제하시겠습니까?\n식사·운동 계획은 모두 삭제되며, 캐릭터 성장 기록은 유지됩니다.",
      )
    ) {
      return;
    }

    setActionLoading(true);
    setError("");
    try {
      await withAuthRetry(() => api.deleteRoutineMe());
      onRoutineDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "루틴 삭제에 실패했습니다.");
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="routine-gate">
        <div className="spinner" />
        <p>루틴 불러오는 중...</p>
      </div>
    );
  }

  if (weekOverlayPhase === "generating") {
    return <RoutineGeneratingOverlay mode="change" />;
  }

  if (weekOverlayPhase === "ready" && weekRefreshDifficulty) {
    return (
      <RoutineReadyOverlay
        mode="change"
        difficulty={weekRefreshDifficulty}
        onContinue={dismissWeekReadyOverlay}
      />
    );
  }

  if (!routine) {
    return (
      <div className="routine-page">
        <div className="banner-error">{error || "루틴을 찾을 수 없습니다."}</div>
      </div>
    );
  }

  const activeChatId = initialChatId ?? routine?.chats?.[0]?.id;
  const summaryText = routine.summary || routine.title;
  const readme = routine.reportReadme?.trim() ?? "";

  return (
    <div className="routine-page routine-page--view routine-page--v2">
      {error && <div className="banner-error">{error}</div>}

      {levelUp && (
        <LevelUpModal
          progress={levelUp}
          gender={avatarProfile.gender}
          bmi={avatarProfile.bmi}
          obesityRate={avatarProfile.obesityRate}
          onDismiss={() => setLevelUp(null)}
        />
      )}

      <RoutineViewHeader
        difficulty={routine.difficulty}
        summary={summaryText}
        hasInfo={Boolean(readme)}
        progress={progress}
        gender={avatarProfile.gender}
        bmi={avatarProfile.bmi}
        obesityRate={avatarProfile.obesityRate}
        onHealthRecord={onViewHealthRecord}
        onOpenInfo={() => setInfoOpen(true)}
      />

      <ProgressSummaryCard
        nutritionDone={nutritionStats.done}
        nutritionTotal={nutritionStats.total}
        workoutDone={workoutStats.done}
        workoutTotal={workoutStats.total}
      />

      <RoutinePlanTabBar activeTab={activeTab} onChange={setActiveTab} />

      <div className="routine-v2-tab-panel" role="tabpanel">
        {activeTab === "nutrition" ? (
          hasNutritionTracker ? (
            <NutritionRoutineTracker
              days={routine.nutritionRoutine!}
              updatingPlanId={updatingPlanId}
              onToggle={(planId, isCompleted) =>
                void onToggleNutritionPlan(planId, isCompleted)
              }
            />
          ) : (
            <div className="routine-v2-legacy-text">{routine.nutritionPlan}</div>
          )
        ) : hasExerciseTracker ? (
          <ExerciseRoutineTracker
            items={routine.exerciseRoutine!}
            updatingPlanId={updatingPlanId}
            onToggle={(planId, isCompleted) =>
              void onToggleExercisePlan(planId, isCompleted)
            }
          />
        ) : (
          <div className="routine-v2-legacy-text">{routine.workoutPlan}</div>
        )}
      </div>

      <p className="routine-v2-week-note">
        다음 루틴 갱신까지 {daysUntilRoutineRefresh(routine.id)}일
        <button
          type="button"
          className="routine-week-test-btn"
          disabled={weekOverlayPhase !== "hidden" || actionLoading}
          onClick={() => {
            simulateWeekElapsedForTest(routine.id);
            void refreshRoutineForNewWeek(routine);
          }}
        >
          [테스트] 1주 경과
        </button>
      </p>

      <div className="routine-v2-actions">
        <button
          type="button"
          className="routine-v2-action-btn"
          disabled={actionLoading}
          onClick={() => onChangeDifficulty(routine.difficulty)}
        >
          난이도 변경
        </button>
        <button
          type="button"
          className="routine-v2-action-btn routine-v2-action-btn--danger"
          disabled={actionLoading}
          onClick={() => void onDeleteRoutine()}
        >
          루틴 삭제
        </button>
      </div>

      <RoutineInfoSheet
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        content={readme}
      />

      {activeChatId && (
        <RoutineChatFabPopup
          routineId={routine.id}
          chatId={activeChatId}
          onRoutineUpdated={() => {
            void withAuthRetry(() => api.getRoutineMe()).then((data) => {
              if (data) setRoutine(data);
            });
          }}
        />
      )}
    </div>
  );
}
