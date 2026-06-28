import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const SESSION_COOKIE = 'mahad_admin'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days (seconds)

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || 'dev-insecure-secret-change-me'
}

function hmac(data: string): string {
  return createHmac('sha256', secret()).update(data).digest('hex')
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

/** Create a signed, expiring session token: `admin.<exp>.<hmac>` */
export function createSessionToken(): string {
  const exp = Date.now() + SESSION_MAX_AGE * 1000
  const payload = `admin.${exp}`
  return `${payload}.${hmac(payload)}`
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false
  const idx = token.lastIndexOf('.')
  if (idx < 0) return false
  const payload = token.slice(0, idx)
  const sig = token.slice(idx + 1)
  if (!safeEqual(sig, hmac(payload))) return false
  const exp = Number(payload.split('.')[1])
  return Number.isFinite(exp) && exp > Date.now()
}

/** Constant-time check of the submitted admin password against the env value. */
export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || ''
  if (!expected) return false
  return safeEqual(input, expected)
}

/** Read the session cookie and return whether the request is an authenticated admin. */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies()
  return verifySessionToken(store.get(SESSION_COOKIE)?.value)
}

/** For server components: redirect to the login page unless authenticated. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect('/admin/login')
}
