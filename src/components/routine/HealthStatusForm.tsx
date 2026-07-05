import { FormEvent, useEffect, useState } from "react";
import { api, withAuthRetry } from "../../api/client";
import type { Gender } from "../../types";
import {
  buildHealthStatusRequest,
  healthStatusToFormState,
  type HealthStatusFormState,
} from "../../utils/healthstatus";

const INITIAL_FORM: HealthStatusFormState = {
  gender: "",
  age: "",
  height: "",
  weight: "",
  alcoholFreq: "",
  smokeFreq: "",
  exerciseFreq: "",
};

interface Props {
  mode?: "create" | "update";
  onComplete: () => void;
  onCancel?: () => void;
}

export function HealthStatusForm({
  mode = "create",
  onComplete,
  onCancel,
}: Props) {
  const [form, setForm] = useState<HealthStatusFormState>(INITIAL_FORM);
  const [healthStatusId, setHealthStatusId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(mode === "update");

  useEffect(() => {
    if (mode !== "update") return;

    setFetching(true);
    setError("");

    withAuthRetry(() => api.getHealthStatus())
      .then((status) => {
        if (!status) {
          setError("저장된 건강 정보를 찾을 수 없습니다.");
          return;
        }
        setHealthStatusId(status.id);
        setForm(healthStatusToFormState(status));
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "건강 정보를 불러올 수 없습니다.",
        );
      })
      .finally(() => setFetching(false));
  }, [mode]);

  function updateField<K extends keyof HealthStatusFormState>(
    key: K,
    value: HealthStatusFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!form.gender) {
      setError("성별을 선택해 주세요.");
      return;
    }

    const body = buildHealthStatusRequest(form);
    if (!body) {
      setError(
        "모든 항목을 올바르게 입력해 주세요. (나이 1–120, 키·몸무게·생활습관 빈도는 정수)",
      );
      return;
    }

    if (mode === "update" && !healthStatusId) {
      setError("건강 정보 ID를 찾을 수 없습니다. 다시 시도해 주세요.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "update" && healthStatusId) {
        await withAuthRetry(() => api.updateHealthStatus(healthStatusId, body));
      } else {
        await withAuthRetry(() => api.submitHealthStatus(body));
      }
      onComplete();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "건강 정보 저장에 실패했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="routine-page">
        <div className="routine-gate">
          <div className="spinner" />
          <p>건강 정보 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="routine-page">
      <section className="routine-section">
        <div className="routine-section-header">
          <h2>{mode === "update" ? "건강 정보 수정" : "건강 정보 입력"}</h2>
          {mode === "update" && onCancel && (
            <button type="button" className="ghost-btn" onClick={onCancel}>
              취소
            </button>
          )}
        </div>
        <p className="section-desc">
          {mode === "update"
            ? "건강 정보를 수정하면 건강 점수와 루틴 추천이 다시 계산됩니다."
            : "KNHANES 기반 맞춤 루틴을 위해 건강 정보를 입력해 주세요."}
        </p>

        {error && <div className="banner-error">{error}</div>}

        <form className="healthstatus-form" onSubmit={(e) => void handleSubmit(e)}>
          <fieldset className="healthstatus-fieldset">
            <legend>기본 정보</legend>
            <div className="healthstatus-form-grid">
              <label>
                성별
                <select
                  value={form.gender}
                  onChange={(e) =>
                    updateField("gender", e.target.value as "" | Gender)
                  }
                  required
                >
                  <option value="">선택</option>
                  <option value="MALE">남성</option>
                  <option value="FEMALE">여성</option>
                </select>
              </label>
              <label>
                나이
                <input
                  type="number"
                  min={1}
                  max={120}
                  step={1}
                  value={form.age}
                  onChange={(e) => updateField("age", e.target.value)}
                  placeholder="42"
                  required
                />
              </label>
              <label>
                키 (cm)
                <input
                  type="number"
                  min={50}
                  max={250}
                  step={1}
                  value={form.height}
                  onChange={(e) => updateField("height", e.target.value)}
                  placeholder="175"
                  required
                />
              </label>
              <label>
                몸무게 (kg)
                <input
                  type="number"
                  min={20}
                  max={300}
                  step={1}
                  value={form.weight}
                  onChange={(e) => updateField("weight", e.target.value)}
                  placeholder="72"
                  required
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="healthstatus-fieldset">
            <legend>생활 습관 (주당 빈도)</legend>
            <p className="healthstatus-field-hint">
              0~7 — 지난 1주 기준 해당 일수
            </p>
            <div className="healthstatus-form-grid">
              <label>
                음주 (주당 일수)
                <input
                  type="number"
                  min={0}
                  max={7}
                  step={1}
                  value={form.alcoholFreq}
                  onChange={(e) => updateField("alcoholFreq", e.target.value)}
                  placeholder="2"
                  required
                />
              </label>
              <label>
                흡연 (주당 일수)
                <input
                  type="number"
                  min={0}
                  max={7}
                  step={1}
                  value={form.smokeFreq}
                  onChange={(e) => updateField("smokeFreq", e.target.value)}
                  placeholder="0"
                  required
                />
              </label>
              <label>
                운동 (주당 일수)
                <input
                  type="number"
                  min={0}
                  max={7}
                  step={1}
                  value={form.exerciseFreq}
                  onChange={(e) => updateField("exerciseFreq", e.target.value)}
                  placeholder="3"
                  required
                />
              </label>
            </div>
          </fieldset>

          <div className="healthstatus-form-actions">
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading
                ? "저장 중..."
                : mode === "update"
                  ? "건강 정보 업데이트"
                  : "저장하고 계속하기"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
