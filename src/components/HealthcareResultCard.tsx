import type { ObesityAssessment, ConditionAssessment } from "../types";
import { getStatusBadgeClass } from "../utils/healthcare";

interface HealthcareResultCardProps {
  title: string;
  data: ObesityAssessment | ConditionAssessment;
}

export function HealthcareResultCard({ title, data }: HealthcareResultCardProps) {
  const badgeClass = getStatusBadgeClass(data.status);
  const isUnknown = data.status === "unknown";

  return (
    <article className={`healthcare-result-card healthcare-result-card--${badgeClass}`}>
      <header className="healthcare-result-header">
        <h3>{title}</h3>
        <div className="healthcare-result-badges">
          <span className={`healthcare-status-badge healthcare-status-badge--${badgeClass}`}>
            {data.label}
          </span>
          {isUnknown && (
            <span className="healthcare-unknown-hint">검사 항목 미입력</span>
          )}
        </div>
        <button
          type="button"
          className="healthcare-criteria-btn"
          title={data.criteria}
          aria-label={`${title} 판정 기준: ${data.criteria}`}
        >
          ⓘ
        </button>
      </header>

      <p className="healthcare-criteria">{data.criteria}</p>

      {data.vulnerabilityGuide && (
        <div className="healthcare-guide-block healthcare-guide-block--stats">
          <h4>동년배 대비</h4>
          <p>{data.vulnerabilityGuide}</p>
        </div>
      )}

      {data.lifestyleGuide && (
        <div className="healthcare-guide-block healthcare-guide-block--action">
          <h4>생활습관 가이드</h4>
          <p>{data.lifestyleGuide}</p>
        </div>
      )}
    </article>
  );
}
