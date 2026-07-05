import type { Gender, RoutineDifficulty } from "../../../types";
import type { RoutineProgress } from "../../../utils/routineProgress";
import { RoutineAvatar } from "../RoutineAvatar";
import { RoutineCharacter } from "../RoutineCharacter";
import { DifficultyBadge } from "./DifficultyBadge";

interface Props {
  difficulty: RoutineDifficulty;
  summary: string;
  hasInfo: boolean;
  progress: RoutineProgress;
  gender: Gender;
  bmi: number;
  obesityRate: number;
  onHealthRecord: () => void;
  onOpenInfo: () => void;
}

export function RoutineViewHeader({
  difficulty,
  summary,
  hasInfo,
  progress,
  gender,
  bmi,
  obesityRate,
  onHealthRecord,
  onOpenInfo,
}: Props) {
  return (
    <header className="routine-v2-header">
      <div className="routine-v2-header-top">
        <div className="routine-v2-header-title-row">
          <h1 className="routine-v2-header-title">나의 루틴</h1>
          <DifficultyBadge difficulty={difficulty} />
        </div>
        <button
          type="button"
          className="routine-v2-health-btn"
          onClick={onHealthRecord}
        >
          내 건강 현황
        </button>
      </div>

      <div className="routine-v2-header-hero">
        <div className="routine-v2-header-avatar">
          <RoutineAvatar
            gender={gender}
            bmi={bmi}
            obesityRate={obesityRate}
            progress={progress}
            size="lg"
          />
        </div>
        <div className="routine-v2-header-hero-meta">
          <RoutineCharacter
            progress={progress}
            gender={gender}
            bmi={bmi}
            obesityRate={obesityRate}
            showAvatar={false}
          />
          {summary && (
            <div className="routine-v2-header-summary-row">
              <p className="routine-v2-header-summary">{summary}</p>
              {hasInfo && (
                <button
                  type="button"
                  className="routine-v2-info-btn"
                  aria-label="루틴 설명 보기"
                  onClick={onOpenInfo}
                >
                  ⓘ
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
