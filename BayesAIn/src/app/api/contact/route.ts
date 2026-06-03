import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const ALLOWED_INQUIRY_TYPES = ['Consulting', 'Media & Speaking', 'Other', 'General']

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY not configured')
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }
  const resend = new Resend(apiKey)

  try {
    const rawBody = await req.text()
    if (rawBody.length > 16_000) {
      return NextResponse.json({ error: 'Request too large.' }, { status: 413 })
    }
    let body: unknown
    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
    }

    const { name, email, inquiryType, message } = (body as Record<string, unknown>) ?? {}

    if (
      typeof name !== 'string' || !name.trim() || name.length > 200 ||
      typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320 ||
      typeof message !== 'string' || !message.trim() || message.length > 5000
    ) {
      return NextResponse.json({ error: 'Name, valid email, and message are required.' }, { status: 400 })
    }

    const safeInquiryType = ALLOWED_INQUIRY_TYPES.includes(inquiryType as string)
      ? (inquiryType as string)
      : 'General'

    // TODO: configure luke@lukemillerphd.org to forward to Luke's actual inbox in DNS/email settings
    const toEmail = process.env.CONTACT_TO_EMAIL ?? 'luke@lukemillerphd.org'

    await resend.emails.send({
      from: 'lukemillerphd.org <noreply@lukemillerphd.org>',
      to: toEmail,
      replyTo: email,
      subject: `[lukemillerphd.org] ${safeInquiryType} inquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nInquiry type: ${safeInquiryType}\n\n${message}`,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contact]', err)
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
  }
}
