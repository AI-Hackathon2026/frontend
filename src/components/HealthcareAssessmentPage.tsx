import { FormEvent, useState } from "react";
import { api, withAuthRetry } from "../api/client";
import type { Gender, HealthcareAssessmentResponse } from "../types";
import { HealthcareResultCard } from "./HealthcareResultCard";
import { buildHealthcareRequest, toAssessmentSections } from "../utils/healthcare";

const INITIAL_FORM = {
  height: "",
  weight: "",
  age: "",
  gender: "" as "" | Gender,
  systolicBp: "",
  diastolicBp: "",
  onHypertensionMedication: false,
  fastingBloodSugar: "",
  hba1c: "",
  onDiabetesMedication: false,
  totalCholesterol: "",
  onCholesterolMedication: false,
};

export function HealthcareAssessmentPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HealthcareAssessmentResponse | null>(
    null,
  );

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!form.gender) {
      setError("성별을 선택해 주세요.");
      return;
    }

    const body = buildHealthcareRequest(form);
    if (!body) {
      setError("키, 몸무게, 나이를 올바르게 입력해 주세요. (나이 1–120)");
      return;
    }

    setLoading(true);
    try {
      const response = await withAuthRetry(() =>
        api.submitHealthcareAssessment(body),
      );
      setResult(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "건강 평가를 수행할 수 없습니다.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="healthcare-page">
      {error && <div className="banner-error healthcare-error">{error}</div>}

      <section className="healthcare-section">
        <h2>만성질환 취약성 평가</h2>
        <p className="section-desc">
          2024 국민건강통계 기준으로 비만·고혈압·당뇨·이상지질혈증 위험을
          분석합니다. 필수 항목을 입력하고 선택 검사값을 추가할 수 있습니다.
        </p>

        <form className="healthcare-form" onSubmit={(e) => void handleSubmit(e)}>
          <fieldset className="healthcare-fieldset">
            <legend>필수 정보</legend>
            <div className="healthcare-form-grid">
              <label>
                키 (cm)
                <input
                  type="number"
                  min={50}
                  max={250}
                  step="any"
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
                  step="any"
                  value={form.weight}
                  onChange={(e) => updateField("weight", e.target.value)}
                  placeholder="72"
                  required
                />
              </label>
              <label>
                나이
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={form.age}
                  onChange={(e) => updateField("age", e.target.value)}
                  placeholder="42"
                  required
                />
              </label>
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
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
              </label>
            </div>
          </fieldset>

          <fieldset className="healthcare-fieldset">
            <legend>혈압 (선택)</legend>
            <div className="healthcare-form-grid">
              <label>
                수축기 혈압 (mmHg)
                <input
                  type="number"
                  min={60}
                  max={250}
                  value={form.systolicBp}
                  onChange={(e) => updateField("systolicBp", e.target.value)}
                  placeholder="120"
                />
              </label>
              <label>
                이완기 혈압 (mmHg)
                <input
                  type="number"
                  min={40}
                  max={150}
                  value={form.diastolicBp}
                  onChange={(e) => updateField("diastolicBp", e.target.value)}
                  placeholder="80"
                />
              </label>
            </div>
            <label className="healthcare-checkbox">
              <input
                type="checkbox"
                checked={form.onHypertensionMedication}
                onChange={(e) =>
                  updateField("onHypertensionMedication", e.target.checked)
                }
              />
              고혈압 약 복용 중
            </label>
          </fieldset>

          <fieldset className="healthcare-fieldset">
            <legend>혈당 (선택)</legend>
            <div className="healthcare-form-grid">
              <label>
                공복 혈당 (mg/dL)
                <input
                  type="number"
                  min={40}
                  max={600}
                  step="any"
                  value={form.fastingBloodSugar}
                  onChange={(e) =>
                    updateField("fastingBloodSugar", e.target.value)
                  }
                  placeholder="95"
                />
              </label>
              <label>
                당화혈색소 (%)
                <input
                  type="number"
                  min={4}
                  max={20}
                  step="0.1"
                  value={form.hba1c}
                  onChange={(e) => updateField("hba1c", e.target.value)}
                  placeholder="5.6"
                />
              </label>
            </div>
            <label className="healthcare-checkbox">
              <input
                type="checkbox"
                checked={form.onDiabetesMedication}
                onChange={(e) =>
                  updateField("onDiabetesMedication", e.target.checked)
                }
              />
              당뇨 약/인슐린 복용 중
            </label>
          </fieldset>

          <fieldset className="healthcare-fieldset">
            <legend>콜레스테롤 (선택)</legend>
            <label>
              총콜레스테롤 (mg/dL)
              <input
                type="number"
                min={80}
                max={500}
                value={form.totalCholesterol}
                onChange={(e) =>
                  updateField("totalCholesterol", e.target.value)
                }
                placeholder="200"
              />
            </label>
            <label className="healthcare-checkbox">
              <input
                type="checkbox"
                checked={form.onCholesterolMedication}
                onChange={(e) =>
                  updateField("onCholesterolMedication", e.target.checked)
                }
              />
              콜레스테롤 약 복용 중
            </label>
          </fieldset>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "평가 중..." : "건강 평가 실행"}
          </button>
        </form>
      </section>

      {result && (
        <section className="healthcare-section healthcare-results">
          <div className="healthcare-bmi-banner">
            <span className="healthcare-bmi-label">BMI</span>
            <span className="healthcare-bmi-value">{result.bmi.toFixed(1)}</span>
            <span className="healthcare-bmi-unit">kg/m²</span>
          </div>

          <div className="healthcare-result-grid">
            {toAssessmentSections(result).map(({ key, title, data }) => (
              <HealthcareResultCard key={key} title={title} data={data} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
