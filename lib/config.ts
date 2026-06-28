import { prisma } from '@/lib/prisma'

export type SiteSettings = {
  clinicNameAr: string
  clinicNameEn: string
  headline: string
  subheadline: string
  googlePlaceId: string
  googleWriteReviewUrl: string
  serviceTypes: string[]
}

// Defaults are placeholders — edit them from the admin panel (الإعدادات).
export const DEFAULT_SETTINGS: SiteSettings = {
  clinicNameAr: 'عيادة مهد دهلان',
  clinicNameEn: 'Mahad Dahlan Clinic',
  headline: 'رأيك يهمّنا',
  subheadline: 'شاركنا تجربتك في العيادة وساعد غيرك على الوصول إلى رعاية أفضل',
  googlePlaceId: '',
  googleWriteReviewUrl: '',
  serviceTypes: ['استشارة عامة', 'الأسنان', 'الجلدية', 'التجميل', 'أخرى'],
}

const SCALAR_KEYS = [
  'clinicNameAr',
  'clinicNameEn',
  'headline',
  'subheadline',
  'googlePlaceId',
  'googleWriteReviewUrl',
] as const

export async function getSettings(): Promise<SiteSettings> {
  const rows = await prisma.setting.findMany()
  const map = new Map(rows.map((r) => [r.key, r.value]))
  const out: SiteSettings = { ...DEFAULT_SETTINGS }
  for (const key of SCALAR_KEYS) {
    const v = map.get(key)
    if (v != null) out[key] = v
  }
  const st = map.get('serviceTypes')
  if (st) {
    try {
      const arr = JSON.parse(st)
      if (Array.isArray(arr)) out.serviceTypes = arr.map(String)
    } catch {
      /* ignore malformed value */
    }
  }
  return out
}

export async function setSettings(patch: Record<string, string>): Promise<void> {
  await Promise.all(
    Object.entries(patch).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value ?? '') },
        create: { key, value: String(value ?? '') },
      }),
    ),
  )
}

/**
 * Build the official Google "write a review" deep link. Google does NOT allow
 * programmatically posting a review — this link opens Google's own review
 * dialog where the signed-in user submits it themselves (appears instantly).
 */
export function buildWriteReviewUrl(s: SiteSettings): string | null {
  if (s.googleWriteReviewUrl.trim()) return s.googleWriteReviewUrl.trim()
  if (s.googlePlaceId.trim()) {
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(s.googlePlaceId.trim())}`
  }
  return null
}
