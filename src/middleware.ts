import { NextResponse, type NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

//   if (pathname.startsWith("/app")) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};