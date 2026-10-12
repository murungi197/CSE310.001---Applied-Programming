const path = require("path");
const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const port = process.env.PORT || 3000;
const hasSupabase = Boolean(
  process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY,
);
const supabase = hasSupabase
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : null;

let nextCourseId = 4;
let nextResourceId = 7;
let courses = [
  { course_id: 1, course_code: "CSE 270", course_name: "Software Testing" },
  { course_id: 2, course_code: "CSE 310", course_name: "Applied Programming" },
  {
    course_id: 3,
    course_code: "CSE 340",
    course_name: "Web Backend Development",
  },
];
let resources = [
  {
    resource_id: 1,
    course_id: 2,
    title: "JavaScript Array Methods",
    description: "Map, filter, find, and reduce with practical examples.",
    resource_url:
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
    resource_type: "Documentation",
  },
  {
    resource_id: 2,
    course_id: 2,
    title: "CSE 310 Module Guide",
    description:
      "Weekly module notes, assignments, and cloud database checkpoints.",
    resource_url: "https://byui.edu",
    resource_type: "Course Notes",
  },
  {
    resource_id: 3,
    course_id: 2,
    title: "JavaScript Recursion",
    description:
      "Recursion examples and practice exercises for problem solving.",
    resource_url: "https://javascript.info/recursion",
    resource_type: "Tutorial",
  },
  {
    resource_id: 4,
    course_id: 3,
    title: "Express Routing",
    description: "Build organized routes and REST endpoints with Express.",
    resource_url: "https://expressjs.com/en/guide/routing.html",
    resource_type: "Documentation",
  },
  {
    resource_id: 5,
    course_id: 3,
    title: "Node.js Notes",
    description: "A compact reference for modules, HTTP, and async patterns.",
    resource_url: "https://nodejs.org/en/learn",
    resource_type: "Course Notes",
  },
  {
    resource_id: 6,
    course_id: 1,
    title: "Testing Methodologies",
    description: "A visual overview of unit, integration, and system testing.",
    resource_url: "https://martinfowler.com/testing/",
    resource_type: "Article",
  },
];

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

async function list(table, fallback) {
  if (!supabase) return fallback;
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order(table === "courses" ? "course_code" : "created_at", {
      ascending: false,
    });
  if (error) throw error;
  return data;
}

async function insert(table, payload, fallback) {
  if (!supabase) return fallback;
  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function update(table, idField, id, payload, fallback) {
  if (!supabase) return fallback;
  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq(idField, id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function remove(table, idField, id) {
  if (!supabase) return;
  const { error } = await supabase.from(table).delete().eq(idField, id);
  if (error) throw error;
}

app.get("/api/courses", async (req, res) => {
  try {
    res.json(await list("courses", courses));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/courses", async (req, res) => {
  const { course_code, course_name } = req.body;
  if (!course_code?.trim() || !course_name?.trim())
    return res
      .status(400)
      .json({ error: "Course code and name are required." });
  try {
    const course = {
      course_id: nextCourseId++,
      course_code: course_code.trim().toUpperCase(),
      course_name: course_name.trim(),
    };
    const saved = await insert("courses", course, course);
    if (!supabase) courses.push(saved);
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/resources", async (req, res) => {
  try {
    res.json(await list("resources", resources));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/resources", async (req, res) => {
  const { course_id, title, description, resource_url, resource_type } =
    req.body;
  if (
    !course_id ||
    !title?.trim() ||
    !description?.trim() ||
    !resource_url?.trim() ||
    !resource_type
  )
    return res.status(400).json({ error: "All resource fields are required." });
  try {
    const resource = {
      resource_id: nextResourceId++,
      course_id: Number(course_id),
      title: title.trim(),
      description: description.trim(),
      resource_url: resource_url.trim(),
      resource_type,
    };
    const saved = await insert("resources", resource, resource);
    if (!supabase) resources.push(saved);
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/resources/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { course_id, title, description, resource_url, resource_type } =
    req.body;
  if (
    !course_id ||
    !title?.trim() ||
    !description?.trim() ||
    !resource_url?.trim() ||
    !resource_type
  )
    return res.status(400).json({ error: "All resource fields are required." });
  try {
    const payload = {
      course_id: Number(course_id),
      title: title.trim(),
      description: description.trim(),
      resource_url: resource_url.trim(),
      resource_type,
    };
    const existing = resources.find((item) => item.resource_id === id);
    const saved = await update("resources", "resource_id", id, payload, {
      ...existing,
      ...payload,
    });
    if (!supabase)
      resources = resources.map((item) =>
        item.resource_id === id ? saved : item,
      );
    res.json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/resources/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    await remove("resources", "resource_id", id);
    if (!supabase)
      resources = resources.filter((item) => item.resource_id !== id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html")),
);

app.listen(port, () =>
  console.log(`Study Resource Manager running at http://localhost:${port}`),
);
