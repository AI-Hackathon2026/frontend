import { useState, type FormEvent } from "react";
import type { HealthProfileInput, Sex } from "../types";

interface Props {
  onSubmit: (profile: HealthProfileInput) => void;
  onClose: () => void;
  loading: boolean;
  error: string;
  onRetry?: () => void;
}

const AGE_GROUPS = ["10-19", "20-29", "30-39", "40-49", "50-59", "60-69", "70+"];
const UNSUPPORTED_AGE = "10-19";

function calcBmi(h?: number, w?: number): number | undefined {
  if (!h || !w || h <= 0) return undefined;
  return Number((w / ((h / 100) ** 2)).toFixed(1));
}

function classifyError(msg: string): "rate_limit" | "overload" | "grounding" | "other" {
  if (msg.includes("429") || msg.toLowerCase().includes("rate_limit")) return "rate_limit";
  if (msg.includes("503") || msg.toLowerCase().includes("high_in_demand") || msg.toLowerCase().includes("혼잡")) return "overload";
  if (msg.toLowerCase().includes("grounding_not_found") || msg.toLowerCase().includes("지원하지 않")) return "grounding";
  return "other";
}

export function HealthProfileModal({ onSubmit, onClose, loading, error, onRetry }: Props) {
  const [sex, setSex] = useState<Sex>("M");
  const [ageGroup, setAgeGroup] = useState("40-49");
  const [heightCm, setHeightCm] = useState<string>("");
  const [weightKg, setWeightKg] = useState<string>("");
  const [systolicBp, setSystolicBp] = useState<string>("");
  const [fastingGlucose, setFastingGlucose] = useState<string>("");
  const [smoking, setSmoking] = useState(false);
  const [drinking, setDrinking] = useState(0);
  const [exercise, setExercise] = useState(0);
  const [stress, setStress] = useState<1 | 2 | 3 | 4 | 5>(3);

  const h = heightCm ? Number(heightCm) : undefined;
  const w = weightKg ? Number(weightKg) : undefined;
  const bmi = calcBmi(h, w);
  const isUnsupportedAge = ageGroup === UNSUPPORTED_AGE;
  const errKind = error ? classifyError(error) : null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isUnsupportedAge) return;
    onSubmit({
      sex,
      ageGroup,
      heightCm: h,
      weightKg: w,
      bmi,
      systolicBp: systolicBp ? Number(systolicBp) : undefined,
      fastingGlucose: fastingGlucose ? Number(fastingGlucose) : undefined,
      smoking,
      drinkingFrequencyPerWeek: drinking,
      weeklyExerciseDays: exercise,
      stressLevel: stress,
    });
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="routine-modal-title">
      <div className="modal-card">
        <div className="modal-header">
          <h2 id="routine-modal-title" className="modal-title">맞춤 건강 루틴 생성</h2>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="닫기">✕</button>
        </div>

        {/* Error banners */}
        {error && (
          <div className="modal-error-banner">
            {errKind === "rate_limit" && "잠시 후 다시 시도해주세요. (요청 한도 초과)"}
            {errKind === "overload" && (
              <>
                AI 모델이 혼잡합니다. 잠시 후 다시 시도해주세요.
                {onRetry && (
                  <button type="button" className="modal-retry-btn" onClick={onRetry}>
                    재시도
                  </button>
                )}
              </>
            )}
            {errKind === "grounding" && "해당 연령대는 KNHANES 데이터가 지원되지 않습니다. 다른 연령대를 선택해주세요."}
            {errKind === "other" && error}
          </div>
        )}

        <form className="health-form" onSubmit={handleSubmit}>

          {/* ── 기본 정보 ── */}
          <div className="health-form-section">
            <h3 className="health-form-section-title">기본 정보</h3>

            <div className="health-form-row">
              <label className="health-form-label">성별</label>
              <div className="sex-toggle">
                <button
                  type="button"
                  className={`sex-btn${sex === "M" ? " active" : ""}`}
                  onClick={() => setSex("M")}
                >남성</button>
                <button
                  type="button"
                  className={`sex-btn${sex === "F" ? " active" : ""}`}
                  onClick={() => setSex("F")}
                >여성</button>
              </div>
            </div>

            <div className="health-form-row">
              <label className="health-form-label" htmlFor="age-group">연령대</label>
              <select
                id="age-group"
                className="health-form-select"
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
              >
                {AGE_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}{g === UNSUPPORTED_AGE ? " (미지원)" : ""}
                  </option>
                ))}
              </select>
              {isUnsupportedAge && (
                <span className="health-form-hint health-form-hint--warn">
                  10대 데이터는 KNHANES 통계에서 지원되지 않습니다.
                </span>
              )}
            </div>
          </div>

          {/* ── 신체 측정 ── */}
          <div className="health-form-section">
            <h3 className="health-form-section-title">신체 측정 <span className="health-form-optional">(선택)</span></h3>

            <div className="health-form-row health-form-row--two">
              <div className="health-form-field">
                <label className="health-form-label" htmlFor="height">키 (cm)</label>
                <input
                  id="height"
                  type="number"
                  className="health-form-input"
                  placeholder="예: 170"
                  min={100} max={250}
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                />
              </div>
              <div className="health-form-field">
                <label className="health-form-label" htmlFor="weight">체중 (kg)</label>
                <input
                  id="weight"
                  type="number"
                  className="health-form-input"
                  placeholder="예: 65"
                  min={20} max={300}
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                />
              </div>
            </div>

            {bmi !== undefined && (
              <div className="bmi-display">
                <span className="bmi-label">BMI</span>
                <span className="bmi-value">{bmi}</span>
                <span className="bmi-class">{bmi < 18.5 ? "저체중" : bmi < 23 ? "정상" : bmi < 25 ? "과체중" : "비만"}</span>
              </div>
            )}
          </div>

          {/* ── 임상 지표 ── */}
          <div className="health-form-section">
            <h3 className="health-form-section-title">임상 지표 <span className="health-form-optional">(선택)</span></h3>

            <div className="health-form-row health-form-row--two">
              <div className="health-form-field">
                <label className="health-form-label" htmlFor="sbp">수축기 혈압 (mmHg)</label>
                <input
                  id="sbp"
                  type="number"
                  className="health-form-input"
                  placeholder="예: 120"
                  min={60} max={250}
                  value={systolicBp}
                  onChange={(e) => setSystolicBp(e.target.value)}
                />
              </div>
              <div className="health-form-field">
                <label className="health-form-label" htmlFor="glucose">공복혈당 (mg/dL)</label>
                <input
                  id="glucose"
                  type="number"
                  className="health-form-input"
                  placeholder="예: 95"
                  min={50} max={500}
                  value={fastingGlucose}
                  onChange={(e) => setFastingGlucose(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ── 생활 습관 ── */}
          <div className="health-form-section">
            <h3 className="health-form-section-title">생활 습관</h3>

            <div className="health-form-row">
              <label className="health-form-label health-form-label--check">
                <input
                  type="checkbox"
                  checked={smoking}
                  onChange={(e) => setSmoking(e.target.checked)}
                />
                흡연
              </label>
            </div>

            <div className="health-form-row">
              <label className="health-form-label" htmlFor="drinking">
                주당 음주 횟수: <strong>{drinking}회</strong>
              </label>
              <input
                id="drinking"
                type="range"
                className="health-form-range"
                min={0} max={7} step={1}
                value={drinking}
                onChange={(e) => setDrinking(Number(e.target.value))}
              />
              <div className="health-form-range-labels"><span>0</span><span>7</span></div>
            </div>

            <div className="health-form-row">
              <label className="health-form-label" htmlFor="exercise">
                주당 운동 일수: <strong>{exercise}일</strong>
              </label>
              <input
                id="exercise"
                type="range"
                className="health-form-range"
                min={0} max={7} step={1}
                value={exercise}
                onChange={(e) => setExercise(Number(e.target.value))}
              />
              <div className="health-form-range-labels"><span>0</span><span>7</span></div>
            </div>

            <div className="health-form-row">
              <label className="health-form-label">
                스트레스 수준: <strong>{["매우 낮음", "낮음", "보통", "높음", "매우 높음"][stress - 1]}</strong>
              </label>
              <div className="stress-radio-group">
                {([1, 2, 3, 4, 5] as const).map((v) => (
                  <label key={v} className={`stress-radio${stress === v ? " active" : ""}`}>
                    <input
                      type="radio"
                      name="stress"
                      value={v}
                      checked={stress === v}
                      onChange={() => setStress(v)}
                    />
                    {v}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="modal-actions">
            <button type="button" className="ghost-btn" onClick={onClose} disabled={loading}>
              취소
            </button>
            <button
              type="submit"
              className="primary-btn"
              disabled={loading || isUnsupportedAge}
            >
              {loading ? (
                <><span className="btn-spinner" /> 루틴 생성 중…</>
              ) : (
                "루틴 생성하기"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
