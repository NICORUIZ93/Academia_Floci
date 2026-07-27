# Web

The `web` directory contains the official Angular application for Floci Academy. The
content of the lessons lives in `public/content/` and is presented through the
educational reader at `src/app/course/`.

## Running the academy

```bash
npm ci
npm start
```

Then open `http://localhost:4200`.

## What's included

- 14 tracks from beginner to advanced levels.
- Markdown, copyable code and Mermaid diagrams.
- Local progress tracking, search, light/dark theme, and responsive design.
- Practices, labs, and official documentation within each module.

## Main files

- `src/`: Angular application.
- `public/content/`: lesson and documentation published content.
- `package.json`: development, testing, and build commands.

## Validate changes

From the root of the repository:

```bash
./scripts/validate.sh
cd web && npm run build --silent
cd web && npm test -- --watch=false
cd web && npm run e2e
```
