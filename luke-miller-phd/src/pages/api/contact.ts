import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();

  // Honeypot — bots fill this, humans don't
  if (data.get('_trap')) {
    return json({ success: true }, 200);
  }

  const name    = data.get('name')?.toString().trim() ?? '';
  const email   = data.get('email')?.toString().trim() ?? '';
  const message = data.get('message')?.toString().trim() ?? '';

  if (!name || !email || !message) {
    return json({ error: 'All fields are required.' }, 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Please enter a valid email address.' }, 400);
  }

  if (message.length > 5000) {
    return json({ error: 'Message is too long (5000 character limit).' }, 400);
  }

  const resend = new Resend(import.meta.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: 'Luke Miller Website <noreply@lukemillerphd.com>',
      to:   'luke@bayesianmath.org',
      replyTo: email,
      subject: `Contact from ${name}`,
      html: `
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <br>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      `,
    });

    return json({ success: true }, 200);
  } catch (err) {
    console.error('[contact] Resend error:', err);
    return json({ error: 'Failed to send. Please email directly at luke@bayesianmath.org.' }, 500);
  }
};

function json(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
