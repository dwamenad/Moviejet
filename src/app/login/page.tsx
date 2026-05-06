import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { getGoogleAdminConfig, getSession } from "@/lib/auth";

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
          {!googleAdmin.configured ? (
            <div className="rounded-[1.4rem] border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Configure Google sign-in with{" "}
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
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
