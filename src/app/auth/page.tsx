'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// ── Google Icon SVG ────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ── Animated background orbs ───────────────────────────────────────────────
function BackgroundOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-200/40 blur-3xl animate-pulse" />
      <div
        className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-indigo-200/40 blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-sky-100/50 blur-2xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />
    </div>
  );
}

// ── Field component ────────────────────────────────────────────────────────
function Field({
  label, id, type = "text", placeholder, value, onChange, required,
}: {
  label: string; id: string; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void; required?: boolean;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-semibold tracking-widest uppercase text-slate-500">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={isPassword ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="h-11 bg-white/70 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl text-sm placeholder:text-slate-300 pr-10 transition-all"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Auth Page ─────────────────────────────────────────────────────────
export default function AuthPage() {
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  // Sign in state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign up state
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirm, setSignUpConfirm] = useState("");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("submit", { type: "signin", email: signInEmail, password: signInPassword });
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("submit", { type: "signup", name: signUpName, email: signUpEmail, password: signUpPassword, confirm: signUpConfirm });
  };

  const handleGoogle = () => {
    console.log("submit", { type: "google" });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-r from-slate-50 via-blue-50 to-indigo-100 relative p-4">
      <BackgroundOrbs />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md"
        style={{
          animation: "fadeUp 0.5s ease both",
        }}
      >
        

        {/* Logo */}
        <div className="flex items-center select-none justify-center gap-2 ">
          <Image
            src="/Loomora_text.png"
            alt="Loomora-logo"
            width={120}
            height={60}
            
          />    
        </div>

        {/* Glass card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl shadow-blue-100/50 p-8">

          {/* Tab switcher */}
          <div className="flex bg-slate-100 rounded-2xl p-1 mb-8">
            {(["signin", "signup"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200",
                  tab === t
                    ? "bg-white text-slate-800 shadow-sm shadow-slate-200"
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {t === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Google button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            className="w-full h-11 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm gap-3 mb-6 shadow-sm transition-all hover:shadow-md"
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* ── Sign In Form ── */}
          {tab === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-5 tab-content">
              <Field
                label="Email" id="si-email" type="email"
                placeholder="you@example.com"
                value={signInEmail} onChange={setSignInEmail} required
              />
              <Field
                label="Password" id="si-password" type="password"
                placeholder="••••••••"
                value={signInPassword} onChange={setSignInPassword} required
              />

              <div className="flex justify-end">
                <button type="button" className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all hover:-translate-y-0.5"
              >
                Sign In
              </Button>

              <p className="text-center text-xs text-slate-400">
                Don't have an account?{" "}
                <button type="button" onClick={() => setTab("signup")} className="text-blue-500 hover:text-blue-700 font-semibold transition-colors">
                  Sign up
                </button>
              </p>
            </form>
          )}

          {/* ── Sign Up Form ── */}
          {tab === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-4 tab-content">
              <Field
                label="Full Name" id="su-name"
                placeholder="John Doe"
                value={signUpName} onChange={setSignUpName} required
              />
              <Field
                label="Email" id="su-email" type="email"
                placeholder="you@example.com"
                value={signUpEmail} onChange={setSignUpEmail} required
              />
              <Field
                label="Password" id="su-password" type="password"
                placeholder="Min. 8 characters"
                value={signUpPassword} onChange={setSignUpPassword} required
              />
              <Field
                label="Confirm Password" id="su-confirm" type="password"
                placeholder="Repeat password"
                value={signUpConfirm} onChange={setSignUpConfirm} required
              />

              <Button
                type="submit"
                className="w-full h-11 mt-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all hover:-translate-y-0.5"
              >
                Create Account
              </Button>

              <p className="text-center text-xs text-slate-400">
                Already have an account?{" "}
                <button type="button" onClick={() => setTab("signin")} className="text-blue-500 hover:text-blue-700 font-semibold transition-colors">
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          By continuing you agree to our{" "}
          <span className="text-slate-500 underline underline-offset-2 cursor-pointer hover:text-slate-700">Terms</span>
          {" "}and{" "}
          <span className="text-slate-500 underline underline-offset-2 cursor-pointer hover:text-slate-700">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}