// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';

// Initialize Firebase Admin
import { initializeApp, getApps, cert } from 'firebase-admin/app';

const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

if (getApps().length === 0) {
    initializeApp({
        credential: cert(serviceAccount),
    });
}

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    // Skip middleware for public routes
    const publicPaths = ['/', '/auth/callback'];
    if (publicPaths.includes(request.nextUrl.pathname)) {
        return NextResponse.next();
    }

    // Check for auth cookie
    const sessionCookie = cookies().get('session')?.value;

    if (!sessionCookie) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Verify the session cookie
    try {
        await getAuth().verifySessionCookie(sessionCookie, true);
        return NextResponse.next();
    } catch (error) {
        return NextResponse.redirect(new URL('/', request.url));
    }
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/home/:path*', '/capsule/:path*'],
};