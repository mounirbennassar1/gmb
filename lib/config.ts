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

// Gold tagline shown under the wordmark in the hero.
export const CLINIC_TAGLINE = 'للجلدية والتجميل · جدة'

// Rich service catalogue rendered as selectable chips on the landing page. The
// label is stored on each review; the description appears beneath the chips when
// selected. Keep the keys in sync with DEFAULT_SETTINGS.serviceTypes.
export const SERVICE_DESC: Record<string, string> = {
  'علاج حب الشباب وآثاره':
    'الخيار الأول في جدة لعلاج حب الشباب وآثاره، أحدث أجهزة الليزر وبإشراف نخبة استشاريي الجلدية.',
  'البوتوكس والفيلر':
    'عيادة مها دحلان لتجميل الوجه، بوتوكس وفيلر جلدي وعلاجات الإشراقة بأيدي خبراء معتمدين.',
  'علاج الهالات والتصبّغات حول العين':
    'برنامج طبي متخصص في علاج الهالات السوداء والتصبّغات حول العين بأحدث التقنيات في جدة.',
  'العناية بالبشرة والهايدرافيشل':
    'باقة متكاملة من جلسات تنظيف البشرة والهايدرافيشل وعلاج تساقط الشعر في MD Clinics.',
  'علاج تساقط الشعر':
    'حلول طبية متكاملة لعلاج تساقط الشعر، Regenera Evo وPRP والميزوثيرابي وExosome وغيرها.',
  'علاج التصبّغات':
    'برنامج علاج التصبّغات في مها دحلان، جلسات هادئة وخطة شخصية ونتائج موثّقة.',
  'علاج التشققات وعلامات التمدد':
    'الفيلر الهجين المحفّز للكولاجين وفيلر الكالسيوم، حلول طبية لتشققات الحمل وعلامات التمدد.',
  'نحت الجسم بتقنية التحفيز العضلي':
    'تجربة HIFEM لنحت الجسم وتفعيل العضلات بدون جراحة، تجربة طبية فاخرة في عيادات د. مها دحلان.',
}

// Defaults are placeholders — edit them from the admin panel (الإعدادات).
export const DEFAULT_SETTINGS: SiteSettings = {
  clinicNameAr: 'عيادات د. مها دحلان',
  clinicNameEn: 'MAHA DAHLAN',
  headline: 'قيّم تجربتك',
  subheadline: 'رأيك يساعدنا على الارتقاء بخدماتنا',
  // MD Clinics (مجمع عيادات د. مها دحلان الطبي), Jeddah — verified Place ID.
  googlePlaceId: 'ChIJv3KH0jjQwxURJSJMiSHc2MQ',
  googleWriteReviewUrl: '',
  serviceTypes: Object.keys(SERVICE_DESC),
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
