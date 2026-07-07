import type { MealType, NutritionMeal } from "../../../types";
import { MEAL_TYPE_ICONS, MEAL_TYPE_LABELS } from "../../../constants/routine";

interface FoodRow {
  id: string;
  name: string;
  calories: number;
}

interface Props {
  mealType: MealType;
  meals: NutritionMeal[];
  expanded: boolean;
  onToggleExpand: () => void;
  updatingPlanId?: string | null;
  onToggleMeal?: (planId: string, isCompleted: boolean) => void;
}

function buildFoodRows(meals: NutritionMeal[]): FoodRow[] {
  const rows: FoodRow[] = [];

  for (const meal of meals) {
    if (meal.foods.length === 0) {
      rows.push({
        id: meal.planId || `meal-${meal.mealType}`,
        name: "메뉴 정보 없음",
        calories: meal.calories,
      });
      continue;
    }

    if (meal.foods.length === 1) {
      rows.push({
        id: meal.planId || `meal-${meal.mealType}-0`,
        name: meal.foods[0],
        calories: meal.calories,
      });
      continue;
    }

    const perFood = Math.round(meal.calories / meal.foods.length);
    meal.foods.forEach((food, index) => {
      rows.push({
        id: meal.planId ? `${meal.planId}-${index}` : `meal-${meal.mealType}-${index}`,
        name: food,
        calories:
          index === meal.foods.length - 1
            ? meal.calories - perFood * (meal.foods.length - 1)
            : perFood,
      });
    });
  }

  return rows;
}

export function MealSection({
  mealType,
  meals,
  expanded,
  onToggleExpand,
  updatingPlanId = null,
  onToggleMeal,
}: Props) {
  const label = MEAL_TYPE_LABELS[mealType] ?? mealType;
  const icon = MEAL_TYPE_ICONS[mealType] ?? "🍽";
  const totalCal = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const done = meals.filter((meal) => meal.isCompleted).length;
  const total = meals.length;
  const allDone = total > 0 && done === total;
  const foodRows = buildFoodRows(meals);
  const primaryMeal = meals[0];

  return (
    <div className="routine-nutrition-meal-card">
      <button
        type="button"
        className="routine-nutrition-meal-header"
        aria-expanded={expanded}
        onClick={onToggleExpand}
      >
        <span className="routine-nutrition-meal-icon" aria-hidden>
          {icon}
        </span>
        <span className="routine-nutrition-meal-label">{label}</span>
        {totalCal > 0 && (
          <span className="routine-nutrition-meal-cal">
            {totalCal.toLocaleString()} kcal
          </span>
        )}
        <span
          className={`routine-nutrition-meal-badge${allDone ? " is-done" : ""}`}
        >
          {done}/{total}
        </span>
        <span
          className={`routine-nutrition-meal-chevron${expanded ? " is-open" : ""}`}
          aria-hidden
        >
          ›
        </span>
      </button>

      {expanded && (
        <div className="routine-nutrition-meal-body">
          {foodRows.map((food) => {
            const completed = primaryMeal?.isCompleted ?? false;
            const disabled =
              !primaryMeal?.planId ||
              !onToggleMeal ||
              updatingPlanId === primaryMeal.planId;

            return (
              <button
                key={food.id}
                type="button"
                className={`routine-nutrition-food-row${completed ? " is-complete" : ""}`}
                disabled={disabled}
                onClick={() => {
                  if (primaryMeal?.planId) {
                    onToggleMeal?.(primaryMeal.planId, primaryMeal.isCompleted);
                  }
                }}
              >
                <span
                  className={`routine-nutrition-food-check${completed ? " is-done" : ""}`}
                  aria-hidden
                >
                  {completed && "✓"}
                </span>
                <span className="routine-nutrition-food-name">{food.name}</span>
                {food.calories > 0 && (
                  <span className="routine-nutrition-food-cal">
                    {food.calories.toLocaleString()} kcal
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
