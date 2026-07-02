import type { HealthRoutineResponse } from "../types";

const DAY_LABEL: Record<string, string> = {
  MON: "월", TUE: "화", WED: "수",
  THU: "목", FRI: "금", SAT: "토", SUN: "일",
};

interface RoutineCardProps {
  routine: HealthRoutineResponse;
  onAdjust?: () => void;
}

export function RoutineCard({ routine, onAdjust }: RoutineCardProps) {
  return (
    <div className="routine-card">
      {/* Summary */}
      <p className="routine-summary">{routine.summary}</p>

      {/* KNHANES percentile stats */}
      {routine.dataBasis.percentiles.length > 0 && (
        <section className="routine-stats">
          <h4 className="routine-stats-title">
            {routine.dataBasis.cohort} 대비 내 건강 지표
          </h4>
          <div className="routine-stats-table">
            <div className="routine-stat-row routine-stat-header">
              <span>지표</span>
              <span>내 값</span>
              <span>상위 %</span>
              <span>집단 평균</span>
            </div>
            {routine.dataBasis.percentiles.map((p) => (
              <div key={p.metric} className="routine-stat-row">
                <span className="routine-stat-metric">{p.metric}</span>
                <span>{p.userValue}</span>
                <span className="routine-stat-percentile">상위 {p.percentile}%</span>
                <span className="routine-stat-avg">{p.cohortAverage}</span>
              </div>
            ))}
          </div>
          <span className="routine-source">{routine.dataBasis.sourceLabel}</span>
        </section>
      )}

      {/* Weekly plan accordion */}
      <section className="routine-week">
        <h4 className="routine-week-title">주간 루틴 계획</h4>
        {routine.weeklyPlan.map((day) => (
          <details key={day.day} className="routine-day">
            <summary className="routine-day-summary">
              <span className="routine-day-label">{DAY_LABEL[day.day]}요일</span>
              <span className="routine-day-focus">{day.focus}</span>
            </summary>
            <ul className="routine-day-items">
              {day.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </details>
        ))}
      </section>

      {/* Cautions */}
      {routine.cautions.length > 0 && (
        <section className="routine-cautions">
          <h4 className="routine-cautions-title">⚠ 주의사항</h4>
          <ul className="routine-cautions-list">
            {routine.cautions.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Adjust button */}
      {onAdjust && (
        <button
          type="button"
          className="routine-adjust-btn"
          onClick={onAdjust}
        >
          이 루틴 조정하기 →
        </button>
      )}
    </div>
  );
}
