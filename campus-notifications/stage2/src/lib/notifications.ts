export type NotificationType = "Placement" | "Event" | "Result";

export interface Notification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
}

export interface FetchParams {
  limit?: number;
  page?: number;
  notification_type?: NotificationType | "";
}

const TYPE_WEIGHT: Record<string, number> = {
  Placement: 3,
  Event: 2,
  Result: 1,
};

function parseTimestamp(ts: string): Date {
  return new Date(ts.replace(" ", "T"));
}

export function computePriorityScore(notification: Notification): number {
  const typeW = TYPE_WEIGHT[notification.Type] ?? 1;
  const ts = parseTimestamp(notification.Timestamp);
  const now = new Date();
  const ageMinutes = Math.max(0, (now.getTime() - ts.getTime()) / 60000);
  const recency = Math.max(0, 1 - ageMinutes / 1440);
  return typeW + recency;
}

export function getTopN(notifications: Notification[], n: number): Notification[] {
  return [...notifications]
    .sort((a, b) => computePriorityScore(b) - computePriorityScore(a))
    .slice(0, n);
}

export async function fetchNotifications(params: FetchParams = {}): Promise<Notification[]> {
  const url = new URL("/api/notifications", window.location.origin);
  if (params.limit) url.searchParams.set("limit", String(params.limit));
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.notification_type) url.searchParams.set("notification_type", params.notification_type);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.notifications ?? [];
}

const VIEWED_KEY = "campus_viewed_notifications";

export function getViewedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(VIEWED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

export function markAsViewed(id: string): void {
  if (typeof window === "undefined") return;
  const viewed = getViewedIds();
  viewed.add(id);
  localStorage.setItem(VIEWED_KEY, JSON.stringify([...viewed]));
}

export function markAllAsViewed(ids: string[]): void {
  if (typeof window === "undefined") return;
  const viewed = getViewedIds();
  ids.forEach((id) => viewed.add(id));
  localStorage.setItem(VIEWED_KEY, JSON.stringify([...viewed]));
}
