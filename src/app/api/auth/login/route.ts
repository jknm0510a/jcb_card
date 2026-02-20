import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { phoneNumber } = await request.json();

        if (!phoneNumber) {
            return NextResponse.json({ error: '請提供手機號碼' }, { status: 400 });
        }

        // Upsert user: create if not exists, otherwise return existing
        const user = await prisma.user.upsert({
            where: { phoneNumber },
            update: {},
            create: { phoneNumber },
        });

        // Set cookie
        // Note: In production, use signed/encrypted cookies or JWT
        const cookieStore = await cookies();
        cookieStore.set('userId', user.id.toString(), {
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
