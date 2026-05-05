import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { getGoogleAdminConfig, getPasswordAdminConfig, getSession } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();

  if (session) {
    redirect("/admin");
  }

  const passwordAdmin = getPasswordAdminConfig();
  const googleAdmin = getGoogleAdminConfig();
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-[var(--ink)] px-6 py-16 text-[var(--paper)] md:px-10">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <Link href="/" aria-label="Moviejet home">
            <BrandMark
              priority
              showWordmark
              imageClassName="h-16 w-auto"
              wordmarkClassName="font-display text-6xl uppercase tracking-[0.08em] text-white"
            />
          </Link>
          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--bronze)]">
            Admin access
          </p>
          <h1 className="copy-balance mt-4 text-5xl font-semibold tracking-tight text-white md:text-7xl">
            Sign in to publish, feature, and update new stories.
          </h1>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[var(--panel)] p-6 md:p-8">
          {!passwordAdmin.configured && !googleAdmin.configured ? (
            <div className="rounded-[1.4rem] border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Configure either password login with{" "}
              <code className="rounded bg-black/20 px-1 py-0.5">ADMIN_EMAIL</code> and{" "}
              <code className="rounded bg-black/20 px-1 py-0.5">ADMIN_PASSWORD_HASH</code>, or
              Google sign-in with{" "}
              <code className="rounded bg-black/20 px-1 py-0.5">GOOGLE_CLIENT_ID</code>,{" "}
              <code className="rounded bg-black/20 px-1 py-0.5">GOOGLE_CLIENT_SECRET</code>, and{" "}
              <code className="rounded bg-black/20 px-1 py-0.5">GOOGLE_ADMIN_EMAILS</code>.
            </div>
          ) : null}

          {params.error ? (
            <div className="mt-4 rounded-[1.4rem] border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {params.error}
            </div>
          ) : null}

          {googleAdmin.configured ? (
            <div className="mt-6">
              <a
                href="/auth/google"
                className="flex w-full items-center justify-center rounded-full border border-white/10 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--ink)] transition hover:border-[var(--bronze)] hover:bg-[#f7f1e7]"
              >
                Continue with Google
              </a>
              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                Allowed admins: {googleAdmin.allowedEmails.join(", ")}
              </p>
            </div>
          ) : null}

          {googleAdmin.configured && passwordAdmin.configured ? (
            <div className="mt-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
              <span className="h-px flex-1 bg-white/10" />
              <span>Or use password</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>
          ) : null}

          {passwordAdmin.configured ? (
            <form action="/auth/login" method="post" className="mt-6 space-y-5">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                  Email
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue={passwordAdmin.primaryEmail}
                  className="mt-3 w-full rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition focus:border-[var(--bronze)]"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                  Password
                </span>
                <input
                  type="password"
                  name="password"
                  required
                  className="mt-3 w-full rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition focus:border-[var(--bronze)]"
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-full bg-[var(--bronze)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink)] transition hover:bg-[#f0b15e]"
              >
                Enter backend
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
