# WoHoTech Problems Content

This folder stores LeetCode-style problem content separately from app code.

Recommended structure:

```txt
src/content/problems/<topic>/<problem-slug>/
  problem.mdx
  metadata.json
  hints.json
  editorial.mdx
  testcases.json
  starter-code/
    javascript.js
    python.py
    java.java
    cpp.cpp
```

Rules:

- `problem.mdx` is the user-facing statement.
- `metadata.json` stores title, difficulty, tags, examples, constraints, and ranking fields.
- Use `"judgeReady": false` in `metadata.json` only when the required runner is not implemented yet.
- `hints.json` stores ordered hints.
- `editorial.mdx` stores explanation paragraphs.
- `testcases.json` stores sample and hidden judge cases.
- `starter-code/` stores language starter templates.
- Do not put employee-admin content here. This is only for public WoHoTech practice problems.
- After editing problem content, run `npm run problems:sync` to refresh the generated client-safe problem bank.
- Run `npm run problems:validate` before deploying to catch missing files, duplicate IDs/slugs, and invalid problem metadata.
