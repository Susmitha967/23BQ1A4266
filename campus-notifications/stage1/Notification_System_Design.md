# Stage 1

## Overview

The Priority Inbox feature surfaces the **top N most important unread notifications** from the campus notifications feed. It is implemented as a standalone Python script that:

1. Fetches live notifications from the Evaluation Service API
2. Scores each notification using a **priority formula**
3. Efficiently extracts the top-N using a **min-heap** (O(M log N))
4. Displays the ranked inbox in the terminal (or outputs JSON)

---

## Priority Scoring Formula

```
priority_score = type_weight + recency_score
```

### Type Weight

Notifications are ranked by category importance:

| Type       | Weight |
|------------|--------|
| Placement  | 3      |
| Event      | 2      |
| Result     | 1      |

*Rationale*: Placement notifications are time-critical and career-impacting; Events need timely awareness; Results are informational.

### Recency Score

```
age_minutes  = (now - notification_timestamp) / 60
recency      = max(0, 1 - age_minutes / 1440)
```

- A notification from **right now** scores **+1.0**
- A notification **24 hours old** scores **+0.0**
- Combined score range: **(0, 4]**

This ensures that among notifications of the same type, newer ones bubble up first.

---

## Efficient Top-N Maintenance

As new notifications stream in, keeping the top-N updated efficiently is critical.

### Algorithm: Min-Heap of Size N

```
For each incoming notification:
    score = compute_priority_score(notification)
    if heap.size < N:
        heap.push(notification, score)
    elif score > heap.min_score:
        heap.replace_min(notification, score)
```

- **Time complexity**: O(M log N) where M = total notifications
- **Space complexity**: O(N) — only the top-N are kept in memory
- **Why not sort?** Sorting is O(M log M); heap is faster when N << M

This design is streaming-friendly: as new notifications arrive, we run the same logic against the heap without reprocessing all past notifications.

---

## How to Run

### Install dependencies
```bash
pip install requests
```

### Run (default top 10)
```bash
python priority_inbox.py
```

### Run top 20
```bash
python priority_inbox.py -n 20
```

### Run with JSON output
```bash
python priority_inbox.py -n 10 --json
```

### Protected API — set token if required
```bash
export NOTIFICATION_API_TOKEN="your_token_here"
python priority_inbox.py
```

---

## Sample Output

```
════════════════════════════════════════════════════════════
  🔔  PRIORITY INBOX  —  Top 10 Notifications
════════════════════════════════════════════════════════════

  #1  💼  [Placement]
       Message  : CSX Corporation hiring
       Timestamp: 2026-04-22 17:51:18
       ID       : b283218f-ea5a-4b7c-93a9-1f2f240d64b0

  #2  💼  [Placement]
       Message  : Advanced Micro Devices Inc. hiring
       Timestamp: 2026-04-22 17:49:42
       ID       : 8a7412bd-6065-4d09-8501-a37f11cc848b

  #3  🎉  [Event]
       Message  : farewell
       Timestamp: 2026-04-22 17:51:06
       ID       : 81589ada-0ad3-4f77-9554-f52fb558e09d
  ...
```

---

## File Structure

```
stage1/
├── priority_inbox.py          # Core logic + CLI
└── Notification_System_Design.md  # This file
```
