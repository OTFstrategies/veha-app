import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Internal routes that portal users (klant_editor, klant_viewer) cannot access
const INTERNAL_ROUTES = [
  "/dashboard",
  "/clients",
  "/employees",
  "/projects",
  "/resources",
  "/week-planning",
  "/weekplanning",
];

// Portal routes for client users
const PORTAL_ROUTES = ["/portal"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define public routes that don't require authentication
  const publicRoutes = ["/login", "/signup", "/forgot-password", "/auth/callback"];
  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  const pathname = request.nextUrl.pathname;

  // Check if accessing internal routes
  const isInternalRoute = INTERNAL_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Check if accessing portal routes
  const isPortalRoute = PORTAL_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!user && !isPublicRoute && pathname !== "/") {
    // No user, redirect to VEHA Hub for login
    return NextResponse.redirect(new URL("https://veha-hub.vercel.app"));
  }

  // If user is authenticated, check role-based access
  if (user && (isInternalRoute || isPortalRoute)) {
    // Get user's role from workspace_members
    // Note: This is a simplified check. In production, you might want to
    // store the role in the session or use a more efficient lookup.
    const { data: memberships } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("profile_id", user.id);

    if (memberships && memberships.length > 0) {
      // Get the first role (or you could check all workspaces)
      const userRole = memberships[0].role;
      const isClientRole = userRole === "klant_editor" || userRole === "klant_viewer";

      // Client users trying to access internal routes
      if (isClientRole && isInternalRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/portal";
        return NextResponse.redirect(url);
      }

      // Internal users trying to access portal routes (they can, but redirect to dashboard)
      // Actually, internal users might want to preview the portal, so we allow access
      // Uncomment below if you want to restrict internal users from portal:
      // if (!isClientRole && isPortalRoute) {
      //   const url = request.nextUrl.clone();
      //   url.pathname = "/dashboard";
      //   return NextResponse.redirect(url);
      // }
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as is.
  return supabaseResponse;
}
