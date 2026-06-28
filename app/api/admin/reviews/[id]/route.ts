import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth'

const ALLOWED_STATUS = new Set(['new', 'approved', 'archived'])

// Update a review's status or owner reply.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const data: { status?: string; reply?: string } = {}

  if (typeof (body as { status?: unknown }).status === 'string') {
    const status = (body as { status: string }).status
    if (!ALLOWED_STATUS.has(status)) {
      return NextResponse.json({ error: 'invalid status' }, { status: 400 })
    }
    data.status = status
  }
  if (typeof (body as { reply?: unknown }).reply === 'string') {
    data.reply = (body as { reply: string }).reply.slice(0, 2000)
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'no fields' }, { status: 400 })
  }

  try {
    const review = await prisma.review.update({ where: { id }, data })
    return NextResponse.json({ review })
  } catch {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const { id } = await params
  try {
    await prisma.review.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }
}
