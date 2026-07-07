import { NUTRIENT_GROUP_LABELS } from "../../../constants/nutrition";
import type { NutritionMeal, NutritionSummaryEntry } from "../../../types";
import {
  averageNutritionFulfillment,
  getNutrientColor,
  getNutrientLabel,
  groupNutritionSummaryEntries,
  nutrientFulfillmentLabel,
  resolveCalorieTarget,
  resolveDayTotalCalories,
} from "../../../utils/nutritionSummary";

interface Props {
  averageCalories?: number;
  nutritionSummary?: NutritionSummaryEntry[];
  meals?: NutritionMeal[];
  targetCalories?: number;
}

export function NutritionSummaryCard({
  averageCalories,
  nutritionSummary,
  meals,
  targetCalories,
}: Props) {
  if (!nutritionSummary?.length) return null;

  const mealCalories = (meals ?? []).reduce(
    (sum, meal) => sum + meal.calories,
    0,
  );
  const totalCal = resolveDayTotalCalories(averageCalories, mealCalories);
  const targetCal = resolveCalorieTarget(averageCalories, targetCalories);
  const calPct =
    targetCal > 0 ? Math.min(100, Math.round((totalCal / targetCal) * 100)) : 0;

  const score = averageNutritionFulfillment(nutritionSummary);
  const scoreLabel = nutrientFulfillmentLabel(score);
  const grouped = groupNutritionSummaryEntries(nutritionSummary);

  return (
    <section className="routine-nutrition-summary" aria-label="영양 균형">
      <p className="routine-nutrition-summary-sec-label">오늘의 영양 균형</p>

      <div className="routine-nutrition-summary-card">
        <header className="routine-nutrition-summary-top">
          <span className="routine-nutrition-summary-title">하루 평균</span>
          <div
            className="routine-nutrition-summary-pill"
            style={{
              borderColor: `${getNutrientColor(score)}44`,
              background: `${getNutrientColor(score)}1f`,
            }}
          >
            <span
              className="routine-nutrition-summary-pill-value"
              style={{ color: getNutrientColor(score) }}
            >
              {score}%
            </span>
            <span className="routine-nutrition-summary-pill-label">
              {scoreLabel}
            </span>
          </div>
        </header>

        {totalCal > 0 && (
          <>
            <div className="routine-nutrition-summary-cal-row">
              <span className="routine-nutrition-summary-cal-num">
                {totalCal.toLocaleString()}
              </span>
              <span className="routine-nutrition-summary-cal-unit">kcal</span>
              <span className="routine-nutrition-summary-cal-target">
                / 목표 {targetCal.toLocaleString()} kcal
              </span>
            </div>
            <div
              className="routine-nutrition-summary-cal-bar"
              role="progressbar"
              aria-valuenow={calPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`칼로리 ${calPct}%`}
            >
              <div
                className="routine-nutrition-summary-cal-bar-fill"
                style={{
                  width: `${calPct}%`,
                  background: getNutrientColor(calPct),
                }}
              />
            </div>
          </>
        )}

        <div className="routine-nutrition-summary-groups">
          {grouped.map(({ group, entries }) => (
            <div key={group} className="routine-nutrition-summary-group">
              <p className="routine-nutrition-summary-group-label">
                {NUTRIENT_GROUP_LABELS[group]}
              </p>
              <ul className="routine-nutrition-summary-list">
                {entries.map((entry) => (
                  <li key={entry.key} className="routine-nutrition-summary-item">
                    <div className="routine-nutrition-summary-item-top">
                      <span className="routine-nutrition-summary-item-label">
                        {getNutrientLabel(entry.key)}
                      </span>
                      <span
                        className="routine-nutrition-summary-item-value"
                        style={{ color: getNutrientColor(entry.percent) }}
                      >
                        {entry.percent}%
                      </span>
                    </div>
                    <div
                      className="routine-nutrition-summary-bar"
                      role="progressbar"
                      aria-valuenow={entry.percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${getNutrientLabel(entry.key)} ${entry.percent}%`}
                    >
                      <div
                        className="routine-nutrition-summary-bar-fill"
                        style={{
                          width: `${entry.percent}%`,
                          background: getNutrientColor(entry.percent),
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
