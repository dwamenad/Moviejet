/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StoryCard } from "@/components/story-card";
import { TrailerFrame } from "@/components/trailer-frame";
import { getRelatedStories, getStoryBySlug } from "@/lib/content";
import { formatEditorialDate, splitBodyIntoParagraphs } from "@/lib/utils";

export const dynamic = "force-dynamic";

type StoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story) {
    return {
      title: "Story Not Found | Moviejet",
    };
  }

  return {
    title: `${story.title} | Moviejet`,
    description: story.excerpt,
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story || !story.published) {
    notFound();
  }

  const relatedStories = await getRelatedStories(story.category, story.id);
  const paragraphs = splitBodyIntoParagraphs(story.body);

  return (
    <div className="min-h-screen bg-[var(--ink)] text-[var(--paper)]">
      <div className="relative isolate overflow-hidden">
        <img
          src={story.coverImage}
          alt={story.title}
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="hero-overlay absolute inset-0" />
        <SiteHeader />
        <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-32 md:px-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--bronze)]">
            {story.category}
          </p>
          <h1 className="copy-balance mt-4 text-5xl font-semibold tracking-tight text-white md:text-7xl">
            {story.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--paper)]/82">
            {story.excerpt}
          </p>
          <div className="mt-8 flex flex-wrap gap-4 text-xs uppercase tracking-[0.22em] text-[var(--paper)]/66">
            <span>{formatEditorialDate(story.publishedAt ?? story.updatedAt)}</span>
            <span>Story file</span>
            <span>Moviejet editorial</span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <div className="grid gap-14 xl:grid-cols-[0.95fr_1.05fr]">
          <aside className="space-y-8">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--panel)]">
              <img src={story.coverImage} alt={story.title} className="aspect-[4/5] w-full object-cover" />
            </div>
            <TrailerFrame story={story} />
          </aside>

          <article className="rounded-[2rem] border border-white/10 bg-[var(--panel)] p-6 md:p-8">
            {paragraphs.map((paragraph, index) => (
              <p key={`${story.id}-${index}`} className="mb-6 text-base leading-8 text-[var(--paper)]/82 last:mb-0">
                {paragraph}
              </p>
            ))}

            <div className="mt-10 border-t border-white/8 pt-8">
              <Link
                href="/stories"
                className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--bronze)] transition hover:text-white"
              >
                Back to archive
              </Link>
            </div>
          </article>
        </div>

        {relatedStories.length > 0 ? (
          <section className="mt-20">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--bronze)]">
                Related in {story.category}
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white">
                Keep the story moving.
              </h2>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {relatedStories.map((relatedStory) => (
                <StoryCard key={relatedStory.id} story={relatedStory} />
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <SiteFooter />
    </div>
  );
}
