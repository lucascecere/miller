import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[newsletter] RESEND_API_KEY not configured')
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }
  const resend = new Resend(apiKey)

  try {
    const rawBody = await req.text()
    if (rawBody.length > 1_000) {
      return NextResponse.json({ error: 'Request too large.' }, { status: 413 })
    }
    let body: unknown
    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
    }

    const email = typeof (body as Record<string, unknown>)?.email === 'string'
      ? ((body as Record<string, unknown>).email as string).trim()
      : ''

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
      return NextResponse.json({ error: 'Valid email required.' }, { status: 400 })
    }

    const audienceId = process.env.RESEND_AUDIENCE_ID
    if (!audienceId) {
      return NextResponse.json({ error: 'Newsletter not configured.' }, { status: 500 })
    }

    await resend.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[newsletter]', err)
    return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 })
  }
}
