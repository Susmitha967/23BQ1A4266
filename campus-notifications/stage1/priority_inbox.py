"""
Stage 1: Priority Inbox - Campus Notifications Microservice
Fetches notifications from API and returns top N by priority score.
Priority = weight(type) + recency_score(timestamp)
"""

import requests
import heapq
from datetime import datetime
from typing import Optional
import argparse
import json
import os

# ─── Configuration ────────────────────────────────────────────────────────────
API_URL = "http://4.224.186.213/evaluation-service/notifications"

# Weight by notification type: Placement > Event > Result
TYPE_WEIGHT = {
    "Placement": 3,
    "Event": 2,
    "Result": 1,
}

# ─── Auth / Headers ───────────────────────────────────────────────────────────
def get_headers() -> dict:
    """
    The API is a protected route.
    Add your Bearer token to env var NOTIFICATION_API_TOKEN if required.
    """
    token = os.environ.get("NOTIFICATION_API_TOKEN", "")
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


# ─── Fetch ────────────────────────────────────────────────────────────────────
def fetch_notifications() -> list[dict]:
    """Fetch all notifications from the evaluation-service API."""
    try:
        resp = requests.get(API_URL, headers=get_headers(), timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return data.get("notifications", [])
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Failed to fetch notifications: {e}")
        return []


# ─── Scoring ─────────────────────────────────────────────────────────────────
def parse_timestamp(ts: str) -> datetime:
    """Parse ISO-like timestamp string."""
    try:
        return datetime.strptime(ts, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        return datetime.min


def compute_priority_score(notification: dict, now: datetime) -> float:
    """
    Priority Score = type_weight + recency_score

    recency_score: higher for more recent notifications.
      We normalise age in minutes; cap at 1440 min (24 h).
      recency_score = max(0, 1 - age_minutes / 1440)
      This gives a value in [0, 1].

    Final score is therefore in range (0, 4].
    """
    type_w = TYPE_WEIGHT.get(notification.get("Type", ""), 1)
    ts = parse_timestamp(notification.get("Timestamp", ""))
    age_minutes = max(0, (now - ts).total_seconds() / 60)
    recency = max(0.0, 1.0 - age_minutes / 1440.0)
    return type_w + recency


# ─── Core Logic ───────────────────────────────────────────────────────────────
def get_top_n_notifications(n: int = 10, notifications: Optional[list] = None) -> list[dict]:
    """
    Return the top-n priority notifications from the live API (or a supplied list).
    Uses a min-heap of size n for O(M log n) efficiency where M = total notifications.
    """
    if notifications is None:
        notifications = fetch_notifications()

    if not notifications:
        return []

    now = datetime.now()

    # heap stores (score, index, notification) — index breaks ties deterministically
    heap: list[tuple] = []

    for idx, notif in enumerate(notifications):
        score = compute_priority_score(notif, now)
        if len(heap) < n:
            heapq.heappush(heap, (score, idx, notif))
        elif score > heap[0][0]:
            heapq.heapreplace(heap, (score, idx, notif))

    # Sort descending by score
    top = sorted(heap, key=lambda x: x[0], reverse=True)
    return [item[2] for item in top]


# ─── Display ──────────────────────────────────────────────────────────────────
def display_priority_inbox(top_notifications: list[dict], n: int) -> None:
    """Pretty-print the priority inbox."""
    print(f"\n{'═' * 60}")
    print(f"  🔔  PRIORITY INBOX  —  Top {n} Notifications")
    print(f"{'═' * 60}")

    if not top_notifications:
        print("  No notifications found.")
        print(f"{'═' * 60}\n")
        return

    type_icons = {"Placement": "💼", "Event": "🎉", "Result": "📊"}

    for rank, notif in enumerate(top_notifications, start=1):
        icon = type_icons.get(notif.get("Type", ""), "🔔")
        print(f"\n  #{rank}  {icon}  [{notif.get('Type', 'Unknown')}]")
        print(f"       Message  : {notif.get('Message', 'N/A')}")
        print(f"       Timestamp: {notif.get('Timestamp', 'N/A')}")
        print(f"       ID       : {notif.get('ID', 'N/A')}")

    print(f"\n{'═' * 60}\n")


# ─── CLI ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="Campus Notifications — Priority Inbox"
    )
    parser.add_argument(
        "-n", "--top",
        type=int,
        default=10,
        help="Number of top priority notifications to display (default: 10)",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output results as JSON instead of pretty-print",
    )
    args = parser.parse_args()

    print(f"[INFO] Fetching notifications from API...")
    top = get_top_n_notifications(n=args.top)

    if args.json:
        print(json.dumps(top, indent=2))
    else:
        display_priority_inbox(top, args.top)


if __name__ == "__main__":
    main()
