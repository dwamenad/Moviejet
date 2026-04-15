import Link from "next/link";
import type { ReactNode } from "react";

type AdminShellProps = {
  children: ReactNode;
  email: string;
};

export function AdminShell({ children, email }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[var(--ink)] text-[var(--paper)]">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-10 px-6 py-8 lg:grid-cols-[16rem_1fr] lg:px-10">
        <aside className="rounded-[2rem] border border-white/10 bg-[var(--panel)] p-6 lg:sticky lg:top-8 lg:h-fit">
          <Link href="/" className="font-display text-5xl uppercase tracking-[0.08em] text-white">
            Moviejet
          </Link>
          <p className="mt-3 text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
            Editorial backend
          </p>

          <div className="mt-8 space-y-2 text-sm">
            <Link
              href="/admin"
              className="block rounded-full border border-white/8 px-4 py-3 transition hover:border-[var(--bronze)] hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/posts/new"
              className="block rounded-full border border-white/8 px-4 py-3 transition hover:border-[var(--bronze)] hover:text-white"
            >
              New Story
            </Link>
            <Link
              href="/stories"
              className="block rounded-full border border-white/8 px-4 py-3 transition hover:border-[var(--bronze)] hover:text-white"
            >
              View Site
            </Link>
          </div>

          <div className="mt-8 rounded-[1.6rem] border border-white/8 bg-black/25 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--bronze)]">
              Signed in as
            </p>
            <p className="mt-2 text-sm text-[var(--paper)]/82">{email}</p>
          </div>

          <form action="/auth/logout" method="post" className="mt-6">
            <button
              type="submit"
              className="w-full rounded-full border border-white/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-[var(--paper)] transition hover:border-[var(--bronze)] hover:bg-white/5"
            >
              Log Out
            </button>
          </form>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}
