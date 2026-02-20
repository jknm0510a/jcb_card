import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete('userId');

        return NextResponse.json({ success: true, message: 'Successfully logged out' });
    } catch (error) {
        console.error('Error during logout:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
