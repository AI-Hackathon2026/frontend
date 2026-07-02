import type {
  ConditionAssessment,
  ConditionStatus,
  HealthcareAssessmentResponse,
  HealthcareRequest,
  ObesityAssessment,
  ObesityStatus,
} from "../types";

export function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) return undefined;
  return parsed;
}

export function buildHealthcareRequest(form: {
  height: string;
  weight: string;
  age: string;
  gender: "" | "male" | "female";
  systolicBp: string;
  diastolicBp: string;
  onHypertensionMedication: boolean;
  fastingBloodSugar: string;
  hba1c: string;
  onDiabetesMedication: boolean;
  totalCholesterol: string;
  onCholesterolMedication: boolean;
}): HealthcareRequest | null {
  const height = parseOptionalNumber(form.height);
  const weight = parseOptionalNumber(form.weight);
  const age = parseOptionalNumber(form.age);

  if (
    height === undefined ||
    weight === undefined ||
    age === undefined ||
    !form.gender
  ) {
    return null;
  }

  if (age < 1 || age > 120) {
    return null;
  }

  const body: HealthcareRequest = {
    height,
    weight,
    age,
    gender: form.gender,
  };

  const systolicBp = parseOptionalNumber(form.systolicBp);
  const diastolicBp = parseOptionalNumber(form.diastolicBp);
  const fastingBloodSugar = parseOptionalNumber(form.fastingBloodSugar);
  const hba1c = parseOptionalNumber(form.hba1c);
  const totalCholesterol = parseOptionalNumber(form.totalCholesterol);

  if (systolicBp !== undefined) body.systolicBp = systolicBp;
  if (diastolicBp !== undefined) body.diastolicBp = diastolicBp;
  if (form.onHypertensionMedication) {
    body.onHypertensionMedication = true;
  }
  if (fastingBloodSugar !== undefined) body.fastingBloodSugar = fastingBloodSugar;
  if (hba1c !== undefined) body.hba1c = hba1c;
  if (form.onDiabetesMedication) body.onDiabetesMedication = true;
  if (totalCholesterol !== undefined) body.totalCholesterol = totalCholesterol;
  if (form.onCholesterolMedication) body.onCholesterolMedication = true;

  return body;
}

export type AssessmentStatus = ObesityStatus | ConditionStatus;

export function getStatusBadgeClass(
  status: AssessmentStatus,
): "risk" | "caution" | "ok" | "unknown" {
  if (status === "positive" || status === "obese") return "risk";
  if (status === "underweight") return "caution";
  if (status === "normal") return "ok";
  return "unknown";
}

export type AssessmentSection = {
  key: string;
  title: string;
  data: ObesityAssessment | ConditionAssessment;
};

export function toAssessmentSections(
  response: HealthcareAssessmentResponse,
): AssessmentSection[] {
  return [
    { key: "obesity", title: "비만", data: response.obesity },
    { key: "hypertension", title: "고혈압", data: response.hypertension },
    { key: "diabetes", title: "당뇨", data: response.diabetes },
    { key: "dyslipidemia", title: "이상지질혈증", data: response.dyslipidemia },
  ];
}
