// TODO: wire in v2 with Formspree or Resend Server Action
export type ContactFormData = {
  name: string
  email: string
  topic: 'Consulting' | 'Media & Speaking' | 'Other'
  message: string
}
