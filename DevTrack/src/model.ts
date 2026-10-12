export type ProjectStatus = "Planned" | "In Progress" | "Completed";

export interface ProjectTask {
  title: string;
  completed: boolean;
  children?: ProjectTask[];
}

export interface ProjectRecord {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  status: ProjectStatus;
  progress: number;
  tasks: ProjectTask[];
  updatedAt: string;
}

/** A project record with behavior for keeping progress and status in sync. */
export class Project implements ProjectRecord {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  status: ProjectStatus;
  progress: number;
  tasks: ProjectTask[];
  updatedAt: string;

  constructor(record: ProjectRecord) {
    this.id = record.id;
    this.name = record.name;
    this.description = record.description;
    this.technologies = record.technologies;
    this.status = record.status;
    this.progress = record.progress;
    this.tasks = record.tasks;
    this.updatedAt = record.updatedAt;
  }

  /** Clamp progress to 0–100 and derive the matching project status. */
  updateProgress(progress: number): void {
    this.progress = Math.min(100, Math.max(0, Math.round(progress)));
    this.status =
      this.progress === 100
        ? "Completed"
        : this.progress === 0
          ? "Planned"
          : "In Progress";
    this.updatedAt = new Date().toISOString();
  }
}

/** Count every task, including descendants, by recursively visiting child lists. */
export function countTasks(tasks: ProjectTask[]): {
  total: number;
  completed: number;
} {
  return tasks.reduce(
    (result, task) => {
      result.total += 1;
      if (task.completed) result.completed += 1;
      if (task.children?.length) {
        const nested = countTasks(task.children);
        result.total += nested.total;
        result.completed += nested.completed;
      }
      return result;
    },
    { total: 0, completed: 0 },
  );
}

/** Return completed tasks as a rounded percentage; an empty list has no progress. */
export function calculateTaskProgress(tasks: ProjectTask[]): number {
  const { total, completed } = countTasks(tasks);
  return total === 0 ? 0 : Math.round((completed / total) * 100);
}
