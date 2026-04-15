import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <Link href="/" className="font-display text-4xl uppercase tracking-[0.16em] text-white">
          MJ
        </Link>

        <nav className="flex items-center gap-6 text-xs font-semibold uppercase tracking-[0.26em] text-[var(--paper)]/78">
          <Link className="transition hover:text-[var(--bronze)]" href="/stories">
            Stories
          </Link>
          <a
            className="transition hover:text-[var(--bronze)]"
            href="https://www.instagram.com/moviejet_official/"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
          <Link
            href="/login"
            className="rounded-full border border-white/14 px-4 py-2 transition hover:border-[var(--bronze)] hover:text-white"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
