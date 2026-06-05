import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = new URLSearchParams();
  if (searchParams.get("limit")) params.set("limit", searchParams.get("limit")!);
  if (searchParams.get("page")) params.set("page", searchParams.get("page")!);
  if (searchParams.get("notification_type")) params.set("notification_type", searchParams.get("notification_type")!);

  const token = process.env.NOTIFICATION_API_TOKEN ?? "";
  const url = `http://4.224.186.213/evaluation-service/notifications${params.toString() ? "?" + params.toString() : ""}`;

  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });

  const data = await res.json();
  return NextResponse.json(data);
}
