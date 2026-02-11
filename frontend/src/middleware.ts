/**
 * Middleware de Supabase Auth
 * Solo protege rutas que requieren autenticación
 * Las rutas públicas (/, /login) no requieren auth
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Rutas que requieren autenticación
const PROTECTED_ROUTES = ['/dashboard', '/proyectos', '/normativa']

function isProtectedRoute(pathname: string) {
    return PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Saltarse auth en desarrollo si está configurado
    if (process.env.NEXT_PUBLIC_SKIP_AUTH === 'true') {
        return NextResponse.next({ request })
    }

    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Rutas públicas que NO requieren autenticación
    const publicRoutes = ['/login', '/auth', '/', '/api/auth']
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))

    // Si NO hay usuario y la ruta NO es pública → redirigir a /login
    if (!user && !isPublicRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        // Guardar la URL original para redirigir después del login (opcional)
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
    }

    // Si HAY usuario y está en /login → redirigir a /dashboard
    if (user && pathname.startsWith('/login')) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|api).*)',
    ],
}
