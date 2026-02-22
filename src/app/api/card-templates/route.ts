import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const templates = await prisma.cardTemplate.findMany({
            orderBy: [
                { bankName: 'asc' },
                { cardName: 'asc' }
            ]
        });

        // Group cards by bank
        const groupedTemplates = templates.reduce((acc: { [key: string]: string[] }, curr) => {
            if (!acc[curr.bankName]) {
                acc[curr.bankName] = [];
            }
            acc[curr.bankName].push(curr.cardName);
            return acc;
        }, {});

        return NextResponse.json({ templates: groupedTemplates });
    } catch (error) {
        console.error('Failed to fetch card templates:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
