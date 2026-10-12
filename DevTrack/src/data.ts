import type { ProjectRecord } from "./model";

// Starter records make the dashboard useful on first launch and include nested tasks for the recursion demo.
export const starterProjects: ProjectRecord[] = [
  {
    id: "kampala-commute",
    name: "Kampala Commute",
    description:
      "A route planner concept for finding calmer, more predictable ways across the city.",
    technologies: ["TypeScript", "Mapbox", "CSS"],
    status: "In Progress",
    progress: 68,
    tasks: [
      {
        title: "Route discovery",
        completed: true,
        children: [
          { title: "Map view", completed: true },
          { title: "Saved routes", completed: true },
        ],
      },
      { title: "Departure planner", completed: false },
    ],
    updatedAt: "2026-09-28T09:30:00.000Z",
  },
  {
    id: "garden-notes",
    name: "Garden Notes",
    description:
      "A lightweight journal for tracking planting schedules and small garden wins.",
    technologies: ["HTML", "CSS", "JavaScript"],
    status: "Completed",
    progress: 100,
    tasks: [
      { title: "Journal entries", completed: true },
      { title: "Season calendar", completed: true },
    ],
    updatedAt: "2026-09-22T14:10:00.000Z",
  },
  {
    id: "study-sprint",
    name: "Study Sprint",
    description:
      "A focused study timer that turns weekly learning goals into manageable sessions.",
    technologies: ["TypeScript", "Vite", "Local Storage"],
    status: "Planned",
    progress: 12,
    tasks: [
      { title: "Project outline", completed: true },
      { title: "Build timer", completed: false },
    ],
    updatedAt: "2026-09-18T11:45:00.000Z",
  },
];

// Group skill examples by learning area for the Skills view on first launch.
export const skillGroups = [
  {
    category: "Languages",
    skills: ["TypeScript", "JavaScript", "HTML", "CSS"],
  },
  {
    category: "Tools & platforms",
    skills: ["Git", "GitHub", "Vite", "VS Code", "Docker", "Postman"],
  },
  {
    category: "Currently learning",
    skills: ["Node.js", "API design", "Testing"],
  },
];
