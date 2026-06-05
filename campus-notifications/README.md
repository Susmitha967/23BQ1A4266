# Campus Notifications Microservice

Full implementation for Stage 1 (Priority Inbox backend) and Stage 2 (React/Next.js frontend).

---

## Project Structure

```
campus-notifications/
├── stage1/
│   ├── priority_inbox.py              # Stage 1 — Python priority inbox script
│   └── Notification_System_Design.md  # Design doc (push to GitHub repo)
└── stage2/
    ├── package.json
    ├── next.config.js
    ├── tsconfig.json
    └── src/
        ├── app/
        │   ├── layout.tsx             # Root layout with MUI theme
        │   └── page.tsx               # Main page with sidebar nav
        ├── components/
        │   ├── NotificationCard.tsx   # Reusable notification card
        │   ├── PriorityInbox.tsx      # Stage 1 UI — Top N priority view
        │   └── AllNotifications.tsx   # Stage 2 UI — All + filter + pagination
        └── lib/
            ├── notifications.ts       # API fetch, scoring, localStorage helpers
            └── theme.tsx              # MUI dark theme
```

---

## Stage 1 — Priority Inbox (Python)

### Install dependency
```bash
cd stage1
pip install requests
```

### Run (default: top 10)
```bash
python priority_inbox.py
```

### Run top 20
```bash
python priority_inbox.py -n 20
```

### Run top 15, JSON output
```bash
python priority_inbox.py -n 15 --json
```

### If the API needs a Bearer token
```bash
export NOTIFICATION_API_TOKEN="your_token_here"
python priority_inbox.py
```

---

## Stage 2 — React/Next.js Frontend

### Requirements
- Node.js >= 18
- npm >= 9

### Install and run
```bash
cd stage2
npm install
npm run dev
```

App runs at **http://localhost:3000**

### Build for production
```bash
npm run build
npm start
```

---

## API Notes

- API endpoint: `http://4.224.186.213/evaluation-service/notifications`
- Query params supported (Stage 2): `limit`, `page`, `notification_type`
- If the API requires auth, set `NEXT_PUBLIC_NOTIFICATION_API_TOKEN` in `.env.local`:
  ```
  NEXT_PUBLIC_NOTIFICATION_API_TOKEN=your_token_here
  ```

---

## Features

### Stage 1
- Fetches live notifications from evaluation API
- Scores by: **type weight** (Placement=3, Event=2, Result=1) + **recency** (0–1 based on age up to 24h)
- Uses **min-heap** for O(M log N) top-N extraction
- CLI flags: `-n` for count, `--json` for JSON output
- Auto-refresh friendly (stateless, call anytime)

### Stage 2
- **Priority Inbox** tab — Top N notifications with configurable N (5/10/15/20/25)
- **All Notifications** tab — Full list with type filter and pagination
- **New vs Viewed** — Purple dot on unread, dimmed for viewed; tracked in localStorage
- **Mark as viewed** — Per-notification or mark all at once
- **Auto-refresh** every 30 seconds
- Responsive — sidebar on desktop, hamburger drawer on mobile
- MUI dark theme, no ShadCN, no other CSS libraries
