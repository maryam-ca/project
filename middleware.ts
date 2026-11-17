import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Edge-level guard for /admin and /account (pages & server actions re-check role themselves).
export async function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  let role: string | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-only-secret"));
      role = payload.role as string;
    } catch {}
  }
  const path = req.nextUrl.pathname;
  const needsAdmin = path.startsWith("/admin");
  if (!role || (needsAdmin && role !== "ADMIN")) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(path)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/account/:path*"] };
