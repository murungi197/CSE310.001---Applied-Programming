# DevTrack

## Overview

This project contains two browser experiences: the DevTrack project manager and a separate personal portfolio at `/portfolio.html`. The portfolio introduces my software development learning journey in Kampala, Uganda. DevTrack organizes projects, tracks progress, searches by status or technology, groups technical skills, and lets you edit your workspace user name and initials. Browser local storage keeps DevTrack records, skills, and profile settings available after refresh.

The project also includes a TypeScript terminal demonstration. It prints project summaries and statistics and shows how classes, typed lists, asynchronous functions, and recursion can be used in a small application. The purpose of DevTrack is to practice those TypeScript concepts in a practical tool that can grow alongside my software development work.

**Software Demo Video:** "https://www.loom.com/share/05fb73c7dd1a4af8a24ef8453ecef1c5"

## Development Environment

- Visual Studio Code
- Node.js and npm
- Vite development server and production bundler
- TypeScript for the browser application and Node.js demonstration
- `tsx` to run the TypeScript terminal demonstration directly
- Browser local storage for project and skill persistence

Install the dependencies and start the browser application:

```sh
npm install
npm run dev
```

Open `http://localhost:5173/portfolio.html` for the personal portfolio page.

### Switching Between Pages

- DevTrack project manager: `http://localhost:5173/`
- Personal portfolio: `http://localhost:5173/portfolio.html`

From the portfolio, use **Open DevTrack** in the hero or **DevTrack app** in the sticky navigation. From DevTrack, choose **Portfolio** in the sidebar.

Run the terminal demonstration or create a production build:

```sh
npm run demo
npm run build
```

The TypeScript module concepts are demonstrated in these files:

- **Terminal output:** `src/terminal-demo.ts` writes project summaries and aggregate statistics with `console.log`.
- **Recursion:** `src/model.ts` recursively counts nested tasks; the demo displays the resulting task progress.
- **Classes:** the `Project` class in `src/model.ts` represents project records and updates progress and status.
- **Lists:** typed arrays store projects, technologies, tasks, and skill groups.
- **Asynchronous functions:** project loading and saving use promise-returning functions in `src/storage.ts`; the terminal demo also uses `async`/`await`.
- **Exception handling:** the terminal demo throws an error if there are no projects and catches it to report the problem.

The personal portfolio's content and interactions are implemented in `src/portfolio.ts`, with an isolated responsive design in `src/portfolio.css`. Project category filters, the mobile navigation, and scroll reveals are functional. Missing source, deployment, email, GitHub, and LinkedIn links are labeled as unavailable until real URLs are provided.

## Useful Websites

- [TypeScript Official Website](https://www.typescriptlang.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Vite Guide](https://vite.dev/guide/)
- [Node.js Documentation](https://nodejs.org/docs/latest/api/)
- [MDN: Window localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

## Future Work

- Record and publish the required 4–5 minute YouTube walkthrough with a talking-head image, then add its link above.
- Publish the completed project and README in a public GitHub repository named `DevTrack`.
- Add automated tests for project progress, recursive task counting, storage, and filtering.
- Add export and import so project data can be backed up or moved between browsers.
