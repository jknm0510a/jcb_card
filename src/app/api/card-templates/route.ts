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

        // Format to a simple array of strings for easiest backwards compatibility 
        // with the current UI dropdowns (`[ '銀行 名稱', ... ]`).
        const formattedTemplates = templates.map(t => `${t.bankName} - ${t.cardName}`);

        return NextResponse.json({ templates: formattedTemplates });
    } catch (error) {
        console.error('Failed to fetch card templates:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
