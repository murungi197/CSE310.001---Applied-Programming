import { skillGroups } from "./data";
import { Project, type ProjectRecord, type ProjectStatus } from "./model";
import { loadProjects, saveProjects } from "./storage";

// Each view is generated from the current state, keeping navigation and project actions lightweight.
type View = "Overview" | "Projects" | "Skills";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("DevTrack app root was not found.");

type UserProfile = { name: string; initials: string };
const PROFILE_STORAGE_KEY = "devtrack.profile.v1";
const defaultProfile: UserProfile = { name: "Murungi Innocent", initials: "MI" };
let profile = defaultProfile;
const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
if (storedProfile) {
  let savedProfile: unknown;
  try {
    savedProfile = JSON.parse(storedProfile);
  } catch (error) {
    console.error("Could not read saved profile settings:", error);
    savedProfile = null;
  }
  if (
    typeof savedProfile === "object" &&
    savedProfile !== null &&
    "name" in savedProfile &&
    typeof savedProfile.name === "string" &&
    "initials" in savedProfile &&
    typeof savedProfile.initials === "string" &&
    savedProfile.name.trim() &&
    savedProfile.initials.trim()
  ) {
    profile = {
      name: savedProfile.name.trim(),
      initials: savedProfile.initials.trim().slice(0, 4).toUpperCase(),
    };
  } else {
    console.error("Saved profile settings are invalid; using the default profile.");
  }
}

let projects: Project[] = [];
let view: View = "Overview";
let searchTerm = "";
let statusFilter = "All statuses";
let technologyFilter = "All technologies";
let skills = JSON.parse(
  localStorage.getItem("devtrack.skills.v1") ?? "null",
) as typeof skillGroups | null;
skills ??= structuredClone(skillGroups);

const icon = (name: string): string => {
  const paths: Record<string, string> = {
    overview:
      '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
    projects:
      '<path d="M3 7.5h7l2 2H21v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 7V5a2 2 0 0 1 2-2h5l2 2h5"/>',
    skills:
      '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16z"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4h6v3"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? ""}</svg>`;
};

// Escape user-entered values before inserting them into rendered HTML.
const escapeHtml = (value: string): string =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] ?? character,
  );

const save = async (): Promise<void> => saveProjects(projects);

/** Render a project record with its status, technologies, progress, and actions. */
function projectCard(project: Project, compact = false): string {
  const tech = project.technologies
    .slice(0, compact ? 2 : 4)
    .map((item) => `<span class="tech-tag">${escapeHtml(item)}</span>`)
    .join("");
  return `<article class="project-card ${compact ? "project-card--compact" : ""}">
    <div class="project-card__top"><span class="status status--${project.status.toLowerCase().replace(" ", "-")}"><i></i>${project.status}</span>
      <div class="card-actions"><button class="icon-button" data-action="edit" data-id="${project.id}" aria-label="Edit ${escapeHtml(project.name)}" title="Edit project">${icon("edit")}</button><button class="icon-button icon-button--danger" data-action="delete" data-id="${project.id}" aria-label="Delete ${escapeHtml(project.name)}" title="Delete project">${icon("trash")}</button></div>
    </div>
    <div class="project-card__body"><h3>${escapeHtml(project.name)}</h3><p>${escapeHtml(project.description)}</p></div>
    <div class="tech-list">${tech}</div>
    <div class="project-progress"><div class="project-progress__label"><span>Progress</span><strong>${project.progress}%</strong></div><div class="progress-track"><span style="width:${project.progress}%"></span></div></div>
    <div class="project-card__foot"><span>${project.tasks.length} ${project.tasks.length === 1 ? "task" : "tasks"}</span><span>Updated ${new Date(project.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span></div>
  </article>`;
}

function header(title: View): string {
  return `<header class="topbar"><div class="topbar__crumb"><span>Workspace</span>${icon("arrow")}<strong>${title}</strong></div><label class="search-box">${icon("search")}<input id="global-search" type="search" placeholder="Search projects..." value="${escapeHtml(searchTerm)}" aria-label="Search projects"></label><button class="topbar__avatar" data-action="edit-profile" aria-label="Edit profile for ${escapeHtml(profile.name)}" title="Edit profile">${escapeHtml(profile.initials)}</button></header>`;
}

function filteredProjects(): Project[] {
  // Apply all active filters together so search and dropdowns can be combined.
  return projects.filter((project) => {
    const matchesSearch =
      `${project.name} ${project.description} ${project.technologies.join(" ")}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All statuses" || project.status === statusFilter;
    const matchesTechnology =
      technologyFilter === "All technologies" ||
      project.technologies.includes(technologyFilter);
    return matchesSearch && matchesStatus && matchesTechnology;
  });
}

/** Derive the dashboard summaries and recent activity directly from project state. */
function overview(): string {
  const completed = projects.filter(
    (project) => project.status === "Completed",
  ).length;
  const active = projects.filter(
    (project) => project.status === "In Progress",
  ).length;
  const average = projects.length
    ? Math.round(
        projects.reduce((sum, project) => sum + project.progress, 0) /
          projects.length,
      )
    : 0;
  const sorted = [...projects].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
  const bars = [
    { label: "In progress", value: active, color: "green" },
    { label: "Completed", value: completed, color: "blue" },
    {
      label: "Planned",
      value: projects.filter((project) => project.status === "Planned").length,
      color: "orange",
    },
  ]
    .map(
      (item) =>
        `<div class="distribution-row"><div class="distribution-row__label"><span><i class="dot dot--${item.color}"></i>${item.label}</span><strong>${item.value}</strong></div><div class="distribution-track"><span class="distribution-track__${item.color}" style="width:${projects.length ? Math.max(5, (item.value / projects.length) * 100) : 0}%"></span></div></div>`,
    )
    .join("");

  return `<main class="page-content">
    <section class="welcome-band"><div class="welcome-band__copy"><span class="eyebrow">YOUR DEVELOPER WORKSPACE <i></i> 2026</span><h1>Make progress<br>visible.</h1><p>A clear view of what you’re building, learning, and shipping.</p><div class="welcome-band__location">${icon("pin")} Kampala, Uganda</div></div><div class="welcome-band__art" aria-hidden="true"><div class="orbit orbit--one"></div><div class="orbit orbit--two"></div><div class="orbit orbit--three"></div><div class="art-center"><span>${escapeHtml(profile.initials)}</span><small>BUILD / LEARN / SHIP</small></div><div class="art-label art-label--top">01 / CSE 310</div><div class="art-label art-label--bottom">${escapeHtml(profile.name.toUpperCase())}</div></div><div class="welcome-band__action"><button class="button button--light" data-action="new-project">${icon("plus")} New project</button></div></section>
    <section class="stats-grid" aria-label="Project summary"><article class="stat-card"><div class="stat-card__label">Total projects<span class="stat-icon stat-icon--green">${icon("projects")}</span></div><strong>${projects.length.toString().padStart(2, "0")}</strong><small>Across your workspace</small></article><article class="stat-card"><div class="stat-card__label">In progress<span class="stat-icon stat-icon--orange">↗</span></div><strong>${active.toString().padStart(2, "0")}</strong><small>Currently being built</small></article><article class="stat-card"><div class="stat-card__label">Completed<span class="stat-icon stat-icon--blue">${icon("check")}</span></div><strong>${completed.toString().padStart(2, "0")}</strong><small>Ready to show the world</small></article><article class="stat-card stat-card--highlight"><div class="stat-card__label">Average progress<span class="stat-icon stat-icon--pale">◌</span></div><strong>${average}<span>%</span></strong><div class="stat-progress"><span style="width:${average}%"></span></div></article></section>
    <section class="dashboard-grid"><article class="panel distribution-panel"><div class="panel-heading"><div><span class="eyebrow eyebrow--muted">AT A GLANCE</span><h2>Project pulse</h2></div><span class="panel-period">ALL TIME</span></div><div class="distribution-chart">${bars}</div><div class="panel-note">${projects.length ? `${completed} of ${projects.length} projects shipped so far.` : "Add your first project to see your progress here."}</div></article><article class="panel focus-panel"><div class="panel-heading"><div><span class="eyebrow eyebrow--muted">RECENT ACTIVITY</span><h2>On your desk</h2></div><button class="text-button" data-action="navigate" data-view="Projects">All projects ${icon("arrow")}</button></div><div class="recent-list">${
      sorted.length
        ? sorted
            .slice(0, 3)
            .map(
              (project) =>
                `<button class="recent-item" data-action="edit" data-id="${project.id}"><span class="recent-marker recent-marker--${project.status.toLowerCase().replace(" ", "-")}"></span><span class="recent-item__copy"><strong>${escapeHtml(project.name)}</strong><small>${project.status} · ${project.progress}% complete</small></span><span class="recent-item__date">${new Date(project.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span></button>`,
            )
            .join("")
        : '<p class="empty-copy">Your project updates will show here.</p>'
    }</div></article></section>
    <section class="section-heading section-heading--projects"><div><span class="eyebrow eyebrow--muted">KEEP THE MOMENTUM</span><h2>Recent projects</h2></div><button class="text-button" data-action="navigate" data-view="Projects">View all ${icon("arrow")}</button></section>
    <section class="project-grid project-grid--dashboard">${
      sorted.length
        ? sorted
            .slice(0, 2)
            .map((project) => projectCard(project, true))
            .join("")
        : '<div class="empty-state"><span class="empty-state__mark">+</span><strong>A blank canvas.</strong><p>Add a project to start shaping your portfolio.</p><button class="button button--dark" data-action="new-project">Add your first project</button></div>'
    }</section>
  </main>`;
}

/** Render the searchable project collection with its active status and tech filters. */
function projectsPage(): string {
  const results = filteredProjects();
  const technologies = [
    ...new Set(projects.flatMap((project) => project.technologies)),
  ].sort();
  return `<main class="page-content"><section class="page-title-row"><div><span class="eyebrow eyebrow--muted">YOUR WORK, IN ONE PLACE</span><h1>Projects <span class="count-pill">${projects.length}</span></h1><p>Track the ideas you’re turning into useful things.</p></div><button class="button button--dark" data-action="new-project">${icon("plus")} New project</button></section><section class="filter-bar"><div class="filter-bar__search">${icon("search")}<input id="project-search" type="search" placeholder="Search name, description, or tech" value="${escapeHtml(searchTerm)}" aria-label="Search projects"></div><label class="select-wrap"><span class="sr-only">Filter by status</span><select id="status-filter"><option>All statuses</option>${(["In Progress", "Planned", "Completed"] as ProjectStatus[]).map((status) => `<option ${statusFilter === status ? "selected" : ""}>${status}</option>`).join("")}</select></label><label class="select-wrap"><span class="sr-only">Filter by technology</span><select id="technology-filter"><option>All technologies</option>${technologies.map((technology) => `<option ${technologyFilter === technology ? "selected" : ""}>${escapeHtml(technology)}</option>`).join("")}</select></label></section><p class="results-count">Showing ${results.length} ${results.length === 1 ? "project" : "projects"}</p><section class="project-grid">${results.length ? results.map((project) => projectCard(project)).join("") : `<div class="empty-state empty-state--wide"><span class="empty-state__mark">⌕</span><strong>No projects found.</strong><p>Try another search or clear your filters.</p><button class="text-button" data-action="clear-filters">Clear filters ${icon("arrow")}</button></div>`}</section></main>`;
}

/** Render skill groups and provide controls for editing the saved skill list. */
function skillsPage(): string {
  return `<main class="page-content"><section class="page-title-row"><div><span class="eyebrow eyebrow--muted">TOOLS IN YOUR TOOLKIT</span><h1>Skills <span class="count-pill">${skills!.reduce((count, group) => count + group.skills.length, 0)}</span></h1><p>A living list of what you know and what you’re learning next.</p></div><button class="button button--dark" data-action="new-skill">${icon("plus")} Add skill</button></section><section class="skills-intro"><div class="skills-intro__mark">{ }</div><div><strong>Keep learning in public.</strong><p>Every skill starts somewhere. Add tools as you pick them up and make the next step visible.</p></div><span class="skills-intro__course">CSE 310 <i></i> MODULE 3</span></section><section class="skill-groups">${skills!.map((group, index) => `<article class="skill-group"><div class="skill-group__head"><span class="skill-index">0${index + 1}</span><div><span class="eyebrow eyebrow--muted">${index === 2 ? "IN PROGRESS" : "CATEGORY"}</span><h2>${escapeHtml(group.category)}</h2></div><span class="skill-group__count">${group.skills.length} skills</span></div><div class="skill-pills">${group.skills.map((skill) => `<span class="skill-pill">${escapeHtml(skill)}<button data-action="remove-skill" data-category="${escapeHtml(group.category)}" data-skill="${escapeHtml(skill)}" aria-label="Remove ${escapeHtml(skill)}" title="Remove skill">${icon("close")}</button></span>`).join("")}</div></article>`).join("")}</section><p class="skills-footnote">Your skill list is saved in this browser.</p></main>`;
}

/** Replace the current view, then bind controls on the newly created elements. */
function render(): void {
  const page =
    view === "Overview"
      ? overview()
      : view === "Projects"
        ? projectsPage()
        : skillsPage();
  app!.innerHTML = `<aside class="sidebar"><a class="brand" href="#overview" data-action="navigate" data-view="Overview"><span class="brand__mark">d<span>.</span></span><span class="brand__name">devtrack<small>DEVELOPER WORKSPACE</small></span></a><div class="side-label">WORKSPACE</div><nav class="side-nav" aria-label="Main navigation">${(["Overview", "Projects", "Skills"] as View[]).map((item) => `<button class="nav-item ${view === item ? "is-active" : ""}" data-action="navigate" data-view="${item}">${icon(item.toLowerCase())}<span>${item}</span>${item === "Projects" ? `<small>${projects.length}</small>` : ""}</button>`).join("")}</nav><div class="sidebar-spacer"></div><div class="sidebar-course"><span class="course-stamp">310</span><div><strong>Applied Programming</strong><small>MODULE 03 · TYPESCRIPT</small></div></div><button class="profile-row" data-action="edit-profile" aria-label="Edit profile"><span class="profile-avatar">${escapeHtml(profile.initials)}</span><span class="profile-row__copy"><strong>${escapeHtml(profile.name)}</strong><small>Kampala, Uganda</small></span><span class="profile-dot"></span></button></aside><div class="workspace">${header(view)}${page}<footer class="app-footer"><span>DEVTRACK <i></i> CSE 310 · MODULE 3</span><span>MADE IN KAMPALA, UGANDA</span></footer></div><dialog class="modal" id="app-modal"></dialog><div class="toast" id="toast" role="status" aria-live="polite"></div>`;
  const portfolioLink = document.createElement("a");
  portfolioLink.className = "nav-item nav-item--portfolio";
  portfolioLink.href = "/portfolio.html";
  portfolioLink.innerHTML =
    `<span class="nav-portfolio-mark" aria-hidden="true">${escapeHtml(profile.initials)}</span><span>Portfolio</span>`;
  app!.querySelector(".side-nav")?.append(portfolioLink);
  // Bind after rendering because page controls are replaced whenever the view changes.
  bindEvents();
}

/** Populate the shared project form for either a new record or an existing one. */
function openProjectModal(project?: Project): void {
  const modal = document.querySelector<HTMLDialogElement>("#app-modal")!;
  modal.innerHTML = `<form id="project-form" class="modal-form"><div class="modal-heading"><div><span class="eyebrow eyebrow--muted">PROJECT DETAILS</span><h2>${project ? "Edit project" : "New project"}</h2></div><button type="button" class="icon-button" data-action="close-modal" aria-label="Close">${icon("close")}</button></div><input type="hidden" name="id" value="${project?.id ?? ""}"><label class="field">Project name<input name="name" required maxlength="60" placeholder="e.g. A helpful little tool" value="${escapeHtml(project?.name ?? "")}"></label><label class="field">Description<textarea name="description" required maxlength="220" rows="3" placeholder="What does it do?">${escapeHtml(project?.description ?? "")}</textarea></label><label class="field">Technologies <small>Separate with commas</small><input name="technologies" required placeholder="TypeScript, Vite, CSS" value="${escapeHtml(project?.technologies.join(", ") ?? "")}"></label><div class="field-row"><label class="field">Status<select name="status"><option ${project?.status === "Planned" ? "selected" : ""}>Planned</option><option ${project?.status === "In Progress" ? "selected" : ""}>In Progress</option><option ${project?.status === "Completed" ? "selected" : ""}>Completed</option></select></label><label class="field">Progress <small>0–100%</small><input name="progress" type="number" min="0" max="100" required value="${project?.progress ?? 0}"></label></div><div class="modal-actions"><button type="button" class="button button--quiet" data-action="close-modal">Cancel</button><button class="button button--dark" type="submit">${project ? "Save changes" : "Create project"} ${icon("arrow")}</button></div></form>`;
  modal.showModal();
  modal.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
  modal
    .querySelector<HTMLFormElement>("#project-form")
    ?.addEventListener("submit", submitProjectForm);
}

/** Edit the display name and initials used throughout DevTrack. */
function openProfileModal(): void {
  const modal = document.querySelector<HTMLDialogElement>("#app-modal")!;
  modal.innerHTML = `<form id="profile-form" class="modal-form"><div class="modal-heading"><div><span class="eyebrow eyebrow--muted">YOUR WORKSPACE IDENTITY</span><h2>Edit profile</h2></div><button type="button" class="icon-button" data-action="close-modal" aria-label="Close">${icon("close")}</button></div><label class="field">User name<input name="name" required maxlength="60" autocomplete="name" value="${escapeHtml(profile.name)}"></label><label class="field">Name initials <small>Up to 4 characters</small><input name="initials" required maxlength="4" autocapitalize="characters" value="${escapeHtml(profile.initials)}"></label><div class="modal-actions"><button type="button" class="button button--quiet" data-action="close-modal">Cancel</button><button class="button button--dark" type="submit">Save profile ${icon("arrow")}</button></div></form>`;
  modal.showModal();
  modal.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
  modal
    .querySelectorAll<HTMLButtonElement>('[data-action="close-modal"]')
    .forEach((button) => button.addEventListener("click", () => modal.close()));
  modal
    .querySelector<HTMLFormElement>("#profile-form")
    ?.addEventListener("submit", submitProfileForm);
}

/** Validate and persist the edited profile before refreshing all identity displays. */
function submitProfileForm(event: SubmitEvent): void {
  event.preventDefault();
  const values = new FormData(event.currentTarget as HTMLFormElement);
  const name = String(values.get("name")).trim();
  const initials = String(values.get("initials")).trim().slice(0, 4).toUpperCase();
  if (!name || !initials) {
    notify("Enter both a user name and initials");
    return;
  }

  const updatedProfile = { name, initials };
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
  } catch (error) {
    console.error("Could not save profile settings:", error);
    notify("Could not save profile. Check browser storage and try again.");
    return;
  }
  profile = updatedProfile;
  document.querySelector<HTMLDialogElement>("#app-modal")?.close();
  render();
  notify("Profile updated");
}

/** Convert validated form fields into a typed record and persist the change. */
async function submitProjectForm(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const values = new FormData(form);
  const id = String(values.get("id"));
  const existing = projects.find((project) => project.id === id);
  const status = String(values.get("status")) as ProjectStatus;
  const progress =
    status === "Completed"
      ? 100
      : Math.min(99, Math.max(0, Number(values.get("progress"))));
  const record: ProjectRecord = {
    id: existing?.id ?? crypto.randomUUID(),
    name: String(values.get("name")).trim(),
    description: String(values.get("description")).trim(),
    technologies: String(values.get("technologies"))
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    status: progress === 100 ? "Completed" : status,
    progress,
    tasks: existing?.tasks ?? [],
    updatedAt: new Date().toISOString(),
  };
  if (existing) Object.assign(existing, record);
  else projects.unshift(new Project(record));
  // Await the persistence layer before refreshing the visible project list.
  await save();
  document.querySelector<HTMLDialogElement>("#app-modal")?.close();
  render();
  notify(existing ? "Project updated" : "Project created");
}

/** Show the skill form and reveal a category field only when requested. */
function openSkillModal(): void {
  const modal = document.querySelector<HTMLDialogElement>("#app-modal")!;
  modal.innerHTML = `<form id="skill-form" class="modal-form"><div class="modal-heading"><div><span class="eyebrow eyebrow--muted">GROW YOUR TOOLKIT</span><h2>Add a skill</h2></div><button type="button" class="icon-button" data-action="close-modal" aria-label="Close">${icon("close")}</button></div><label class="field">Skill name<input name="skill" required maxlength="32" placeholder="e.g. React"></label><label class="field">Category<select name="category">${skills!.map((group) => `<option>${escapeHtml(group.category)}</option>`).join("")}<option value="__new">Create a category…</option></select></label><label class="field new-category-field" hidden>New category<input name="newCategory" maxlength="32" placeholder="e.g. Frameworks"></label><div class="modal-actions"><button type="button" class="button button--quiet" data-action="close-modal">Cancel</button><button class="button button--dark" type="submit">Add skill ${icon("arrow")}</button></div></form>`;
  modal.showModal();
  modal.querySelector<HTMLInputElement>('input[name="skill"]')?.focus();
  modal
    .querySelector<HTMLFormElement>("#skill-form")
    ?.addEventListener("submit", submitSkillForm);
  modal
    .querySelector<HTMLSelectElement>('select[name="category"]')
    ?.addEventListener("change", (event) => {
      modal.querySelector<HTMLElement>(".new-category-field")!.hidden =
        (event.currentTarget as HTMLSelectElement).value !== "__new";
    });
}

/** Add a skill to an existing or newly created category and save it locally. */
function submitSkillForm(event: SubmitEvent): void {
  event.preventDefault();
  const values = new FormData(event.currentTarget as HTMLFormElement);
  const skill = String(values.get("skill")).trim();
  const selectedCategory = String(values.get("category"));
  const category =
    selectedCategory === "__new"
      ? String(values.get("newCategory")).trim()
      : selectedCategory;
  if (!skill || !category) return;
  let group = skills!.find(
    (item) => item.category.toLowerCase() === category.toLowerCase(),
  );
  if (!group) {
    group = { category, skills: [] };
    skills!.push(group);
  }
  if (!group.skills.some((item) => item.toLowerCase() === skill.toLowerCase()))
    group.skills.push(skill);
  localStorage.setItem("devtrack.skills.v1", JSON.stringify(skills));
  document.querySelector<HTMLDialogElement>("#app-modal")?.close();
  render();
  notify("Skill added");
}

function notify(message: string): void {
  const toast = document.querySelector<HTMLDivElement>("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("toast--visible");
  window.setTimeout(() => toast.classList.remove("toast--visible"), 2400);
}

/** Connect navigation, project actions, filters, and modal controls to state changes. */
function bindEvents(): void {
  app!.querySelectorAll<HTMLElement>("[data-action]").forEach((element) =>
    element.addEventListener("click", async (event) => {
      const target = event.currentTarget as HTMLElement;
      const action = target.dataset.action;
      if (action === "navigate") {
        view = target.dataset.view as View;
        render();
      } else if (action === "new-project") {
        openProjectModal();
      } else if (action === "new-skill") {
        openSkillModal();
      } else if (action === "edit-profile") {
        openProfileModal();
      } else if (action === "close-modal") {
        document.querySelector<HTMLDialogElement>("#app-modal")?.close();
      } else if (action === "edit") {
        const project = projects.find((item) => item.id === target.dataset.id);
        if (project) openProjectModal(project);
      } else if (action === "delete") {
        const project = projects.find((item) => item.id === target.dataset.id);
        if (
          project &&
          window.confirm(`Delete “${project.name}”? This cannot be undone.`)
        ) {
          projects = projects.filter((item) => item.id !== project.id);
          await save();
          render();
          notify("Project deleted");
        }
      } else if (action === "clear-filters") {
        searchTerm = "";
        statusFilter = "All statuses";
        technologyFilter = "All technologies";
        render();
      } else if (action === "remove-skill") {
        const group = skills!.find(
          (item) => item.category === target.dataset.category,
        );
        if (group) {
          group.skills = group.skills.filter(
            (skill) => skill !== target.dataset.skill,
          );
          localStorage.setItem("devtrack.skills.v1", JSON.stringify(skills));
          render();
          notify("Skill removed");
        }
      }
    }),
  );

  const bindSearch = (input: HTMLInputElement | null): void =>
    input?.addEventListener("input", () => {
      searchTerm = input.value;
      const cursor = input.selectionStart;
      render();
      const replacement = document.querySelector<HTMLInputElement>(
        `#${input.id}`,
      );
      replacement?.focus();
      replacement?.setSelectionRange(cursor, cursor);
    });
  bindSearch(app!.querySelector<HTMLInputElement>("#global-search"));
  bindSearch(app!.querySelector<HTMLInputElement>("#project-search"));
  app!
    .querySelector<HTMLSelectElement>("#status-filter")
    ?.addEventListener("change", (event) => {
      statusFilter = (event.currentTarget as HTMLSelectElement).value;
      render();
    });
  app!
    .querySelector<HTMLSelectElement>("#technology-filter")
    ?.addEventListener("change", (event) => {
      technologyFilter = (event.currentTarget as HTMLSelectElement).value;
      render();
    });

  document
    .querySelector<HTMLDialogElement>("#app-modal")
    ?.addEventListener("click", (event) => {
      if (event.target === event.currentTarget)
        (event.currentTarget as HTMLDialogElement).close();
    });
}

/** Load persisted records before rendering the first application view. */
async function start(): Promise<void> {
  projects = await loadProjects();
  render();
}

void start().catch((error: unknown) => {
  console.error("Could not start DevTrack:", error);
  app!.innerHTML =
    '<main class="load-error"><strong>DevTrack could not load.</strong><p>Check that browser storage is available, then refresh.</p></main>';
});
