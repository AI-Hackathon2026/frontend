import { useState } from "react";
import {
  MEAL_TYPE_ICONS,
  MEAL_TYPE_LABELS,
  MEAL_TYPE_ORDER,
} from "../../constants/routine";
import type { MealType, NutritionMeal, NutritionRoutineDay } from "../../types";
import { DayNavigation } from "./view/DayNavigation";
import { MealSection } from "./view/MealSection";

interface Props {
  days: NutritionRoutineDay[];
  updatingPlanId?: string | null;
  onToggle?: (planId: string, isCompleted: boolean) => void;
}

function groupMealsByType(meals: NutritionMeal[]) {
  const grouped = new Map<MealType, NutritionMeal[]>();

  for (const meal of meals) {
    const bucket = grouped.get(meal.mealType) ?? [];
    bucket.push(meal);
    grouped.set(meal.mealType, bucket);
  }

  return MEAL_TYPE_ORDER.filter((type) => grouped.has(type)).map((mealType) => ({
    mealType,
    meals: grouped.get(mealType)!,
  }));
}

function mealItemTitle(meal: NutritionMeal) {
  if (meal.foods.length === 0) return "메뉴 정보 없음";
  return meal.foods.join(", ");
}

export function NutritionRoutineTracker({
  days,
  updatingPlanId = null,
  onToggle,
}: Props) {
  const [dayIndex, setDayIndex] = useState(0);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  const totalMeals = days.reduce((sum, day) => sum + day.meals.length, 0);
  if (totalMeals === 0) {
    return <p className="routine-v2-empty">등록된 영양 루틴이 없습니다.</p>;
  }

  const safeIndex = Math.min(Math.max(0, dayIndex), days.length - 1);
  const day = days[safeIndex];
  const dayNumber = day.dayNumber ?? safeIndex + 1;
  const mealGroups = groupMealsByType(day.meals);

  return (
    <div className="routine-v2-day-view">
      <DayNavigation
        currentIndex={safeIndex}
        totalDays={days.length}
        onChange={(index) => {
          setDayIndex(index);
          setExpandedMeal(null);
        }}
      />

      <div className="routine-v2-day-card">
        {mealGroups.map(({ mealType, meals }) => {
          const mealKey = `${dayNumber}-${mealType}`;
          const mealLabel = MEAL_TYPE_LABELS[mealType] ?? mealType;
          const mealIcon = MEAL_TYPE_ICONS[mealType] ?? "🍽";

          return (
            <MealSection
              key={mealKey}
              icon={mealIcon}
              label={mealLabel}
              expanded={expandedMeal === mealKey}
              onToggle={() =>
                setExpandedMeal((prev) => (prev === mealKey ? null : mealKey))
              }
              tasks={meals.map((meal, mealIndex) => ({
                id: meal.planId || `${mealKey}-${mealIndex}`,
                name: mealItemTitle(meal),
                completed: meal.isCompleted,
                badge:
                  meal.calories > 0
                    ? `${meal.calories.toLocaleString()} kcal`
                    : undefined,
                disabled:
                  updatingPlanId === meal.planId ||
                  !meal.planId ||
                  !onToggle,
                onToggle: () => {
                  if (meal.planId) onToggle?.(meal.planId, meal.isCompleted);
                },
              }))}
            />
          );
        })}
      </div>
    </div>
  );
}
