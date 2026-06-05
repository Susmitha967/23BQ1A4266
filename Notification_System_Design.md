# Notification System Design

## Stage 1

### Overview

This document explains the approach taken to build a **Priority Inbox** for the Campus Notifications platform. The goal is to always surface the top `n` most important and recent notifications for a student, out of potentially hundreds coming in.

---

### Problem Statement

Students receive a high volume of notifications about Placements, Events, and Results. Without prioritisation, important notifications (like a Placement drive) can get buried under less critical ones (like a general event reminder). The Priority Inbox solves this by ranking notifications using a calculated score based on two factors:

1. **Type Importance** — What kind of notification is it?
2. **Recency** — How fresh is the notification?

---

### Priority Score Formula

Each notification is assigned a **Priority Score** using the following formula:

```
score = (TYPE_WEIGHT / MAX_TYPE_WEIGHT) * 0.7
      + (1 / (1 + ageInMinutes)) * 0.3
```

#### Components:

| Component | Formula | Weight |
|-----------|---------|--------|
| Type Importance | `TYPE_WEIGHT / MAX_TYPE_WEIGHT` | 70% |
| Recency | `1 / (1 + ageInMinutes)` | 30% |

---

### Type Weights

The following weights were assigned based on the relative urgency and student impact of each notification type:

| Type | Weight | Reason |
|------|--------|--------|
| Placement | 3 | Highest urgency — time-sensitive job opportunities |
| Result | 2 | Important academic outcome — students need to act quickly |
| Event | 1 | Informational — lower urgency than placements/results |

---

### Recency Score Explained

The recency score uses an **inverse decay function**:

```
recencyScore = 1 / (1 + ageInMinutes)
```

| Age | Recency Score |
|-----|---------------|
| Just now (0 min) | 1.000 |
| 5 minutes ago | 0.167 |
| 30 minutes ago | 0.032 |
| 60 minutes ago | 0.016 |
| 120 minutes ago | 0.008 |

This ensures:
- Fresh notifications are strongly preferred within the same type.
- An old Placement notification can still rank above a brand-new Event due to the 70/30 weighting.

---

### Maintaining Top-N Efficiency

**Current approach:**
- Fetch all notifications from the API.
- Score each one in `O(n)` time.
- Sort by score in `O(n log n)` time.
- Return the top `n`.

**As new notifications come in:**
- The fetch → score → sort pipeline remains the same.
- Since recency is part of the score, older notifications naturally drop in rank over time even without removal.
- `n` is configurable (10, 15, 20, etc.) and can be passed as a parameter.

**Future Optimisation (if scale grows):**
- Use a **Min-Heap of size n** to maintain the top-N in `O(n log k)` time instead of sorting the full list.
- Cache the scored list and only re-score new deltas on each API poll.
- Introduce a **TTL (Time-To-Live)** cutoff: notifications older than X hours are excluded entirely from scoring to reduce noise.

---

### Key Design Decisions

1. **No database required** — Scores are computed on-the-fly from the API response each time, keeping the solution stateless and simple.
2. **Configurable N** — The top-N value is not hardcoded; it defaults to 10 but can be adjusted easily.
3. **No external libraries** — The algorithm uses only Node.js built-ins (`fetch`), satisfying the constraint of no external libraries for algorithms.
4. **Separation of concerns** — Fetching, scoring, ranking, and displaying are all separate functions for clarity and testability.

---

### How to Run

```bash
# Node.js 18+ required (for native fetch support)
node priorityInbox.js
```

**Expected output:**
```
Fetching notifications from API...
Fetched 30 notifications.

Calculating priority scores...

========================================
       CAMPUS NOTIFICATIONS - TOP 10    
        Priority Inbox (Stage 1)        
========================================

Rank #1
  ID        : b283218f-ea5a-4b7c-93a9-1f2f240d64b0
  Type      : Placement
  Message   : CSX Corporation hiring
  Timestamp : 2026-04-22 17:51:48
  Score     : 0.933472
----------------------------------------
...
```

---

### File Structure

```
notification_app_be/
└── priorityInbox.js     ← Main algorithm file
Notification_System_Design.md ← This file
```