# Notepad FH

**English** | [中文](./README.zh-CN.md)

A personal notepad and task management app built with Vue 3 + Vite, with data stored locally in the browser's IndexedDB.

## Features

- **Today View** — View and manage today's tasks
- **Task Management** — Create, edit, and complete tasks
- **Statistics** — Visualize task completion with charts
- **History** — Browse past task completion records
- **PDF Export** — Export task data to PDF files
- **Theme Switching** — Customize theme colors
- **Local Storage** — Offline storage via Dexie (IndexedDB), no backend required

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend Framework | [Vue 3](https://vuejs.org/) |
| Build Tool | [Vite](https://vitejs.dev/) |
| Routing | [Vue Router](https://router.vuejs.org/) |
| Database | [Dexie](https://dexie.org/) (IndexedDB) |
| Charts | [Chart.js](https://www.chartjs.org/) + [vue-chartjs](https://vue-chartjs.org/) |
| PDF Generation | [html2pdf.js](https://github.com/eKoopmans/html2pdf.js/) |
| CSS Preprocessor | [Sass](https://sass-lang.com/) |
| Type Checking | [TypeScript](https://www.typescriptlang.org/) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- npm >= 9

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Type Check

```bash
npm run type-check
```

## Project Structure

```
src/
├── components/      # Shared components
│   ├── LanguageSwitcher.vue
│   ├── PdfExportModal.vue
│   ├── TaskForm.vue
│   ├── TaskTags.vue
│   ├── ThemePicker.vue
├── composables/     # Composable functions
│   ├── useLabels.ts
│   ├── useLocale.ts
│   └── useTheme.ts
├── db/              # Database (Dexie)
│   └── index.ts
├── router/          # Route configuration
│   └── index.ts
├── styles/          # Global styles (Sass)
│   ├── index.scss
│   ├── _variables.scss
│   ├── _mixins.scss
│   ├── _base.scss
│   └── _animations.scss
├── views/           # Page views
│   ├── Today.vue
│   ├── Stats.vue
│   └── History.vue
├── App.vue
└── main.ts
```

## License

This project is licensed under the [MIT License](./LICENSE).
