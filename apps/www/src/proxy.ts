import { type NextRequest, NextResponse } from "next/server";
import { utcDateKey } from "@/dailyChallenge/date";

export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL(`/daily/${utcDateKey(new Date())}`, request.url));
}

export const config = {
  matcher: "/daily",
};
