import type { ReactNode } from "react";
import { TaskRow } from "./TaskRow";

interface TaskItem {
  id: string;
  name: string;
  completed: boolean;
  badge?: string;
  disabled?: boolean;
  onToggle: () => void;
}

interface Props {
  icon: ReactNode;
  label: string;
  tasks: TaskItem[];
  expanded: boolean;
  onToggle: () => void;
}

export function MealSection({
  icon,
  label,
  tasks,
  expanded,
  onToggle,
}: Props) {
  const done = tasks.filter((t) => t.completed).length;
  const allDone = tasks.length > 0 && done === tasks.length;

  return (
    <div className="routine-v2-meal-section">
      <button
        type="button"
        className="routine-v2-meal-header"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <span className="routine-v2-meal-icon">{icon}</span>
        <span className="routine-v2-meal-label">{label}</span>
        <span
          className={`routine-v2-meal-count${allDone ? " is-done" : ""}`}
        >
          {done}/{tasks.length}
        </span>
        <span className="routine-v2-meal-chevron" aria-hidden>
          {expanded ? "▴" : "▾"}
        </span>
      </button>
      {expanded &&
        tasks.map((task) => (
          <TaskRow
            key={task.id}
            id={task.id}
            name={task.name}
            completed={task.completed}
            badge={task.badge}
            disabled={task.disabled}
            onToggle={task.onToggle}
          />
        ))}
    </div>
  );
}
