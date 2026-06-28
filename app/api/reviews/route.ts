import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Public endpoint: a visitor submits their rating + review. We persist every
// submission (high or low rating) so the clinic owns the data, then the client
// hands the user off to Google's official write-review dialog.
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'صيغة غير صحيحة' }, { status: 400 })
  }

  const name = String(body.name ?? '').trim()
  const rating = Number(body.rating)
  const comment = body.comment ? String(body.comment).trim().slice(0, 2000) : null
  const phone = body.phone ? String(body.phone).trim().slice(0, 40) : null
  const email = body.email ? String(body.email).trim().slice(0, 200) : null
  const serviceType = body.serviceType ? String(body.serviceType).trim().slice(0, 120) : null

  if (name.length < 2) {
    return NextResponse.json({ error: 'الرجاء إدخال الاسم' }, { status: 400 })
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'الرجاء اختيار عدد النجوم' }, { status: 400 })
  }

  const review = await prisma.review.create({
    data: { name, rating, comment, phone, email, serviceType, source: 'landing', status: 'new' },
    select: { id: true },
  })

  return NextResponse.json({ id: review.id }, { status: 201 })
}
