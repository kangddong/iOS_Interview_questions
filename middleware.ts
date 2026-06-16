import { NextResponse, type NextRequest } from "next/server";

const REALM = "iOS Interview Admin";

export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;

  if (!user || !pass) {
    return NextResponse.next();
  }

  const header = req.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const [u, ...rest] = decoded.split(":");
      const p = rest.join(":");
      if (u === user && p === pass) {
        return NextResponse.next();
      }
    } catch {
      /* fall through */
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"` },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};
