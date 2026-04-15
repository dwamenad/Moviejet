import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StoryCard } from "@/components/story-card";
import { getPublishedStories } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function StoriesPage() {
  const stories = await getPublishedStories();

  return (
    <div className="min-h-screen bg-[var(--ink)] text-[var(--paper)]">
      <div className="relative overflow-hidden border-b border-white/8 bg-black/25">
        <SiteHeader />
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-32 md:px-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--bronze)]">
            Story Archive
          </p>
          <h1 className="copy-balance mt-4 max-w-4xl text-5xl font-semibold tracking-tight text-white md:text-7xl">
            The running archive for Moviejet headlines, trailer drops, and culture notes.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted)]">
            This page is driven by the published post feed from the admin backend.
          </p>
          <div className="mt-8">
            <Link
              href="/login"
              className="inline-flex items-center rounded-full border border-white/14 px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] transition hover:border-[var(--bronze)] hover:text-white"
            >
              Open admin
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
