"use client";

import { useConversationStore } from "@/stores/conversationStore";
import { useThemeStore } from "@/stores/themeStore";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, BotMessageSquare, Moon, Sun, Zap, ShieldCheck, Layers3, Sparkles, Github, Twitter } from "lucide-react";

const FEATURES = [
  {
    icon: <Zap className="size-6 text-indigo-500" />,
    title: "Lightning Fast",
    desc: "Streamed responses delivered token-by-token in real time — no waiting, no lag.",
  },
  {
    icon: <BotMessageSquare className="size-6 text-indigo-500" />,
    title: "Agentic AI",
    desc: "Autonomous multi-step reasoning powered by LLM agents that plan and execute.",
  },
  {
    icon: <Layers3 className="size-6 text-indigo-500" />,
    title: "Multi-mode",
    desc: "Switch between Chat, Generate, and Refine modes to fit any workflow.",
  },
  {
    icon: <ShieldCheck className="size-6 text-indigo-500" />,
    title: "Secure by Default",
    desc: "JWT-authenticated sessions, per-thread isolation, and no data leakage.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const createConversation = useConversationStore((s) => s.createConversation);
  const setCurrentThread = useConversationStore((s) => s.setCurrentThread);
  const user = useUserStore((s) => s.user);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const handleStart = () => {
    if (!user) {
      router.push("/auth");
      return;
    }
    const threadId = createConversation("new Chat");
    setCurrentThread(threadId);
    router.push(`/chat/${threadId}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">

      {/* ── Navbar ── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Image
            src="/Loomora_full_removebg.png"
            alt="Loomora"
            width={140}
            height={40}
            className="select-none "
          />
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              {theme === "dark"
                ? <Sun className="size-5 text-yellow-400" />
                : <Moon className="size-5 text-zinc-600" />
              }
            </button>
            <button
              onClick={handleStart}
              className="px-4 py-2 text-sm font-medium rounded-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
            >
              {user ? "Open Chat" : "Get Started"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="pt-40 pb-28 px-6 text-center relative overflow-hidden">
        {/* Gradient glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[700px] h-[400px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full text-xs font-medium border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="size-3.5" />
            Agentic AI · Real-time streaming · Multi-mode
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold leading-tight tracking-tight mb-6">
            Think less.{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Build more.
            </span>
          </h1>

          <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Loomora is a blazing-fast agentic AI assistant that streams thoughts in real time, 
            remembers your conversations, and adapts to every workflow.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleStart}
              className="group flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all shadow-lg shadow-indigo-500/25 cursor-pointer"
            >
              {user ? "Continue chatting" : "Start for free"}
              <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium text-sm transition-colors cursor-pointer"
            >
              <Github className="size-4" /> View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ── Chat preview card ── */}
      <section className="px-6 pb-28">
        <div className="max-w-2xl mx-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shadow-xl overflow-hidden">
          {/* fake window chrome */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-3 text-xs text-zinc-400 font-mono">loomora.ai/chat</span>
          </div>
          <div className="p-6 flex flex-col gap-4 text-sm">
            <div className="self-end max-w-xs px-4 py-2.5 rounded-2xl rounded-br-sm bg-indigo-600 text-white">
              Write a Python script to scrape HN frontpage.
            </div>
            <div className="self-start max-w-sm px-4 py-2.5 rounded-2xl rounded-bl-sm bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 leading-relaxed">
              Sure! Here's a clean script using{" "}
              <code className="text-indigo-500 font-mono text-xs">httpx</code> +{" "}
              <code className="text-indigo-500 font-mono text-xs">BeautifulSoup</code> …
              <span className="ml-1 inline-block w-1.5 h-4 bg-indigo-500 animate-pulse rounded-sm align-middle" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 pb-28">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need,{" "}
            <span className="text-indigo-500">nothing you don't</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:shadow-md transition-shadow"
              >
                <div className="mb-3 w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-base mb-1">{f.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="px-6 pb-28">
        <div className="max-w-3xl mx-auto rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-px shadow-2xl shadow-indigo-500/30">
          <div className="rounded-3xl bg-white dark:bg-zinc-950 px-10 py-14 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to move faster?</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md mx-auto">
              Join developers and creators who rely on Loomora to think, write, and ship — faster than ever.
            </p>
            <button
              onClick={handleStart}
              className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-lg shadow-indigo-500/30 cursor-pointer"
            >
              {user ? "Go to your chat" : "Start for free — no card needed"}
              <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-400">
          <span>© {new Date().getFullYear()} Loomora · Precision. Flow. Autonomy.</span>
          <div className="flex items-center gap-4">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
              <Twitter className="size-4" />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
              <Github className="size-4" />
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}