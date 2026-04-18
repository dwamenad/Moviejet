import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/8 bg-black/35">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 md:flex-row md:items-end md:justify-between md:px-10">
        <div>
          <BrandMark
            showWordmark
            imageClassName="h-14 w-auto"
            wordmarkClassName="font-display text-5xl uppercase tracking-[0.08em] text-[var(--paper)]"
          />
          <p className="mt-3 max-w-md text-sm leading-7 text-[var(--muted)]">
            Entertainment coverage, trailer culture, and campaign-ready editorial built for a
            brand that already lives on social.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)] md:items-end">
          <a
            className="transition hover:text-[var(--bronze)]"
            href="https://www.instagram.com/moviejet_official/"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
          <Link className="transition hover:text-[var(--bronze)]" href="/stories">
            Story Archive
          </Link>
          <Link className="transition hover:text-[var(--bronze)]" href="/login">
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
