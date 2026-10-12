# Smart Study Planner

Smart Study Planner is a browser-based study organization tool for students who want a simple way to turn course deadlines into an actionable plan. Users can add tasks, assign a course, deadline, priority, and category, then search, filter, complete, or remove tasks. The application saves the plan in the browser with `localStorage`.

## Software Demo Video

**Video link: https://www.loom.com/share/e91a8b316bd6478f876d062a37e0a512** 

The recording must show the application running, demonstrate adding and managing tasks, walk through the JavaScript and CSS, and include a talking-head image of me while I present the project.

## Development Environment

This project was developed in Visual Studio Code and tested as a static browser application. Git is used for version control and GitHub is used for publication.

The project uses:

- HTML5 for the application structure and accessible form controls.
- CSS3 for the responsive dashboard layout, colors, typography, and task states.
- Modern JavaScript (ES6+) for application state, functions, DOM manipulation, array methods, event handling, recursion, and exception handling.
- The date-fns JavaScript library, loaded from jsDelivr, for reliable deadline parsing and formatting.

## Useful Websites

- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [MDN Array Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [MDN Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [date-fns Documentation](https://date-fns.org/)
- [Markdown Guide](https://www.markdownguide.org/cheat-sheet/)
- [GitHub Docs](https://docs.github.com/)

## Features Demonstrated

- JavaScript functions organize task creation, filtering, rendering, persistence, and progress calculations.
- Screen output updates the dashboard counters, task list, category summary, status messages, and toast notifications.
- ES6 array methods including `map`, `filter`, `reduce`, `find`-style set construction, and spread syntax process task data.
- Recursion is used by `renderCategoryTree` to render each category summary from a list of category entries.
- A third-party library, date-fns, formats deadlines and identifies tasks due today.
- Exception throwing and handling validates task input and handles malformed saved browser data.
- DOM manipulation creates task elements, updates controls, and responds to user events without reloading the page.
- CSS provides a responsive layout that works on desktop and mobile screens.

## How to Run

1. Clone or download this repository.
2. Open the `Smart-Study-Planner` folder in Visual Studio Code.
3. Open `index.html` in a browser, or use a local development server such as the VS Code Live Server extension.
4. Add a task and interact with the planner. Data is saved in that browser's local storage.

## Planned Video Walkthrough

The completed video should follow this sequence: introduce the problem and interface, add a few tasks with different courses and priorities, demonstrate search and filters, mark a task complete, remove a task, refresh to show persistence, then explain the main functions and required module concepts in the source code. The presenter must remain visible in a talking-head view during the explanation.
