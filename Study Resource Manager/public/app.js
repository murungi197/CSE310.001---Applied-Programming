const state = { courses: [], resources: [] };
const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) =>
  String(value).replace(
    /[&<>'"]/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#039;",
        '"': "&quot;",
      })[char],
  );

async function api(url, options) {
  const response = await fetch(url, options);
  if (!response.ok)
    throw new Error((await response.json()).error || "Something went wrong.");
  return response.status === 204 ? null : response.json();
}

async function loadData() {
  [state.courses, state.resources] = await Promise.all([
    api("/api/courses"),
    api("/api/resources"),
  ]);
  renderAll();
}

function courseFor(id) {
  return state.courses.find((course) => course.course_id === Number(id));
}
function resourceMatches(resource) {
  const search = $("#searchInput").value.toLowerCase();
  const course = $("#courseFilter").value;
  const type = $("#typeFilter").value;
  return (
    (!search ||
      `${resource.title} ${resource.description}`
        .toLowerCase()
        .includes(search)) &&
    (course === "all" || String(resource.course_id) === course) &&
    (type === "all" || resource.resource_type === type)
  );
}
function renderAll() {
  $("#resourceCount").textContent = state.resources.length;
  $("#courseCount").textContent = state.courses.length;
  $("#typeCount").textContent = new Set(
    state.resources.map((item) => item.resource_type),
  ).size;
  const currentCourse = $("#courseFilter").value;
  $("#courseFilter").innerHTML =
    '<option value="all">All courses</option>' +
    state.courses
      .map(
        (course) =>
          `<option value="${course.course_id}">${escapeHtml(course.course_code)}</option>`,
      )
      .join("");
  $("#courseFilter").value = state.courses.some(
    (course) => String(course.course_id) === currentCourse,
  )
    ? currentCourse
    : "all";
  const types = [...new Set(state.resources.map((item) => item.resource_type))];
  $("#typeFilter").innerHTML =
    '<option value="all">All types</option>' +
    types
      .map(
        (type) =>
          `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`,
      )
      .join("");
  renderResources();
  renderCourses();
  fillCourseSelect();
}
function renderResources() {
  const filtered = state.resources.filter(resourceMatches);
  $("#resultCount").textContent =
    `${filtered.length} item${filtered.length === 1 ? "" : "s"}`;
  $("#resourceGrid").innerHTML = filtered.length
    ? filtered
        .map((resource) => {
          const course = courseFor(resource.course_id);
          return `<article class="resource-card"><div class="card-top"><span class="course-tag">${escapeHtml(course?.course_code || "Unknown course")}</span><span class="type-pill">${escapeHtml(resource.resource_type)}</span></div><h3>${escapeHtml(resource.title)}</h3><p>${escapeHtml(resource.description)}</p><div class="card-actions"><button data-edit="${resource.resource_id}">Edit</button><button class="delete-button" data-delete="${resource.resource_id}">Delete</button><a href="${escapeHtml(resource.resource_url)}" target="_blank" rel="noreferrer" class="text-button">Open link ↗</a></div></article>`;
        })
        .join("")
    : '<div class="empty-state">No resources match that search yet.</div>';
}
function renderCourses() {
  $("#courseGrid").innerHTML = state.courses
    .map((course, index) => {
      const count = state.resources.filter(
        (resource) => resource.course_id === course.course_id,
      ).length;
      return `<article class="course-card"><span class="course-number">0${index + 1}</span><h3>${escapeHtml(course.course_code)}</h3><p>${escapeHtml(course.course_name)}</p><span class="course-resource-count">${count} resource${count === 1 ? "" : "s"} saved</span></article>`;
    })
    .join("");
}
function fillCourseSelect() {
  $("#resourceCourse").innerHTML = state.courses
    .map(
      (course) =>
        `<option value="${course.course_id}">${escapeHtml(course.course_code)} — ${escapeHtml(course.course_name)}</option>`,
    )
    .join("");
}
function openResource(resource) {
  $("#resourceId").value = resource?.resource_id || "";
  $("#modalEyebrow").textContent = resource ? "EDIT RESOURCE" : "NEW RESOURCE";
  $("#modalTitle").textContent = resource
    ? "Edit your resource"
    : "Add a resource";
  $("#resourceTitle").value = resource?.title || "";
  $("#resourceCourse").value =
    resource?.course_id || state.courses[0]?.course_id || "";
  $("#resourceDescription").value = resource?.description || "";
  $("#resourceUrl").value = resource?.resource_url || "";
  $("#resourceType").value = resource?.resource_type || "Tutorial";
  $("#resourceModal").classList.remove("hidden");
  $("#resourceTitle").focus();
}
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  setTimeout(() => toast.classList.remove("visible"), 2500);
}

$("#searchInput").addEventListener("input", renderResources);
$("#courseFilter").addEventListener("change", renderResources);
$("#typeFilter").addEventListener("change", renderResources);
$("#addResourceButton").addEventListener("click", () => openResource());
$("#addCourseButton").addEventListener("click", () =>
  $("#courseModal").classList.remove("hidden"),
);
document.querySelectorAll(".nav-link").forEach((button) =>
  button.addEventListener("click", () => {
    document
      .querySelectorAll(".nav-link")
      .forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const resources = button.dataset.view === "resources";
    $("#resourcesView").classList.toggle("hidden", !resources);
    $("#coursesView").classList.toggle("hidden", resources);
    $("#breadcrumbLabel").textContent = resources ? "Resources" : "Courses";
    $("#addResourceButton").classList.toggle("hidden", !resources);
  }),
);
document.addEventListener("click", async (event) => {
  const close = event.target.closest("[data-close]");
  if (close) $(`#${close.dataset.close}`).classList.add("hidden");
  const edit = event.target.closest("[data-edit]");
  if (edit)
    openResource(
      state.resources.find(
        (resource) => resource.resource_id === Number(edit.dataset.edit),
      ),
    );
  const remove = event.target.closest("[data-delete]");
  if (remove && confirm("Delete this resource?")) {
    try {
      await api(`/api/resources/${remove.dataset.delete}`, {
        method: "DELETE",
      });
      await loadData();
      showToast("Resource deleted");
    } catch (error) {
      showToast(error.message);
    }
  }
});
$("#resourceForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = $("#resourceId").value;
  const payload = {
    course_id: $("#resourceCourse").value,
    title: $("#resourceTitle").value,
    description: $("#resourceDescription").value,
    resource_url: $("#resourceUrl").value,
    resource_type: $("#resourceType").value,
  };
  try {
    await api(id ? `/api/resources/${id}` : "/api/resources", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    $("#resourceModal").classList.add("hidden");
    await loadData();
    showToast(id ? "Resource updated" : "Resource added");
  } catch (error) {
    showToast(error.message);
  }
});
$("#courseForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await api("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        course_code: $("#courseCode").value,
        course_name: $("#courseName").value,
      }),
    });
    $("#courseModal").classList.add("hidden");
    $("#courseForm").reset();
    await loadData();
    showToast("Course added");
  } catch (error) {
    showToast(error.message);
  }
});
loadData().catch((error) => showToast(error.message));
