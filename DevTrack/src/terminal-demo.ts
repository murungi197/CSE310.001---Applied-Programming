import { starterProjects } from "./data";
import { calculateTaskProgress, countTasks, Project } from "./model";

// Return class instances asynchronously so the demo exercises async/await and the shared model.
async function loadDemoProjects(): Promise<Project[]> {
  await Promise.resolve(starterProjects);
  return starterProjects.map((record) => new Project(record));
}

/** Print the terminal summary and report invalid empty input through the catch below. */
async function main(): Promise<void> {
  const projects = await loadDemoProjects();
  if (projects.length === 0) {
    throw new Error("No project records are available to summarize.");
  }

  // Array filters and reductions produce the dashboard-style summary values.
  const completed = projects.filter(
    (project) => project.status === "Completed",
  ).length;
  const active = projects.filter(
    (project) => project.status === "In Progress",
  ).length;
  const average = Math.round(
    projects.reduce((sum, project) => sum + project.progress, 0) /
      projects.length,
  );

  console.log("\nDEVTRACK  /  PROJECT SNAPSHOT");
  console.log("Murungi Innocent · Kampala, Uganda\n");
  for (const project of projects) {
    const taskCounts = countTasks(project.tasks);
    console.log(
      `${project.name.padEnd(20)} ${String(project.progress).padStart(3)}%  ${project.status}`,
    );
    console.log(
      `  ${project.technologies.join(" · ")} | tasks ${taskCounts.completed}/${taskCounts.total} | recursive ${calculateTaskProgress(project.tasks)}%`,
    );
  }
  console.log(
    `\n${projects.length} projects  ·  ${completed} completed  ·  ${active} in progress  ·  ${average}% average progress\n`,
  );
}
main().catch((error: unknown) => {
  console.error("Unable to load the DevTrack demo:", error);
});
