import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Marks that the visitor followed through to Google's review page — used as a
// conversion metric in the admin dashboard.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await prisma.review.update({ where: { id }, data: { clickedGoogle: true } })
  } catch {
    // ignore unknown id — this is best-effort tracking
  }
  return NextResponse.json({ ok: true })
}
