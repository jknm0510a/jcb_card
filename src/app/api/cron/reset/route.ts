import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    // Basic protection to ensure it's only called by Vercel CRON.
    // In a real production app, use CRON_SECRET: https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await prisma.card.updateMany({
            data: {
                monthlyRefreshed: false,
                monthlyConsumed: false,
            },
        });

        return NextResponse.json({ success: true, count: result.count });
    } catch (error) {
        console.error('Failed to reset cards:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
