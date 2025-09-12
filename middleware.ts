import { NextResponse, NextRequest } from 'next/server'
import { auth } from '@/auth'

export async function middleware(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers
    })

    if (!session) {
        return NextResponse.redirect(new URL("/", request.url))
    }
}

export const config = {
    matcher: '/map/*',
}