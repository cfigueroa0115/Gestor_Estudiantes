import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import type { Cargo } from '@/types';

// --- Route Configuration ---

const PRIVATE_ROUTES = ['/dashboard', '/dashboard/users', '/dashboard/requests'];
const PRIVATE_API_ROUTES = ['/api/users', '/api/student-requests'];
const PUBLIC_ROUTES = ['/', '/api/auth/login', '/autogestion', '/api/autogestion', '/api/estudiantes'];

// --- Role-Based Access Configuration (preparation for future restrictions) ---

interface RoutePermission {
  path: string;
  allowedCargos: Cargo[];
}

/**
 * Permitted roles per route. Currently allows all cargos for all routes.
 * When ROLE_RESTRICTIONS_ENABLED is set to "true", this configuration
 * will be used to restrict access based on the user's cargo.
 */
const ROUTE_PERMISSIONS: RoutePermission[] = [
  { path: '/dashboard', allowedCargos: ['Profesor', 'Jefe', 'Administrativo'] },
  { path: '/dashboard/users', allowedCargos: ['Profesor', 'Jefe', 'Administrativo'] },
  { path: '/dashboard/requests', allowedCargos: ['Profesor', 'Jefe', 'Administrativo'] },
  { path: '/api/users', allowedCargos: ['Profesor', 'Jefe', 'Administrativo'] },
  { path: '/api/student-requests', allowedCargos: ['Profesor', 'Jefe', 'Administrativo'] },
];

// --- Helper Functions ---

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
}

function isPrivateRoute(pathname: string): boolean {
  return PRIVATE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
}

function isPrivateApiRoute(pathname: string): boolean {
  return PRIVATE_API_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
}

function getRoutePermission(pathname: string): RoutePermission | undefined {
  // Find the most specific matching route permission (longest path match)
  return ROUTE_PERMISSIONS
    .filter((rp) => pathname === rp.path || pathname.startsWith(rp.path + '/'))
    .sort((a, b) => b.path.length - a.path.length)[0];
}

// --- Middleware ---

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // SECURITY: Block all DELETE requests on data APIs (prevent data destruction)
  if (request.method === 'DELETE') {
    return NextResponse.json({ error: 'Operacion no permitida' }, { status: 403 });
  }

  // Allow public routes through without any checks
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const isApiRoute = isPrivateApiRoute(pathname);
  const isPageRoute = isPrivateRoute(pathname);

  // If the route is neither private page nor private API, allow through
  if (!isApiRoute && !isPageRoute) {
    return NextResponse.next();
  }

  // Extract token from session cookie
  const token = request.cookies.get('session')?.value;

  // Verify JWT token
  if (!token) {
    return handleUnauthenticated(request, isApiRoute);
  }

  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);

    const cargo = payload.cargo as Cargo;

    // Check role-based restrictions
    const roleRestrictionsEnabled =
      process.env.ROLE_RESTRICTIONS_ENABLED === 'true';

    if (roleRestrictionsEnabled) {
      const permission = getRoutePermission(pathname);

      if (permission && !permission.allowedCargos.includes(cargo)) {
        return NextResponse.json(
          { error: 'Permisos insuficientes' },
          { status: 403 }
        );
      }
    }

    // Token is valid and role check passed (or restrictions disabled)
    return NextResponse.next();
  } catch {
    // Token is invalid or expired
    return handleUnauthenticated(request, isApiRoute);
  }
}

function handleUnauthenticated(
  request: NextRequest,
  isApiRoute: boolean
): NextResponse {
  if (isApiRoute) {
    return NextResponse.json(
      { error: 'No autenticado' },
      { status: 401 }
    );
  }

  // For page routes, redirect to landing page
  const url = request.nextUrl.clone();
  url.pathname = '/';
  return NextResponse.redirect(url);
}

// --- Middleware Config ---

export const config = {
  matcher: ['/dashboard/:path*', '/api/users/:path*', '/api/student-requests/:path*'],
};
