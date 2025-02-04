import { NextResponse } from 'next/server';
import gymsData from '@/public/data/data.json';

export async function GET() {
  return NextResponse.json(gymsData);
}
