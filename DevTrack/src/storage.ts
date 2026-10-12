import { starterProjects } from "./data";
import { Project, type ProjectRecord } from "./model";

const STORAGE_KEY = "devtrack.projects.v1";

// Keep storage behind promise-based functions so callers can await loading and saving consistently.
/** Load saved records or initialize the browser with the starter project list. */
export async function loadProjects(): Promise<Project[]> {
  await Promise.resolve();
  const stored = localStorage.getItem(STORAGE_KEY);
  const records: ProjectRecord[] = stored
    ? (JSON.parse(stored) as ProjectRecord[])
    : starterProjects;
  if (!stored) await saveProjects(records);
  return records.map((record) => new Project(record));
}

/** Serialize the project list under the app's versioned local-storage key. */
export async function saveProjects(projects: ProjectRecord[]): Promise<void> {
  await Promise.resolve();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}
