"use client";

import { AnimatePresence, motion } from "motion/react";
import { useActionState, useCallback, useLayoutEffect, useState } from "react";
import { FiAlertCircle, FiArrowRight, FiCheck } from "react-icons/fi";
import { sendMessage, type ContactField, type ContactState } from "@/lib/contact";

const initialState: ContactState = { status: "idle" };

// Shared cell styles for the label column of the form grid
const labelCell = "flex items-start py-3.5 pl-6 text-[11px] font-semibold tracking-widest uppercase";
// A row gets a faint sage wash while you're typing in it
const rowClass = "group grid grid-cols-[6.5rem_1fr] transition-colors focus-within:bg-accent-soft/50 sm:grid-cols-[7rem_1fr]";

/**
 * The contact form as a grid of labelled rows (TO / FROM / EMAIL / SUBJECT, then the message and a sage send pill), sent through the `sendMessage` Server Action. `useActionState` gives us its result and a `pending` flag.
 * "Send another" remounts the form with a new key, which also gives it a fresh action state.
 */
export function ContactForm({ to }: { to: string }) {
  const [round, setRound] = useState(0);
  const reset = useCallback(() => setRound((r) => r + 1), []);
  return <Form key={round} to={to} onReset={reset} />;
}

function Form({ to, onReset }: { to: string; onReset: () => void }) {
  const [state, formAction, pending] = useActionState(sendMessage, initialState);
  // The popup is kept around hidden after it closes (Cache Components + <Activity>). A half-written draft can stay,
  // but reopening onto "Message sent!" would be odd. The effect only exists while the success note shows, so its
  // cleanup runs when that note is hidden (or replaced) and starts a fresh form.
  const sent = state.status === "success";
  useLayoutEffect(() => {
    if (!sent) return;
    return () => onReset();
  }, [sent, onReset]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {sent ? (
        <motion.div
          key="sent"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          role="status"
          className="flex flex-col items-center px-6 py-12 text-center"
        >
          <span className="grid size-14 place-items-center rounded-full bg-accent text-white dark:text-background" aria-hidden>
            <FiCheck className="size-7" />
          </span>
          <p className="mt-5 text-2xl font-semibold">Message sent!</p>
          <p className="mt-2">
            Thanks{state.values?.name ? `, ${state.values.name}` : ""}. I&apos;ll get back to you
            {state.values?.email ? ` at ${state.values.email}` : ""} soon.
          </p>
          <button
            type="button"
            onClick={onReset}
            className="mt-6 rounded-full border border-foreground/15 px-5 py-2 transition hover:border-accent hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Send another
          </button>
        </motion.div>
      ) : (
        <motion.form key="form" exit={{ opacity: 0, transition: { duration: 0.15 } }} action={formAction} noValidate className="relative">
          {/* Honeypot: hidden from people and skipped by keyboard; bots fill it in and get silently ignored */}
          <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
            <label>
              Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <div className="divide-y divide-foreground/10">
            {/* TO: read-only, where it goes */}
            <div className={rowClass}>
              <span className={labelCell}>To</span>
              <div className="min-w-0 py-2.5 pr-6">
                <p className="truncate text-lg">{to}</p>
                <p className="text-xs">Lands straight in my inbox</p>
              </div>
            </div>
            <Row label="From" name="name" placeholder="Your name" autoComplete="name" state={state} />
            <Row label="Email" name="email" type="email" placeholder="you@company.com" autoComplete="email" state={state} />
            <Row label="Subject" name="subject" placeholder="Role, project… (optional)" required={false} state={state} />

            <div>
              <label htmlFor="message" className="sr-only">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                placeholder="Hi Skerdi, we're working on…"
                defaultValue={state.values?.message}
                aria-invalid={!!state.fieldErrors?.message}
                aria-describedby={state.fieldErrors?.message ? "message-error" : undefined}
                className="block h-20 w-full resize-none bg-transparent px-6 py-3.5 text-lg outline-none transition-colors placeholder:text-foreground/50 focus:bg-accent-soft/50 sm:h-36"
              />
              <FieldError id="message-error" text={state.fieldErrors?.message} />
            </div>
          </div>

          {state.message && (
            <p role="alert" className="flex items-start gap-1.5 border-t border-foreground/10 px-6 py-3 text-sm">
              <FiAlertCircle className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
              {state.message}
            </p>
          )}

          <div className="border-t border-foreground/10 p-3 sm:px-6 sm:py-4">
            <button
              type="submit"
              disabled={pending}
              className="group/send inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold sm:py-3.5 text-white shadow-[0_12px_28px_-12px_var(--accent)] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:translate-y-0 disabled:opacity-70 dark:text-background"
            >
              {pending ? "Sending…" : "Send message"}
              <FiArrowRight className="size-4 transition-transform group-hover/send:translate-x-1" aria-hidden />
            </button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

/** One labelled row of the grid; the label cell turns sage-tinted while you're typing in that row. */
function Row({
  label,
  name,
  state,
  required = true,
  ...input
}: {
  label: string;
  name: ContactField;
  state: ContactState;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const error = state.fieldErrors?.[name];
  return (
    <div className={rowClass}>
      <label htmlFor={name} className={labelCell}>
        {label}
      </label>
      <div className="min-w-0">
        <input
          id={name}
          name={name}
          required={required}
          defaultValue={state.values?.[name]}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          className="block w-full bg-transparent py-3 pr-6 text-lg outline-none placeholder:text-foreground/50"
          {...input}
        />
        <FieldError id={`${name}-error`} text={error} />
      </div>
    </div>
  );
}

function FieldError({ id, text }: { id: string; text?: string }) {
  if (!text) return null;
  return (
    <p id={id} className="flex items-start gap-1.5 pr-6 pb-2.5 text-sm">
      <FiAlertCircle className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
      {text}
    </p>
  );
}
