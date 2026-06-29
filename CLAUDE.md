# CLAUDE.md — ITIL Change Management App

This file documents known pitfalls, conventions, and architectural decisions for this project.
Claude Code must read this before making any edits.

---

## Known JSX / Parser Pitfalls

### ❌ `return(` causes a crash
The artifact/Claude Code JSX parser fails silently or throws `returnReact is not defined` when `return` is immediately followed by `(` with no space.

**Always write:**
```jsx
return (
  <div>...</div>
);
```
**Never write:**
```jsx
return(<div>...</div>);
```

This applies to every component, arrow function, and ternary return — no exceptions.

### ❌ Accumulated edits corrupt large single-file components
When making multiple sequential edits to a file over 500 lines, parser errors accumulate. If you see an `Unexpected token` error after several edits, do a full rewrite of the affected file rather than attempting further patches.

---

## Architecture

### State management
All application state lives in `App.jsx` and is passed down as props. There is no Redux or Context — keep it that way unless the prop-drilling becomes unmanageable.

State is now backed by a PostgreSQL database via an Express + Prisma API in `api/`. App.jsx fetches on login and updates state optimistically from API responses — no full page reloads needed.

### Backend (api/)
```
api/
  package.json          # Express, @prisma/client, cors
  .env                  # DATABASE_URL (not committed — copy from .env.example)
  prisma/
    schema.prisma       # Change, Task, Template models
    seed.js             # Seed with demo data (node prisma/seed.js)
  src/
    index.js            # Express entry — listens on port 3001
    routes/
      changes.js        # GET/POST/PATCH /api/changes, tasks sub-routes
      templates.js      # GET/POST/PATCH /api/templates
```

**API conventions:**
- IDs are generated server-side: CHG0001, TASK0001, SCT001
- Changes are returned with `tasks` nested (Prisma `include`)
- `PATCH` endpoints accept any subset of top-level fields; relational keys (`tasks`, `createdAt`) are stripped before update

### Dev workflow
```
# Terminal 1 — frontend
npm run dev

# Terminal 2 — API
npm run dev:api

# Or both at once
npm run dev:all
```

Vite proxies `/api/*` → `http://localhost:3001` in dev (`vite.config.js`).

### First-time setup
```
# 1. Install frontend deps
npm install

# 2. Install API deps + generate Prisma client
cd api
npm install

# 3. Create .env from example and set DATABASE_URL
cp .env.example .env

# 4. Push schema to Postgres (creates tables)
npm run db:push

# 5. Seed with demo data
npm run db:seed
```

### Component split (target structure)
```
src/
  App.jsx                  # All state, routing logic, user session
  components/
    LoginScreen.jsx
    Sidebar.jsx
    Dashboard.jsx
    ChangeRegister.jsx
    SubmitChange.jsx
    CABView.jsx
    GanttChart.jsx
    MyChanges.jsx
    MyTasks.jsx
    StandardTemplates.jsx
    ChangeDetail.jsx
```

### Dashboard filter bug (resolved)
Pre-computing filtered counts in `App.jsx` and passing them as props to `Dashboard` caused stale/incorrect counts when the Register was also filtering. 

**Fix:** Move filter logic *inside* `ChangeRegister` (or whichever component consumes it), not in `App`. Dashboard stat cards should derive counts at render time from the raw `changes` array, not from pre-filtered props.

---

## Data Model

### Change object shape
```js
{
  id: "CHG0001",
  type: "Standard" | "Normal" | "Emergency",
  title: string,
  description: string,
  justification: string,
  risk: "Low" | "Medium" | "High" | "Critical",
  impact: string,
  startDate: ISO string,        // implementation window start
  endDate: ISO string,          // implementation window end
  rollback: string,
  stage: "New" | "Awaiting CAB" | "Approved" | "Implementation" | "Review" | "Completed" | "Rejected",
  submittedBy: string,
  assignedTo: string,
  cabVotes: { [user]: "Approve" | "Reject" | "Defer" },
  tasks: Task[],
  comments: Comment[],
  createdAt: ISO string,
  updatedAt: ISO string,
  templateId: string | null,
}
```

### Standard Change Template shape
```js
{
  id: "TMPL001",
  title: string,
  description: string,
  category: string,
  risk: "Low" | "Medium" | "High" | "Critical",
  status: "Pending CAB Approval" | "Approved" | "Rejected",
  submittedBy: string,
  // Pre-filled fields that populate the change form when selected
  rollback: string,
  tasks: Task[],
}
```

---

## Branding & Colours

### Ogi palette
| Token | Hex |
|---|---|
| Ogi Red (primary) | `#E8312A` |
| Ogi Navy | `#002966` |
| Ogi Blue | `#0066FF` |
| Ogi Yellow | `#FFC629` |

### Slate UI theme (background/text/border)
```js
const SLATE = {
  "--color-background-primary":   "#f8fafc",
  "--color-background-secondary": "#f1f5f9",
  "--color-background-tertiary":  "#e2e8f0",
  "--color-text-primary":         "#0f172a",
  "--color-text-secondary":       "#475569",
  "--color-text-tertiary":        "#94a3b8",
  "--color-border-tertiary":      "rgba(15,23,42,0.08)",
  "--color-border-secondary":     "rgba(15,23,42,0.14)",
};
```

### Stage badge colours
```js
const STAGE_C = {
  New: "#185FA5",
  "Awaiting CAB": "#534AB7",
  Approved: "#27500A",
  Rejected: "#791F1F",
  Implementation: "#854F0B",
  Review: "#0C447C",
  Completed: "#085041",
};
```

### Change type badge colours
```js
const T_COLOR = { Standard: "#0C447C", Normal: "#3C3489", Emergency: "#791F1F" };
const T_BG    = { Standard: "#E6F1FB", Normal: "#EEEDFE", Emergency: "#FCEBEB" };
```

---

## User Roles & Demo Accounts

| User | Role | Permissions |
|---|---|---|
| Alice Johnson | Requester | Submit changes, view own changes, track tasks |
| Liam Mainwaring | Change Manager | All of the above + advance stages, manage CAB schedule |
| Jordan Faith | CAB Approver | All of the above + vote Approve / Reject / Defer on CAB view |

Role is stored on the session object: `{ name, role }`.

---

## Planned Integrations (not yet implemented)

### Authentication
Currently uses demo role-picker login. `App.jsx` derives the user name from `USER_NAMES[role]` (e.g., "Alice Johnson") and sends it as `requester`/`createdBy` on API calls. Replace with real auth (see Azure Entra ID below) when ready.

### Azure Entra ID (MSAL)
- Use `@azure/msal-react` with `@azure/msal-browser`
- App roles map to the three roles above (`Requester`, `ChangeManager`, `CABApprover`)
- Replace the `LoginScreen` demo login with `useMsal()` hook and `loginPopup` / `loginRedirect`
- See: https://learn.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-react

### Backend / PostgreSQL
- All state currently held in React — replace with REST API calls (fetch/axios)
- Recommended stack: Node.js + Express + pg (or Prisma)
- Attachments: store in Azure Blob Storage, save URL reference in DB

### Deployment
- Azure Static Web Apps via Azure DevOps pipeline
- `staticwebapp.config.json` needed for client-side routing (all paths → `index.html`)

---

## Gantt Chart Notes
- Renders in `GanttChart.jsx` using pure SVG — no external chart library
- Clash detection: flags overlapping changes in the same risk category within the same window
- Features: today line, zoom controls (1 week / 2 weeks / 1 month), hover tooltips
- Date range driven by the earliest `startDate` and latest `endDate` across all non-rejected changes

---

## Standard Change Templates — Status Lifecycle
```
Draft → Pending CAB Approval → Approved (available in library) / Rejected
```
Only `Approved` templates appear in the change submission form dropdown.
CAB Approver role can approve/reject templates from the Templates view.
