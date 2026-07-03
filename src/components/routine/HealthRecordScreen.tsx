import { useEffect, useMemo, useState } from "react";
import { api, withAuthRetry } from "../../api/client";
import {
  DISEASE_LABELS,
  DISEASE_ORDER,
  getRiskColor,
  type DiseaseKey,
} from "../../constants/routine";
import type { HealthRecord } from "../../types";

interface Props {
  fromGate?: boolean;
  onStartRoutine: () => void;
  onBack?: () => void;
}

function sortRates(record: HealthRecord) {
  return DISEASE_ORDER.map((key) => ({
    key,
    label: DISEASE_LABELS[key],
    rate: record.exposureRates[key as DiseaseKey] ?? 0,
  })).sort((a, b) => b.rate - a.rate);
}

export function HealthRecordScreen({ fromGate, onStartRoutine, onBack }: Props) {
  const [record, setRecord] = useState<HealthRecord | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    withAuthRetry(() => api.getHealthRecordMe())
      .then((data) => {
        if (!data) {
          setError("건강 기록을 찾을 수 없습니다.");
          return;
        }
        setRecord(data);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "건강 기록을 불러올 수 없습니다.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const sortedRates = useMemo(
    () => (record ? sortRates(record) : []),
    [record],
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
      <div className="routine-page">
        <div className="banner-error">{error || "데이터 없음"}</div>
        {onBack && (
          <button type="button" className="ghost-btn" onClick={onBack}>
            돌아가기
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="routine-page">
      <section className="routine-section">
        <div className="routine-section-header">
          <h2>내 건강 현황</h2>
          {!fromGate && onBack && (
            <button type="button" className="ghost-btn" onClick={onBack}>
              돌아가기
            </button>
          )}
        </div>

        <div className="routine-score-banner">
          <span className="routine-score-label">종합 건강 점수</span>
          <span className="routine-score-value">{record.overallScore}</span>
          <span className="routine-score-max">/ 100</span>
        </div>

        <div
          className="routine-score-gauge"
          style={{ "--score": `${record.overallScore}%` } as React.CSSProperties}
        >
          <div className="routine-score-gauge-fill" />
        </div>

        <h3 className="routine-subtitle">질환 노출 위험도 (동연령 대비)</h3>

        <ul className="routine-exposure-list">
          {sortedRates.map(({ key, label, rate }) => (
            <li key={key} className="routine-exposure-row">
              <span className="routine-exposure-label">{label}</span>
              <div className="routine-exposure-bar-track">
                <div
                  className="routine-exposure-bar-fill"
                  style={{
                    width: `${Math.min(rate, 100)}%`,
                    backgroundColor: getRiskColor(rate),
                  }}
                />
              </div>
              <span
                className="routine-exposure-value"
                style={{ color: getRiskColor(rate) }}
              >
                {rate.toFixed(1)}%
                {rate >= 20 ? " ⚠️" : rate === 0 ? " ✅" : ""}
              </span>
            </li>
          ))}
        </ul>

        <p className="routine-source">
          출처: 질병관리청 2024 국민건강영양조사
        </p>

        <button
          type="button"
          className="primary-btn routine-cta-btn"
          onClick={onStartRoutine}
        >
          루틴 시작하기 →
        </button>
      </section>
    </div>
  );
}
