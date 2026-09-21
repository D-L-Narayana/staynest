"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Envelope, Lock, User, HouseLine, Warning, CheckCircle } from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth";

export default function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { signIn, signUp, continueAsGuest } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const reset = () => {
    setError("");
    setNotice("");
  };

  const submit = async () => {
    reset();
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password.");
      return;
    }
    if (tab === "signup" && !name.trim()) {
      setError("Enter your name.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    const res =
      tab === "signup" ? await signUp(email, password, name) : await signIn(email, password);
    setBusy(false);
    if (res.error) {
      setError(res.error);
    } else if (tab === "signup") {
      setNotice("Account created. If email confirmation is on, check your inbox, then log in.");
      setTab("login");
    } else {
      onClose();
    }
  };

  const guest = () => {
    continueAsGuest();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ isolation: "isolate" }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-[var(--text-dim)] transition hover:bg-[var(--muted)]"
            >
              <X size={18} />
            </button>

            <div className="px-6 pt-7 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--brand)] text-white">
                <HouseLine size={24} weight="fill" />
              </span>
              <h2 className="mt-3 text-xl font-bold tracking-tight">
                {tab === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-dim)]">
                {tab === "login"
                  ? "Log in to book and save stays."
                  : "Sign up to keep your trips and wishlist."}
              </p>
            </div>

            <div className="mx-6 mt-5 flex rounded-full border border-[var(--border)] p-1 text-sm">
              {(["login", "signup"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    reset();
                  }}
                  className={`flex-1 rounded-full py-2 font-medium transition ${
                    tab === t ? "bg-[var(--brand)] text-white" : "text-[var(--text)]"
                  }`}
                >
                  {t === "login" ? "Log in" : "Sign up"}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 p-6">
              {tab === "signup" && (
                <Field icon={User} value={name} onChange={setName} placeholder="Full name" />
              )}
              <Field
                icon={Envelope}
                value={email}
                onChange={setEmail}
                placeholder="Email"
                type="email"
              />
              <Field
                icon={Lock}
                value={password}
                onChange={setPassword}
                placeholder="Password"
                type="password"
                onEnter={submit}
              />

              {error && (
                <p className="flex items-center gap-1.5 text-sm text-[var(--brand)]">
                  <Warning size={15} weight="fill" /> {error}
                </p>
              )}
              {notice && (
                <p className="flex items-center gap-1.5 text-sm text-green-600">
                  <CheckCircle size={15} weight="fill" /> {notice}
                </p>
              )}

              <button
                onClick={submit}
                disabled={busy}
                className="mt-1 rounded-xl bg-[var(--brand)] py-2.5 font-semibold text-white transition hover:bg-[var(--brand-dark)] active:scale-[0.99] disabled:opacity-60"
              >
                {busy ? "Please wait..." : tab === "login" ? "Log in" : "Create account"}
              </button>

              <div className="flex items-center gap-3 py-1 text-xs text-[var(--text-dim)]">
                <span className="h-px flex-1 bg-[var(--border)]" />
                or
                <span className="h-px flex-1 bg-[var(--border)]" />
              </div>

              <button
                onClick={guest}
                className="rounded-xl border border-[var(--border)] py-2.5 font-medium text-[var(--text)] transition hover:bg-[var(--muted)]"
              >
                Continue as guest
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = "text",
  onEnter,
}: {
  icon: typeof User;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  onEnter?: () => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 focus-within:border-[var(--brand)]">
      <Icon size={18} className="text-[var(--text-dim)]" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-dim)]"
      />
    </label>
  );
}
