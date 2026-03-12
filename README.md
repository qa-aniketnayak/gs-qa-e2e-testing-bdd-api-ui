## GS QA E2E Testing (BDD – API & UI)

Playwright + Cucumber (BDD) + TypeScript framework for **API** and **UI** end‑to‑end automation of the Camping World ESP checkout experience and related APIs.

### Tech stack

- **Language**: TypeScript
- **Test runner (UI & API)**: `@cucumber/cucumber`
- **Browser automation**: `@playwright/test`
- **Reports**: `cucumber-html-reporter`

### Project structure (high level)

- `features/` – Gherkin feature files  
  - `features/ui/` – UI checkout flows  
  - `features/api/` – API scenarios
- `src/`
  - `hooks/` – Cucumber hooks and custom World
  - `step-definitions/` – step implementations (API & UI)
  - `ui/locators/` – Playwright locators per page
  - `ui/pages/` – Page Object Model classes
  - `api/` – API client, services, validators
  - `scripts/` – Cucumber runner + HTML report generator
  - `utils/` – CSV writer and helpers
- `fixtures/` – test data (e.g. checkout UI data)
- `reports/` – cucumber JSON + HTML reports (output)
- `output/` – CSV output for API extraction tests

### Prerequisites

- **Node.js**: v18+ (LTS recommended)
- **npm**: v9+ (bundled with recent Node)

### Install dependencies

From the project root:

```bash
npm install
```

Install Playwright browsers (first time on a machine or after cleanup):

```bash
npx playwright install
```

### Environment configuration

- Default ENV is defined in `config/env.ts`:
  - `ENV = process.env.ENV || 'qa'`
- Base URL for UI & API is defined in `config/urls.ts`:
  - `BASE_URL = 'https://gs-unified-web-git-esp-master-camping-world.vercel.app/'`

You can override `ENV` at runtime:

```bash
ENV=qa npm run test:ui
```

(On Windows PowerShell:)

```powershell
$env:ENV="qa"; npm run test:ui
```

### Available npm scripts

All commands are defined in `package.json`.

- **Run core Cucumber test runner** (do not call directly in CI, prefer tagged scripts):

```bash
npm run cucumber:run
```

- **API test suites**

```bash
npm run test:api        # all API scenarios (@api)
npm run test:address    # address validation subset (@address)
npm run test:latest     # latest tagged scenarios (@latest)
```

- **UI test suites**

```bash
npm run test:ui         # UI checkout flows (@ui)
```

- **Tag-based regression/smoke**

```bash
npm run test:smoke      # @smoke
npm run test:regression # @regression
```

Each `test:*` script:

1. Runs Cucumber with the appropriate tag(s)
2. Generates `reports/cucumber-report.json`
3. Triggers `scripts/generate-html-report.js` to build `reports/cucumber-report.html`

### Running UI automation locally

From the project root:

```bash
npm install
npx playwright install
npm run test:ui
```

Notes:

- UI hooks live in `src/hooks/common.hooks.ts` and are driven by the `@ui` tag.
- Page objects are under `src/ui/pages/` and expose high‑level actions per screen.

### Running API automation

From the project root:

```bash
npm run test:api        # all @api tests
npm run test:address    # address validation only
npm run test:latest     # latest subset
```

API clients/services live under `src/api/` and use Playwright’s `APIRequestContext`.

### Reports

After any `test:*` command:

- JSON report: `reports/cucumber-report.json`
- HTML report: `reports/cucumber-report.html`

Open the HTML report in a browser to review:

- Scenarios and steps (pass/fail)
- Tags
- Metadata (framework, etc.)

UI failures also capture screenshots per failed step (see `reports/screenshots/steps`).

### Outputs (CSV)

Bulk API extraction scenarios write CSVs to `output/`, for example:

- `vehicle_styles_autos_2024.csv`
- `vehicle_styles_autos_2024_failures.csv`

These are managed via `src/utils/csvWriter.ts`.

### Coding conventions (summary)

- **BDD**: human‑readable Gherkin in `features/`, implementation in `src/step-definitions/`.
- **POM**: one page class per UI screen, locators separated into `locators/`.
- **Strong typing**: TypeScript + strict compiler options.
- **Single responsibility**: 
  - Steps: orchestration & readability.  
  - Pages/services: low‑level actions and assertions.  
  - Hooks/World: browser/context lifecycle.

For larger changes (new flows, APIs, or tags), follow the existing structure and naming to keep the suite maintainable and scalable.

