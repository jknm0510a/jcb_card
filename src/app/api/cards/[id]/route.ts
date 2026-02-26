import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const id = (await params).id;
        // Verify ownership
        const card = await prisma.card.findUnique({
            where: { id: parseInt(id) },
        });

        if (!card) {
            return NextResponse.json({ error: 'Card not found' }, { status: 404 });
        }

        if (card.userId !== parseInt(userId)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.card.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting card:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const id = (await params).id;
        const body = await request.json();
        console.log('PATCH API received body:', body);

        // Verify ownership
        const card = await prisma.card.findUnique({
            where: { id: parseInt(id) },
        });

        if (!card) {
            return NextResponse.json({ error: 'Card not found' }, { status: 404 });
        }

        if (card.userId !== parseInt(userId)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const updatedCard = await prisma.card.update({
            where: { id: parseInt(id) },
            data: {
                ...(body.bankName !== undefined && { bankName: body.bankName }),
                ...(body.cardName !== undefined && { cardName: body.cardName }),
                ...(body.balance !== undefined && { balance: parseInt(body.balance) }),
                ...(body.monthlyRefreshed !== undefined && { monthlyRefreshed: body.monthlyRefreshed }),
                ...(body.monthlyConsumed !== undefined && { monthlyConsumed: body.monthlyConsumed }),
                ...(body.annualCount !== undefined && { annualCount: body.annualCount }),
            },
        });

        return NextResponse.json({ success: true, card: updatedCard });
    } catch (error) {
        console.error('Error updating card:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
