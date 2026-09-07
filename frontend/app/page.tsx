import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { buttonVariants } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink bg-grain">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
        <Logo />
        <nav className="flex items-center gap-3">
          <Link href="/forms" className="text-sm text-muted hover:text-paper transition-colors">
            My forms
          </Link>
          <Link href="/forms" className={buttonVariants({ variant: "secondary", size: "sm" })}>
            Sign in
          </Link>
        </nav>
      </header>

      <section className="mx-auto flex max-w-4xl flex-col items-start px-6 pb-28 pt-20 sm:pt-28">
        <span className="text-sm text-muted-2">A form builder, minus the boredom</span>
        <h1 className="mt-5 max-w-3xl font-display text-[2.75rem] italic leading-[1.05] text-paper sm:text-6xl">
          Build forms people actually enjoy answering.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          One question at a time. Clean, conversational, and fast to put together —
          for feedback, research, applications, or anything you need people to fill in.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/forms" className={buttonVariants({ size: "lg" })}>
            Create a form <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/forms" className={buttonVariants({ variant: "outline", size: "lg" })}>
            My forms
          </Link>
        </div>

        <div className="mt-24 grid w-full grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
          {[
            { title: "Conversational", body: "One question fills the screen. No scrolling walls of fields." },
            { title: "Fast to build", body: "Drag, drop, and configure questions in a focused builder." },
            { title: "Answers you can read", body: "Clean response tables and summaries, without the noise." },
          ].map((f) => (
            <div key={f.title} className="bg-ink px-6 py-8">
              <h3 className="font-display text-lg text-paper">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
