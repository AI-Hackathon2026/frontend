import { useEffect, useState } from "react";
import { api, withAuthRetry } from "../../api/client";
import {
  DIFFICULTY_FREQUENCY,
  DIFFICULTY_LABELS,
  DISEASE_LABELS,
  getHighestRiskDisease,
} from "../../constants/routine";
import type { RoutineDifficulty, RoutineProjection } from "../../types";
import type { DiseaseKey } from "../../constants/routine";

interface Props {
  onGenerated: (routineId: string, chatId: string) => void;
}

const DIFFICULTIES: RoutineDifficulty[] = ["EASY", "MODERATE", "HARD"];

export function DifficultyPickerScreen({ onGenerated }: Props) {
  const [projection, setProjection] = useState<RoutineProjection | null>(null);
  const [topDisease, setTopDisease] = useState<DiseaseKey>("OBESITY");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const record = await withAuthRetry(() => api.getHealthRecordMe());
        if (!record) {
          setError("건강 기록이 없습니다.");
          return;
        }
        const disease = getHighestRiskDisease(
          record.exposureRates as Record<string, number>,
        );
        setTopDisease(disease);
        const proj = await withAuthRetry(() =>
          api.getHealthRecordProjection(disease),
        );
        setProjection(proj);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "예측 데이터를 불러올 수 없습니다.",
        );
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function onSelectDifficulty(difficulty: RoutineDifficulty) {
    setGenerating(true);
    setLoadingMessage("AI가 나만의 루틴을 만들고 있어요...");
    setError("");
    try {
      const result = await withAuthRetry(() =>
        api.generateRoutinePlan({ difficulty }),
      );
      onGenerated(result.routineId, result.chatId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "루틴 생성에 실패했습니다.",
      );
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="routine-gate">
        <div className="spinner" />
        <p>난이도 정보 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="routine-page">
      {generating && (
        <div className="routine-generating-overlay" aria-live="polite">
          <div className="spinner" />
          <p>{loadingMessage}</p>
        </div>
      )}

      <section className="routine-section">
        <h2>루틴 난이도를 선택해주세요</h2>
        <p className="section-desc">
          {DISEASE_LABELS[topDisease]} 위험도 기준 4개월 후 예상 변화
        </p>

        {error && <div className="banner-error">{error}</div>}

        <div className="routine-difficulty-grid">
          {DIFFICULTIES.map((difficulty) => (
            <article key={difficulty} className="routine-difficulty-card">
              <h3>{DIFFICULTY_LABELS[difficulty]}</h3>
              <span className="routine-difficulty-en">{difficulty}</span>
              <p className="routine-difficulty-freq">
                {DIFFICULTY_FREQUENCY[difficulty]}
              </p>
              {projection && (
                <p className="routine-difficulty-projection">
                  {DISEASE_LABELS[topDisease]} 위험<br />
                  {projection.current.toFixed(0)}% →{" "}
                  {projection[difficulty].toFixed(0)}%
                </p>
              )}
              <button
                type="button"
                className="primary-btn"
                disabled={generating}
                onClick={() => void onSelectDifficulty(difficulty)}
              >
                선택
              </button>
            </article>
          ))}
        </div>

        <p className="routine-disclaimer">
          * 4개월 유지 시 예상 변화 (질병관리청 데이터 기준)
          <br />
          * 실제 효과는 개인에 따라 다를 수 있습니다
        </p>
      </section>
    </div>
  );
}
