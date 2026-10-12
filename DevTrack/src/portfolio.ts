interface PortfolioProject {
  title: string;
  category: string;
  filter: string;
  status: string;
  description: string;
  technologies: string[];
  visual: string;
  visualLabel: string;
  href?: string;
}

// Project labels distinguish working software from coursework and early concepts.
const projects: PortfolioProject[] = [
  {
    title: "DevTrack",
    category: "TypeScript / Developer Productivity",
    filter: "typescript",
    status: "Built for coursework",
    description:
      "A project manager and developer workspace for tracking ideas, progress, technologies, and learning goals. Includes local persistence and a TypeScript terminal demonstration.",
    technologies: ["TypeScript", "HTML", "CSS", "Vite", "Node.js"],
    visual: "devtrack",
    visualLabel: "Live project · DevTrack workspace",
    href: "/",
  },
  {
    title: "Smart Study Planner",
    category: "JavaScript / Productivity",
    filter: "javascript",
    status: "Learning project",
    description:
      "A study-planning concept for organizing academic tasks, planning study sessions, and making learning progress easier to see.",
    technologies: ["JavaScript", "HTML", "CSS"],
    visual: "planner",
    visualLabel: "Concept preview · not a product screenshot",
  },
  {
    title: "Study Resource Manager",
    category: "Cloud Databases / Application Development",
    filter: "cloud",
    status: "Learning project",
    description:
      "A project from my cloud database learning journey, exploring how an application can organize and manage study resources.",
    technologies: ["Cloud databases", "Application development"],
    visual: "resources",
    visualLabel: "Concept preview · not a product screenshot",
  },
  {
    title: "KLAFind",
    category: "Web Development / Local Discovery",
    filter: "web",
    status: "Concept",
    description:
      "Find what you need. Where you need it. A local discovery concept for helping people find useful services and resources in their area.",
    technologies: ["Web development", "Local discovery"],
    visual: "local",
    visualLabel: "Concept preview · not a product screenshot",
  },
  {
    title: "Movie Planner",
    category: "JavaScript / API Integration",
    filter: "javascript",
    status: "Learning project",
    description:
      "A movie discovery and planning concept for practicing API integration, working with JSON data, and organizing movie information.",
    technologies: ["JavaScript", "JSON", "External APIs"],
    visual: "movie",
    visualLabel: "Concept preview · not a product screenshot",
  },
  {
    title: "MetaVolt Tech UG",
    category: "Business Web Development / Digital Experiences",
    filter: "web",
    status: "Website concept",
    description:
      "A technology business website concept exploring clear digital storytelling and a professional web presence. Possibility Thinking.",
    technologies: ["Web development", "Digital experiences"],
    visual: "metavolt",
    visualLabel: "Concept preview · not a product screenshot",
  },
];

const skillGroups = [
  {
    title: "Programming languages",
    note: "Studied and developing familiarity",
    skills: ["JavaScript", "TypeScript", "Python"],
  },
  {
    title: "Frontend development",
    note: "Built and explored",
    skills: ["HTML", "CSS", "Responsive design", "DOM manipulation", "Vite"],
  },
  {
    title: "Backend & databases",
    note: "Learning through coursework and projects",
    skills: ["Node.js", "Express.js", "EJS", "MySQL", "Database fundamentals"],
  },
  {
    title: "Development tools",
    note: "Tools in my current workflow",
    skills: [
      "VS Code",
      "Git",
      "GitHub",
      "Netlify",
      "Render",
      "MySQL Workbench",
    ],
  },
];

// Keep learning areas framed as an ongoing student journey, not completed credentials.
const learningAreas = [
  {
    number: "01",
    title: "Programming foundations",
    detail:
      "JavaScript, programming logic, functions, arrays, and object-oriented concepts.",
    marker: "FOUNDATIONS",
  },
  {
    number: "02",
    title: "Frontend development",
    detail:
      "HTML, CSS, responsive layouts, DOM interaction, and browser-based applications.",
    marker: "IN PRACTICE",
  },
  {
    number: "03",
    title: "Backend development",
    detail:
      "Node.js, Express.js, routing, server-side rendering, and database integration.",
    marker: "EXPLORING",
  },
  {
    number: "04",
    title: "Software testing",
    detail:
      "Requirements, test cases, verification, validation, end-to-end testing, and regression testing.",
    marker: "BUILDING HABITS",
  },
  {
    number: "05",
    title: "Current focus · TypeScript",
    detail:
      "Typed application development, asynchronous programming, classes, recursion, and structured software projects.",
    marker: "CURRENT FOCUS",
  },
];

// Generate project cards from typed records so their filters and visible content stay in sync.
const projectCards = projects
  .map(
    (project, index) => `
      <article class="work-card reveal" data-category="${project.filter}">
        <div class="work-preview work-preview--${project.visual}">
          <div class="preview-window" aria-hidden="true">
            <div class="preview-window__bar"><span></span><span></span><span></span><small>${String(index + 1).padStart(2, "0")} / ${project.filter.toUpperCase()}</small></div>
            <div class="preview-window__content preview-window__content--${project.visual}">
              <div class="preview-lines"><i></i><i></i><i></i><i></i></div>
              <div class="preview-shape"><span>${project.visual === "movie" ? "PLAY" : project.visual === "local" ? "KLA" : project.visual === "metavolt" ? "MV" : project.visual === "planner" ? "WEEK" : project.visual === "resources" ? "READ" : "MI"}</span></div>
              <div class="preview-side"><i></i><i></i><i></i></div>
            </div>
          </div>
          <span class="preview-label">${project.visualLabel}</span>
          <span class="preview-number">${String(index + 1).padStart(2, "0")}</span>
        </div>
        <div class="work-card__body">
          <div class="work-card__meta"><span>${project.category}</span><span class="work-status"><i></i>${project.status}</span></div>
          <h3>${project.title}</h3>
          <p>${project.description}</p>
          <div class="tech-tags">${project.technologies.map((technology) => `<span>${technology}</span>`).join("")}</div>
          <div class="work-card__links">${project.href ? `<a href="${project.href}" class="text-link">Open DevTrack <span aria-hidden="true">↗</span></a>` : '<span class="link-pending">Project link not supplied</span>'}<span class="link-pending">Source link not supplied</span></div>
        </div>
      </article>`,
  )
  .join("");

const skillCards = skillGroups
  .map(
    (group, index) => `
      <article class="skill-card reveal">
        <div class="skill-card__index">0${index + 1}</div>
        <div class="skill-card__content"><p>${group.note}</p><h3>${group.title}</h3><div class="skill-list">${group.skills.map((skill) => `<span>${skill}</span>`).join("")}</div></div>
      </article>`,
  )
  .join("");

const journeyCards = learningAreas
  .map(
    (area) => `
      <article class="journey-item reveal">
        <span class="journey-item__number">${area.number}</span>
        <div class="journey-item__copy"><span class="micro-label">${area.marker}</span><h3>${area.title}</h3><p>${area.detail}</p></div>
        <span class="journey-item__tick" aria-hidden="true">+</span>
      </article>`,
  )
  .join("");

// Render the page shell first, then attach its navigation and filtering interactions.
const app = document.querySelector<HTMLDivElement>("#portfolio-app");
if (!app) throw new Error("Portfolio page root was not found.");

app.innerHTML = `
  <header class="site-header">
    <a class="wordmark" href="#home" aria-label="Murungi Innocent, home"><span class="wordmark__tile">MI</span><span>Murungi Innocent<small>SOFTWARE DEVELOPMENT</small></span></a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation"><span></span><span></span><span class="sr-only">Toggle navigation</span></button>
    <nav class="site-nav" id="primary-navigation" aria-label="Primary navigation">
      <a href="#home">Home</a><a href="#about">About</a><a href="#skills">Skills</a><a href="#projects">Projects</a><a href="#journey">Learning journey</a><a href="#contact">Contact</a><a href="/">DevTrack app ↗</a>
    </nav>
    <a class="header-status" href="#projects"><i></i> Open to learning</a>
  </header>

  <main>
    <section class="hero section-wrap" id="home">
      <div class="hero__copy">
        <p class="eyebrow"><span class="eyebrow__line"></span> SOFTWARE DEVELOPER · STUDENT · KAMPALA, UG</p>
        <h1>Building ideas<br>into <span>digital</span><br><span class="hero__last">experiences.</span></h1>
        <p class="hero__intro">I'm Murungi Innocent, a software development student and aspiring software engineer from Uganda. I enjoy building practical applications, exploring modern technologies, and turning ideas into useful solutions.</p>
        <div class="hero__actions"><a class="button button--acid" href="#projects">View my projects <span aria-hidden="true">↘</span></a><a class="button button--outline" href="#contact">Let's connect <span aria-hidden="true">↗</span></a><a class="button button--devtrack" href="/">Open DevTrack <span aria-hidden="true">↗</span></a></div>
        <div class="hero__learning"><span class="learning-pulse"></span><span>NOW LEARNING</span><strong>TypeScript</strong><span class="hero__learning-divider">/</span><span>BYU–IDAHO LEARNING PATHWAY</span></div>
      </div>
      <div class="hero-art" aria-label="Developer identity illustration showing Murungi Innocent's initials and current learning focus">
        <div class="hero-art__grid"></div><div class="hero-art__orbit hero-art__orbit--outer"></div><div class="hero-art__orbit hero-art__orbit--inner"></div>
        <div class="identity-panel"><div class="identity-panel__top"><span>PERSONAL FIELD NOTES</span><span>UG / 00</span></div><div class="identity-monogram">MI<span>.</span></div><div class="identity-panel__rule"></div><div class="identity-panel__row"><span>FIELD</span><strong>SOFTWARE DEVELOPMENT</strong></div><div class="identity-panel__row"><span>BASED IN</span><strong>KAMPALA, UGANDA</strong></div><div class="identity-panel__row"><span>APPROACH</span><strong>BUILD · LEARN · REFINE</strong></div><div class="identity-panel__bottom"><span class="signal-bars"><i></i><i></i><i></i><i></i><i></i></span><span>IN PROGRESS, ALWAYS</span></div></div>
        <span class="art-coordinate art-coordinate--one">00° 19' N</span><span class="art-coordinate art-coordinate--two">32° 35' E</span><span class="art-index">PERSONAL PORTFOLIO / 2026</span>
      </div>
      <a class="hero-scroll" href="#about"><span>SCROLL TO EXPLORE</span><i></i></a>
    </section>

    <section class="about section-wrap section-pad" id="about">
      <div class="section-kicker"><span>01</span><span>ABOUT ME</span></div>
      <div class="about__layout"><div class="section-intro"><p class="micro-label">THE PERSON BEHIND THE PROJECTS</p><h2>Curiosity is<br>part of the <em>process.</em></h2><span class="section-accent"></span></div><div class="about__copy"><p class="about__lead">I'm a software development student with a strong interest in creating useful, accessible, and thoughtfully engineered digital experiences.</p><p>My journey involves learning programming fundamentals, developing web applications, working with databases, and exploring how different technologies can solve practical problems.</p><p>I enjoy experimenting, troubleshooting, improving my code, and learning from every project I build. My goal is to keep growing into a software engineer who can design and develop reliable applications that serve real people.</p><div class="education-line"><span class="education-line__mark">BYU</span><span><strong>BYU-Pathway Worldwide / BYU-Idaho</strong><small>SOFTWARE DEVELOPMENT LEARNING PATHWAY</small></span></div></div></div>
      <div class="fact-grid"><div><span>NAME</span><strong>Murungi Innocent</strong></div><div><span>LOCATION</span><strong>Kampala, Uganda</strong></div><div><span>FIELD</span><strong>Software Development</strong></div><div><span>CURRENT FOCUS</span><strong>TypeScript · Web · Backend</strong></div><div><span>LEARNING APPROACH</span><strong>Projects · Reflection · Iteration</strong></div></div>
    </section>

    <section class="skills-section section-pad" id="skills"><div class="section-wrap">
      <div class="section-kicker"><span>02</span><span>TECHNICAL TOOLKIT</span></div><div class="section-heading"><div><p class="micro-label">STUDIED, USED, AND STILL EXPLORING</p><h2>Tools for the<br><em>next useful thing.</em></h2></div><p class="section-heading__aside">A growing toolkit, not a scorecard. Each technology represents something I've studied, used, or am building familiarity with.</p></div>
      <div class="skills-grid">${skillCards}</div>
    </div></section>

    <section class="projects-section section-wrap section-pad" id="projects">
      <div class="section-kicker"><span>03</span><span>SELECTED WORK & IDEAS</span></div><div class="section-heading section-heading--projects"><div><p class="micro-label">PRACTICE MADE VISIBLE</p><h2>Things I'm<br><em>making sense of.</em></h2></div><p class="section-heading__aside">Coursework, learning projects, and concepts. Some are working software; others are ideas I'm exploring. I'll add project links as they become available.</p></div>
      <div class="project-toolbar"><div class="filter-list" role="group" aria-label="Filter projects by category"><button class="filter-button is-selected" type="button" data-filter="all" aria-pressed="true">All <span>06</span></button><button class="filter-button" type="button" data-filter="typescript" aria-pressed="false">TypeScript</button><button class="filter-button" type="button" data-filter="javascript" aria-pressed="false">JavaScript</button><button class="filter-button" type="button" data-filter="cloud" aria-pressed="false">Cloud & data</button><button class="filter-button" type="button" data-filter="web" aria-pressed="false">Web concepts</button></div><p class="project-count" aria-live="polite">Showing 6 projects</p></div>
      <div class="work-grid">${projectCards}</div>
    </section>

    <section class="journey-section section-pad" id="journey"><div class="section-wrap">
      <div class="section-kicker"><span>04</span><span>LEARNING JOURNEY</span></div><div class="journey-intro"><div><p class="micro-label">A WORK IN PROGRESS</p><h2>One concept<br>leads to <em>another.</em></h2></div><p>My learning path moves between fundamentals and practical projects. Each step gives me a new way to think about building useful software.</p></div>
      <div class="journey-list">${journeyCards}</div><p class="journey-note"><span></span> CURRENT CHAPTER: CSE 310 · APPLIED PROGRAMMING · MODULE 3</p>
    </div></section>

    <section class="beyond section-wrap section-pad" id="beyond"><div class="section-kicker"><span>05</span><span>BEYOND THE CODE</span></div><div class="beyond__layout"><div><p class="micro-label">A FEW OTHER CURIOSITIES</p><h2>Good ideas don't<br>stay in one <em>lane.</em></h2></div><div class="beyond__content"><p>I'm drawn to the visual side of technology too: the details that make digital tools feel clear, useful, and a little surprising.</p><div class="interest-list"><span><i>01</i> Automotive visuals & creative car edits</span><span><i>02</i> Modern technology & futuristic interfaces</span><span><i>03</i> Exploring new software tools</span><span><i>04</i> Turning everyday problems into practical ideas</span></div></div></div></section>

    <section class="contact-section section-pad" id="contact"><div class="section-wrap"><div class="contact-top"><div class="section-kicker"><span>06</span><span>CONTACT</span></div><span class="contact-coordinate">KAMPALA · UGANDA</span></div><div class="contact-main"><p class="micro-label">OPEN TO GOOD CONVERSATIONS</p><h2>Have an idea?<br><em>Let's build something.</em></h2><p class="contact-copy">I'm always interested in connecting with people who enjoy technology, creative problem-solving, and building useful digital experiences.</p><div class="contact-options"><div><span>EMAIL</span><strong>Address not supplied</strong><small>ADD EMAIL ADDRESS</small></div><div><span>GITHUB</span><strong>Profile link not supplied</strong><small>ADD GITHUB URL</small></div><div><span>LINKEDIN</span><strong>Profile link not supplied</strong><small>ADD LINKEDIN URL</small></div><div><span>LOCATION</span><strong>Kampala, Uganda</strong><small>UGANDA · EAT (UTC+3)</small></div></div></div><div class="contact-stamp" aria-hidden="true">MI<span> / </span>LET'S MAKE IT USEFUL</div></div></section>
  </main>

  <footer class="site-footer"><a class="footer-mark" href="#home">MI<span>.</span></a><p>Designed and developed by Murungi Innocent.</p><nav aria-label="Footer navigation"><a href="#about">About</a><a href="#projects">Projects</a><a href="#contact">Contact</a><a href="/">DevTrack app ↗</a></nav><span class="copyright">© <span id="copyright-year"></span> MURUNGI INNOCENT</span></footer>
`;

const menuButton = document.querySelector<HTMLButtonElement>(".menu-toggle");
const navigation = document.querySelector<HTMLElement>("#primary-navigation");

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  navigation?.classList.toggle("is-open", !isOpen);
});

navigation?.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton?.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
  });
});

const filterButtons =
  document.querySelectorAll<HTMLButtonElement>("[data-filter]");
const workCards = document.querySelectorAll<HTMLElement>(".work-card");
const projectCount = document.querySelector<HTMLElement>(".project-count");

// Update card visibility and aria-pressed state together for accessible filtering.
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedFilter = button.dataset.filter ?? "all";
    let visibleCount = 0;

    filterButtons.forEach((item) => {
      const isSelected = item === button;
      item.classList.toggle("is-selected", isSelected);
      item.setAttribute("aria-pressed", String(isSelected));
    });

    workCards.forEach((card) => {
      const isVisible =
        selectedFilter === "all" || card.dataset.category === selectedFilter;
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    if (projectCount) {
      projectCount.textContent = `Showing ${visibleCount} ${visibleCount === 1 ? "project" : "projects"}`;
    }
  });
});

document.querySelector<HTMLSpanElement>("#copyright-year")!.textContent =
  String(new Date().getFullYear());

// Reveal content as it enters view and keep it visible in browsers without this API.
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  document
    .querySelectorAll<HTMLElement>(".reveal")
    .forEach((element) => revealObserver.observe(element));
} else {
  document
    .querySelectorAll<HTMLElement>(".reveal")
    .forEach((element) => element.classList.add("is-visible"));
}
