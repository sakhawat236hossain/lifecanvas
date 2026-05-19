import { withAuth } from "next-auth/middleware";
import { NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
  },
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/memories/:path*",
    "/add-memory/:path*",
    "/goals/:path*",
    "/habits/:path*",
    "/journals/:path*",
    "/achievements/:path*",
    // API route protection
    "/api/dashboard/:path*",
    "/api/memories/:path*",
    "/api/goals/:path*",
    "/api/habits/:path*",
    "/api/journals/:path*",
    "/api/achievements/:path*",
  ],
};
