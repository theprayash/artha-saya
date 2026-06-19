import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { adminUsers, otpTokens } from '@/lib/db/schema'
import { eq, gt, and } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { sendOtpEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials.' }, { status: 400 })
    }

    // Validate credentials (same timing regardless of whether user exists — prevents user enumeration)
    const user = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.email, String(email).toLowerCase().trim()),
    })

    const dummyHash = '$2a$12$dummyhashtopreventtimingattacks00000000000000000000000'
    const isValid = user
      ? await bcrypt.compare(String(password), user.passwordHash)
      : await bcrypt.compare(String(password), dummyHash).then(() => false)

    if (!user || !isValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    // Rate limit: block if an unused, unexpired OTP was sent in the last 60 seconds
    const recentOtp = await db.query.otpTokens.findFirst({
      where: and(
        eq(otpTokens.adminUserId, user.id),
        eq(otpTokens.used, false),
        gt(otpTokens.expiresAt, new Date()),
        gt(otpTokens.createdAt, new Date(Date.now() - 60_000)),
      ),
    })
    if (recentOtp) {
      return NextResponse.json(
        { error: 'A code was just sent. Please wait 60 seconds before requesting another.' },
        { status: 429 },
      )
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000))
    const tokenHash = await bcrypt.hash(otp, 10)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    // Invalidate old unused tokens, then insert new one
    await db
      .update(otpTokens)
      .set({ used: true })
      .where(and(eq(otpTokens.adminUserId, user.id), eq(otpTokens.used, false)))

    await db.insert(otpTokens).values({ adminUserId: user.id, tokenHash, expiresAt })

    // Check Gmail is configured before trying to send
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json(
        { error: 'Email not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in your .env file, then restart Docker.' },
        { status: 503 },
      )
    }

    await sendOtpEmail(user.email, otp)

    const [local, domain] = user.email.split('@')
    const masked = `${local[0]}${'*'.repeat(Math.max(local.length - 2, 2))}${local.at(-1)}@${domain}`

    return NextResponse.json({ ok: true, maskedEmail: masked })
  } catch (err) {
    console.error('[send-otp]', err)
    return NextResponse.json({ error: 'Something went wrong. Try again.' }, { status: 500 })
  }
}
