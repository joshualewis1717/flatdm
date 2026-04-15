import { NextResponse } from "next/server";
import { getConfiguredAppBaseUrl } from "@/lib/app-url";
import { consumeEmailVerificationLink } from "@/lib/magic-links";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim();
  const redirectUrl = new URL("/login", getConfiguredAppBaseUrl());

  if (!token) {
    redirectUrl.searchParams.set("verified", "0");
    redirectUrl.searchParams.set("reason", "invalid");
    return NextResponse.redirect(redirectUrl);
  }

  const result = await consumeEmailVerificationLink(token);

  if (!result.ok) {
    redirectUrl.searchParams.set("verified", "0");
    redirectUrl.searchParams.set("reason", result.reason);
    return NextResponse.redirect(redirectUrl);
  }

  redirectUrl.searchParams.set("verified", "1");
  return NextResponse.redirect(redirectUrl);
}
