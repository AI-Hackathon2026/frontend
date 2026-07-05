import { useEffect, useMemo, useState } from "react";
import { api, withAuthRetry } from "../../api/client";
import {
  DISEASE_LABELS,
  DISEASE_ORDER,
  getRiskColor,
  type DiseaseKey,
} from "../../constants/routine";
import type { HealthRecord, HealthStatus } from "../../types";
import {
  getAlcoholInsight,
  getBmiInsight,
  getSmokingInsight,
  insightSeverityColor,
  insightSeverityLabel,
  type HealthInsight,
} from "../../utils/healthInsights";
import { hasRoutineData } from "../../utils/routineData";
import { HealthRankingHero } from "./HealthRankingHero";

interface Props {
  fromGate?: boolean;
  refreshKey?: number;
  onRoutineStartClick: () => Promise<void>;
  onBack?: () => void;
  onUpdateHealthStatus?: () => void;
}

type RiskCard =
  | {
      key: DiseaseKey;
      label: string;
      kind: "insight";
      insight: HealthInsight;
    }
  | {
      key: DiseaseKey;
      label: string;
      kind: "rate";
      rate: number;
    };

function buildRiskCards(
  record: HealthRecord,
  healthStatus: HealthStatus | null,
): RiskCard[] {
  return DISEASE_ORDER.map((key) => {
    const label = DISEASE_LABELS[key];
    const rate = record.exposureRates[key as DiseaseKey] ?? 0;

    if (key === "SMOKING" && healthStatus) {
      return {
        key,
        label,
        kind: "insight" as const,
        insight: getSmokingInsight(healthStatus.smokeFreq),
      };
    }

    if (key === "ALCOHOL" && healthStatus) {
      return {
        key,
        label,
        kind: "insight" as const,
        insight: getAlcoholInsight(healthStatus.alcoholFreq),
      };
    }

    if (key === "OBESITY" && healthStatus) {
      return {
        key,
        label,
        kind: "insight" as const,
        insight: getBmiInsight(
          record.bmi,
          healthStatus.height,
          healthStatus.weight,
        ),
      };
    }

    return { key, label, kind: "rate" as const, rate };
  });
}

function riskLevel(rate: number) {
  if (rate >= 50) return "critical";
  if (rate >= 20) return "warning";
  if (rate > 0) return "caution";
  return "safe";
}

export function HealthRecordScreen({
  fromGate,
  refreshKey = 0,
  onRoutineStartClick,
  onBack,
  onUpdateHealthStatus,
}: Props) {
  const [record, setRecord] = useState<HealthRecord | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [hasRoutine, setHasRoutine] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");

    Promise.all([
      withAuthRetry(() => api.getHealthRecordMe()),
      withAuthRetry(() => api.getHealthStatus()).catch(() => null),
      withAuthRetry(() => api.getRoutineMe()).catch(() => null),
    ])
      .then(([data, status, routine]) => {
        if (!data) {
          setError(
            "건강 기록이 없습니다. 맞춤 루틴을 위해 건강 정보를 먼저 입력해 주세요.",
          );
          return;
        }
        setRecord(data);
        setHealthStatus(status);
        setHasRoutine(hasRoutineData(routine));
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "건강 기록을 불러올 수 없습니다.",
        );
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const riskCards = useMemo(
    () => (record ? buildRiskCards(record, healthStatus) : []),
    [record, healthStatus],
  );

  const sortedRateCards = useMemo(
    () =>
      [...riskCards].sort((a, b) => {
        const score = (card: RiskCard) =>
          card.kind === "rate"
            ? card.rate
            : card.insight.severity === "critical"
              ? 100
              : card.insight.severity === "warning"
                ? 70
                : card.insight.severity === "caution"
                  ? 40
                  : 0;
        return score(b) - score(a);
      }),
    [riskCards],
  );

  if (loading) {
    return (
      <div className="routine-gate">
        <div className="spinner" />
        <p>건강 현황 불러오는 중...</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="routine-page health-dashboard">
        <div className="banner-error">{error || "데이터 없음"}</div>
        <div className="health-dashboard-actions">
          {onUpdateHealthStatus && (
            <button
              type="button"
              className="primary-btn routine-cta-btn"
              onClick={onUpdateHealthStatus}
            >
              건강 정보 입력하기
            </button>
          )}
          {onBack && (
            <button type="button" className="ghost-btn" onClick={onBack}>
              돌아가기
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="routine-page health-dashboard">
      <section className="health-dashboard-panel">
        <header className="health-dashboard-header">
          <div>
            <p className="health-dashboard-eyebrow">Health Intelligence</p>
            <h2>내 건강 현황</h2>
          </div>
          {!fromGate && onBack && (
            <button
              type="button"
              className="routine-future-btn routine-future-btn--ghost"
              onClick={onBack}
            >
              돌아가기
            </button>
          )}
        </header>

        <HealthRankingHero record={record} />

        <div className="health-dashboard-risks">
          <div className="health-dashboard-risks-head">
            <h3>질환 노출 위험도</h3>
            <span className="health-dashboard-risks-sub">동연령 대비 · KNHANES</span>
          </div>

          <ul className="health-risk-grid">
            {sortedRateCards.map((card) => {
              if (card.kind === "insight") {
                const { insight } = card;
                const color = insightSeverityColor(insight.severity);
                return (
                  <li
                    key={card.key}
                    className={`health-risk-card health-risk-card--${insight.severity}`}
                  >
                    <div className="health-risk-card-top">
                      <span className="health-risk-card-label">{card.label}</span>
                      <span
                        className="health-risk-card-value health-risk-card-value--status"
                        style={{ color }}
                      >
                        {insight.status}
                      </span>
                    </div>
                    <p className="health-risk-card-detail">{insight.detail}</p>
                    <span
                      className="health-risk-card-flag"
                      style={{ color }}
                    >
                      {insightSeverityLabel(insight.severity)}
                    </span>
                  </li>
                );
              }

              const level = riskLevel(card.rate);
              return (
                <li
                  key={card.key}
                  className={`health-risk-card health-risk-card--${level}`}
                >
                  <div className="health-risk-card-top">
                    <span className="health-risk-card-label">{card.label}</span>
                    <span
                      className="health-risk-card-value"
                      style={{ color: getRiskColor(card.rate) }}
                    >
                      {card.rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="health-risk-card-track">
                    <div
                      className="health-risk-card-fill"
                      style={{
                        width: `${Math.min(card.rate, 100)}%`,
                        background: `linear-gradient(90deg, ${getRiskColor(card.rate)}aa, ${getRiskColor(card.rate)})`,
                        boxShadow: `0 0 12px ${getRiskColor(card.rate)}55`,
                      }}
                    />
                  </div>
                  {level === "critical" || level === "warning" ? (
                    <span className="health-risk-card-flag">주의 필요</span>
                  ) : level === "safe" ? (
                    <span className="health-risk-card-flag health-risk-card-flag--safe">
                      양호
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <p className="health-dashboard-source">
            출처: 질병관리청 2024 국민건강영양조사
          </p>
        </div>

        <div className="health-dashboard-actions">
          {onUpdateHealthStatus && (
            <button
              type="button"
              className="routine-future-btn"
              onClick={onUpdateHealthStatus}
            >
              건강 정보 수정
            </button>
          )}
          <button
            type="button"
            className="routine-future-btn routine-future-btn--primary"
            disabled={starting}
            onClick={() => {
              setStarting(true);
              void onRoutineStartClick().finally(() => setStarting(false));
            }}
          >
            {starting
              ? "확인 중..."
              : hasRoutine
                ? "내 루틴 보기 →"
                : "루틴 시작하기 →"}
          </button>
        </div>
      </section>
    </div>
  );
}
