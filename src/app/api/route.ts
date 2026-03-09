//this is the boilerplate api file - please try and copy the structure of this file when creating new api routes
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        //do something with searchParams if needed
        
        return NextResponse.json({ message: `Hello, world! ${url.searchParams}` });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        //do something with the request body if needed

        return NextResponse.json({ message: 'Data received', data: body });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}