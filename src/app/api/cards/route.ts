import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const cards = await prisma.card.findMany({
            where: {
                userId: parseInt(userId),
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ cards });
    } catch (error) {
        console.error('Error fetching cards:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, balance, monthlyRefreshed, monthlyConsumed, annualCount } = body;

        if (!name) {
            return NextResponse.json({ error: 'Card name is required' }, { status: 400 });
        }

        const card = await prisma.card.create({
            data: {
                name,
                balance: parseInt(balance) || 0,
                monthlyRefreshed: !!monthlyRefreshed,
                monthlyConsumed: !!monthlyConsumed,
                annualCount: parseInt(annualCount) || 0,
                userId: parseInt(userId),
            },
        });

        return NextResponse.json({ success: true, card });
    } catch (error) {
        console.error('Error creating card:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
