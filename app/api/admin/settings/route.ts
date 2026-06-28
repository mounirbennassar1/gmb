import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { getSettings, setSettings } from '@/lib/config'

const ALLOWED_KEYS = [
  'clinicNameAr',
  'clinicNameEn',
  'headline',
  'subheadline',
  'googlePlaceId',
  'googleWriteReviewUrl',
]

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ settings: await getSettings() })
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
  const patch: Record<string, string> = {}
  for (const key of ALLOWED_KEYS) {
    if (typeof body[key] === 'string') patch[key] = body[key] as string
  }
  await setSettings(patch)
  return NextResponse.json({ settings: await getSettings() })
}
