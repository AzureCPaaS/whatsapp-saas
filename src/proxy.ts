import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const session = request.cookies.get("ws_session")?.value;
    const isLoginPage = request.nextUrl.pathname.startsWith("/login");
    const isSignupPage = request.nextUrl.pathname.startsWith("/signup");
    const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");

    if (!session && isDashboardPage) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (session && (isLoginPage || isSignupPage)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/signup"],
};
