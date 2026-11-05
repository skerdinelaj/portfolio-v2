"use server";

import { profile } from "@/data/profile";

export type ContactField = "name" | "email" | "subject" | "message";

export type ContactState = {
  status: "idle" | "success" | "error";
  /** Shown above the send button on a general failure */
  message?: string;
  fieldErrors?: Partial<Record<ContactField, string>>;
  /** What the visitor typed, so a failed send doesn't wipe the form (React resets a form after its action runs) */
  values?: Partial<Record<ContactField, string>>;
};

const LIMITS = { name: 100, email: 200, subject: 150, message: 5000 } as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Server Action behind the contact form. Runs only on the server: the Resend key never reaches the browser.
 * Anyone can POST to a Server Action directly (not just through our form), so everything is validated here again.
 */
export async function sendMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const values = { name: text("name"), email: text("email"), subject: text("subject"), message: text("message") };

  // Honeypot: a field hidden from people. Bots fill every field, so pretend it worked and send nothing.
  if (text("website")) return { status: "success" };

  const fieldErrors: ContactState["fieldErrors"] = {};
  if (!values.name) fieldErrors.name = "Please tell me your name.";
  else if (values.name.length > LIMITS.name) fieldErrors.name = "That name is a bit long.";
  if (!EMAIL.test(values.email) || values.email.length > LIMITS.email) fieldErrors.email = "I need a valid email to write back.";
  if (values.subject.length > LIMITS.subject) fieldErrors.subject = "Please keep the subject short.";
  if (values.message.length < 10) fieldErrors.message = "Write a little more (at least 10 characters).";
  else if (values.message.length > LIMITS.message) fieldErrors.message = `Please keep it under ${LIMITS.message} characters.`;
  if (Object.keys(fieldErrors).length) return { status: "error", fieldErrors, values };

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("Contact form: RESEND_API_KEY is not set");
    return { status: "error", values, message: `Sending isn't set up yet. Please email me at ${profile.email}.` };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        // Resend's shared test sender: it can deliver to the Resend account's own address without verifying a domain
        from: "Portfolio <onboarding@resend.dev>",
        to: [profile.email],
        reply_to: values.email, // "Reply" in your inbox answers the visitor directly
        subject: values.subject ? `Portfolio: ${values.subject}` : `Portfolio: a message from ${values.name}`,
        text: `${values.message}\n\n— ${values.name} <${values.email}>`,
      }),
    });
    if (!res.ok) {
      console.error("Contact form: Resend responded", res.status, await res.text());
      return { status: "error", values, message: `Something went wrong sending it. Please email me at ${profile.email}.` };
    }
  } catch (err) {
    console.error("Contact form: request failed", err);
    return { status: "error", values, message: `I couldn't reach the mail service. Please email me at ${profile.email}.` };
  }

  return { status: "success", values };
}
