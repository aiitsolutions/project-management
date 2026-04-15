---
name: system-architecture
description: Understand the project structure, database schema, API endpoints, and component hierarchy
---

# System Architecture

This is a Nuxt 3 + Express (Nitro) full-stack project management application modeled after Zoho Sprints.

## Project Structure

```
project-management/
├── .opencode/              # OpenCode configurations & skills
├── assets/                  # Static assets (CSS, images)
├── components/             # Reusable Vue components
├── composables/            # Vue composables (useX patterns)
├── layouts/               # Nuxt layouts
├── middleware/            # Nuxt middleware (auth, etc)
├── pages/                # Nuxt pages (file-based routing)
│   └── workspace/
│       ├── projects/
│       │   └── [id]/
│       │       ├── backlog.vue      # Kanban-style backlog/board
│       │       ├── sprints.vue    # Sprint board view
│       │       └── items/       # Item CRUD
│       └── settings/
├── public/                # Public static files
├── server/                # Nitro server (API routes)
│   ├── api/              # API endpoints
│   └── utils/            # Server utilities (db.ts)
├── stores/               # Pinia stores
├── types/                # TypeScript types
└── app.vue              # Root Vue component
```

## Database Schema

The app uses a JSON file-based database stored in `utils/db.ts`:

### Projects
```json
{
  "id": 1,
  "name": "Project Name",
  "prefix": "PROJ",
  "lastItemNumber": 0,
  "ownerId": 1,
  "createdAt": "2024-01-01",
  "updatedAt": "2024-01-01"
}
```

### Items (Tasks/Stories/Bugs)
```json
{
  "id": 1,
  "uid": "PROJ-0001",
  "projectId": 1,
  "parentId": null,
  "title": "Task title",
  "description": "",
  "type": "Story|Task|Bug",
  "priority": "Low|Medium|High",
  "status": "Backlog|To Do|In Progress|Done",
  "startDate": null,
  "endDate": null,
  "sprintId": null,
  "teamAllocations": [{ "userId": 1, "effort": 1, "estimatedHours": 4 }],
  "timeLogs": [],
  "createdAt": "2024-01-01",
  "updatedAt": "2024-01-01"
}
```

### Sprints
```json
{
  "id": 1,
  "projectId": 1,
  "name": "Sprint 1",
  "goal": "",
  "status": "Not Started|In Progress|Completed",
  "startDate": "2024-01-01",
  "endDate": "2024-01-14",
  "createdAt": "2024-01-01",
  "updatedAt": "2024-01-01"
}
```

### Users
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "profile_photo": "",
  "isActive": true
}
```

### Releases
```json
{
  "id": 1,
  "projectId": 1,
  "name": "Release 1.0",
  "status": "Planned|Released",
  "releaseDate": null,
  "createdAt": "2024-01-01",
  "updatedAt": "2024-01-01"
}
```

### Workspace Settings
```json
{
  "id": 1,
  "colorScheme": "#10B981",
  "statuses": [
    { "id": 1, "name": "Backlog", "category": "backlog" },
    { "id": 2, "name": "To Do", "category": "todo" },
    { "id": 3, "name": "In Progress", "category": "inprogress" },
    { "id": 4, "name": "Done", "category": "done" }
  ]
}
```

## API Endpoints

| Method | Endpoint | Description |
|-------|----------|-------------|
| GET/POST | `/api/projects` | List/Create projects |
| GET/PUT/DELETE | `/api/projects?id={id}` | Single project operations |
| GET | `/api/items` | List items (supports ?projectId, ?sprintId filters) |
| POST | `/api/items` | Create new item |
| GET/PUT/DELETE | `/api/items?id={id}` | Single item operations |
| GET | `/api/sprints` | List sprints (supports ?projectId filter) |
| POST/PUT/DELETE | `/api/sprints?id={id}` | Sprint operations |
| GET | `/api/users` | List users |
| GET | `/api/workspace/statuses` | Get workspace statuses & settings |
| GET | `/api/releases` | List releases (supports ?projectId filter) |

## Component Hierarchy

### Pages
- `pages/workspace/projects/[id]/sprints.vue` - Main sprint board
- `pages/workspace/projects/[id]/backlog.vue` - Project backlog with sprints accordion
- `pages/workspace/projects/[id]/items/[itemId].vue` - Item detail/edit
- `pages/workspace/projects/[id]/items/create.vue` - Create item form
- `pages/workspace/settings/workspace.vue` - Workspace configuration

### Key Components
- `CreateItemModal.vue` - Modal for creating items (Task/Story/Bug)
- `RichTextEditor.vue` - WYSIWYG description editor

### Composables
- `useSettings()` - Workspace settings (colorScheme, statuses)
- `useToast()` - Toast notifications

## Theming

- Primary color stored in workspace settings
- CSS variables in `assets/css/main.css`
- Dark mode via `html.dark-theme` class on document root

## Item Flow

1. **Created** → Status: "Backlog"
2. **Moved to Sprint** → Status auto-changes to "To Do"
3. **In Progress** → Status: "In Progress"
4. **Completed** → Status: "Done"

## Item Status Auto-Rules

- Item moving from Backlog → Sprint: Status becomes "To Do"
- Item moving from Sprint → Backlog: Status becomes "Backlog"
- Sub-items inherit parent's sprintId when parent changes

## Use This Skill When

- User asks about project structure or architecture
- User asks how items/sprints are stored
- User asks about API endpoints or database schema
- Need to understand component hierarchy
- Need to add new features involving data flow