import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const userType = req.auth?.user?.userType;
  const { pathname, origin } = req.nextUrl;

  const isAdminLoginPage = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin");
  const isStaffLoggedIn = userType === "staff";

  if (isAdminRoute && !isAdminLoginPage && !isStaffLoggedIn) {
    const loginUrl = new URL("/admin/login", origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (isAdminLoginPage && isStaffLoggedIn) {
    return NextResponse.redirect(new URL("/admin/dashboard", origin));
  }

  const isClientAuthPage =
    pathname === "/area-do-cliente/login" || pathname === "/area-do-cliente/cadastro";
  const isClientRoute = pathname.startsWith("/area-do-cliente");
  const isClientLoggedIn = userType === "client";

  if (isClientRoute && !isClientAuthPage && !isClientLoggedIn) {
    const loginUrl = new URL("/area-do-cliente/login", origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (isClientAuthPage && isClientLoggedIn) {
    return NextResponse.redirect(new URL("/area-do-cliente", origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/area-do-cliente/:path*"],
};
