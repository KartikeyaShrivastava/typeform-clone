import { Logo } from "./logo";

export function Navbar({ right }: { right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border-soft bg-ink/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        {right}
      </div>
    </header>
  );
}
