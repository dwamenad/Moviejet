/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowUpRight, Clapperboard, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StoryCard } from "@/components/story-card";
import { TrailerFrame } from "@/components/trailer-frame";
import { getHomepageContent } from "@/lib/content";
import { formatEditorialDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const releaseChips = [
  "Trailer drops",
  "Premiere reactions",
  "Entertainment headlines",
  "Campaign spotlights",
  "Series watchlists",
  "Casting updates",
];

const studioServices = [
  {
    title: "Trailer amplification",
    description:
      "Launch-day support built for social momentum, instant conversation, and repeatable reach.",
  },
  {
    title: "Editorial rollouts",
    description:
      "Feature stories, list-driven coverage, and quote-led packaging that feels native to fan culture.",
  },
  {
    title: "Release attention maps",
    description:
      "A mix of category planning and fast-turn creative placements for titles that need more than one hit.",
  },
];

export default async function Home() {
  const { categories, featuredStories, latestStories, spotlightStory, trailerStory } =
    await getHomepageContent();

  if (!spotlightStory) {
    return (
      <div className="min-h-screen bg-[var(--ink)] px-6 py-20 text-[var(--paper)]">
        <SiteHeader />
        <div className="mx-auto mt-24 max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 p-10">
          <p className="font-display text-6xl uppercase tracking-[0.08em] text-[var(--bronze)]">
            Moviejet
          </p>
          <h1 className="mt-4 text-3xl font-semibold">No stories are live yet.</h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-[var(--muted)]">
            Seed the site from the admin area, publish a few stories, and the homepage will
            assemble itself around the latest spotlight and featured coverage.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--bronze)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[var(--paper)] transition hover:bg-[var(--bronze)] hover:text-[var(--ink)]"
          >
            Open Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--ink)] text-[var(--paper)]">
      <section className="relative isolate min-h-screen overflow-hidden">
        <img
          src={spotlightStory.coverImage}
          alt={spotlightStory.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-black/55 via-transparent to-transparent" />
        <SiteHeader />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-end px-6 pb-10 pt-28 md:px-10 md:pb-14">
          <div className="max-w-3xl">
            <p className="animate-fade-up font-body text-xs uppercase tracking-[0.45em] text-[var(--bronze)]">
              Moviejet official
            </p>
            <h1 className="copy-balance animate-fade-up-delay font-display text-[clamp(4.8rem,15vw,11rem)] uppercase leading-[0.88] tracking-[0.04em] text-[var(--paper)]">
              Moviejet
            </h1>
            <div className="mt-4 max-w-2xl animate-fade-up-delay">
              <p className="copy-balance text-2xl font-semibold tracking-tight text-white md:text-4xl">
                Cinema moves fast. Moviejet keeps every trailer drop, release wave, and
                entertainment headline in frame.
              </p>
              <p className="mt-6 max-w-xl text-base leading-8 text-[var(--paper)]/82 md:text-lg">
                Built as a sharp editorial hub for movie culture, with room for branded
                campaigns, spotlight features, and the stories your audience is already
                watching on Instagram.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/stories"
                className="animate-pulse-glow inline-flex items-center justify-center rounded-full bg-[var(--bronze)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink)] transition hover:translate-y-[-1px] hover:bg-[#f0b15e]"
              >
                Explore stories
              </Link>
              <a
                href="https://www.instagram.com/moviejet_official/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/6 px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[var(--paper)] transition hover:border-[var(--bronze)] hover:bg-white/12"
              >
                Follow on Instagram
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="mt-16 grid gap-5 border-t border-white/12 pt-8 md:grid-cols-[1.35fr_1fr_1fr]">
            <div className="rounded-[1.8rem] border border-white/10 bg-[var(--panel)] p-6 backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--bronze)]">
                Spotlight now
              </p>
              <Link href={`/stories/${spotlightStory.slug}`} className="mt-3 block">
                <h2 className="copy-balance text-2xl font-semibold tracking-tight text-white transition hover:text-[var(--bronze)] md:text-[2rem]">
                  {spotlightStory.title}
                </h2>
              </Link>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted)]">
                {spotlightStory.excerpt}
              </p>
            </div>

            <div className="rounded-[1.8rem] border border-white/10 bg-black/20 p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--bronze)]">
                Editorial pace
              </p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="font-display text-5xl leading-none text-white">24/7</p>
                  <p className="mt-1 text-sm leading-7 text-[var(--muted)]">
                    Coverage built for trailers, release weekends, and cast moments that spike
                    fast.
                  </p>
                </div>
                <div className="h-px bg-white/10" />
                <div>
                  <p className="font-display text-5xl leading-none text-white">01</p>
                  <p className="mt-1 text-sm leading-7 text-[var(--muted)]">
                    Clear voice across story pages, social hooks, and campaign-ready features.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-white/10 bg-black/20 p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--bronze)]">
                Categories in rotation
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full border border-white/12 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.18em] text-[var(--paper)]"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/8 bg-black/25 py-4">
        <div className="ticker-mask overflow-hidden">
          <div className="animate-drift flex w-max gap-3">
            {[...releaseChips, ...releaseChips].map((chip, index) => (
              <div
                key={`${chip}-${index}`}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--paper)]/82"
              >
                {chip}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Featured Dispatches"
              title="A homepage that feels like a live film bulletin."
              description="The first layer is built to keep Moviejet unmistakable while still giving the latest stories room to breathe."
            />
          </div>

          <div className="space-y-8">
            {featuredStories.slice(0, 1).map((story) => (
              <StoryCard key={story.id} story={story} variant="feature" />
            ))}
            <div className="grid gap-6 md:grid-cols-2">
              {featuredStories.slice(1).map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/8 bg-[linear-gradient(135deg,rgba(216,156,77,0.09),transparent_55%)]">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:px-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Trailer Radar"
              title="A dedicated moment for the clip everyone is about to talk about."
              description="Trailer embeds give Moviejet a living pulse instead of a static magazine feel. Pick a story with a trailer URL and the site will surface it here."
            />
            {trailerStory ? (
              <div className="mt-8 rounded-[1.8rem] border border-white/10 bg-[var(--panel)] p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--bronze)]">
                  Current pull
                </p>
                <Link href={`/stories/${trailerStory.slug}`} className="mt-3 block">
                  <h3 className="text-2xl font-semibold tracking-tight text-white transition hover:text-[var(--bronze)]">
                    {trailerStory.title}
                  </h3>
                </Link>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{trailerStory.excerpt}</p>
              </div>
            ) : null}
          </div>
          <TrailerFrame story={trailerStory ?? spotlightStory} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10">
        <SectionHeading
          eyebrow="For Studios And Partners"
          title="Moviejet can read as editorial first while still making space for release campaigns."
          description="That balance matters if the site needs to support both audience growth and future partnership work."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {studioServices.map((service, index) => (
            <div
              key={service.title}
              className="rounded-[1.8rem] border border-white/10 bg-[var(--panel-strong)] p-7 transition duration-300 hover:border-[var(--bronze)]/55 hover:translate-y-[-2px]"
            >
              <p className="font-display text-5xl uppercase leading-none text-[var(--bronze)]">
                0{index + 1}
              </p>
              <h3 className="mt-6 text-2xl font-semibold tracking-tight text-white">
                {service.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/8 bg-black/20">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Latest Stories"
              title="Fresh stories with enough hierarchy to scan in seconds."
              description="These entries are pulled from the published post feed, so your friend can keep the site current from the admin panel."
            />
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-[var(--bronze)] transition hover:text-white"
            >
              Browse the archive
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {latestStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-[var(--bronze-soft)] bg-[linear-gradient(135deg,rgba(216,156,77,0.2),rgba(216,156,77,0.04)_28%,rgba(16,12,13,0.95)_58%)] p-8 md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--bronze)]">
                Built to hand off
              </p>
              <h2 className="copy-balance mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
                Publish stories, edit spotlight pieces, and keep the site moving without opening the codebase.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--paper)]/78">
                The backend is set up so one login can handle new posts, featured stories, trailer
                links, and homepage highlights. That keeps the handoff clean when the domain and
                hosting move over.
              </p>
            </div>

            <div className="rounded-[1.8rem] border border-white/10 bg-black/30 p-6">
              <div className="flex items-center gap-3 text-[var(--bronze)]">
                <Clapperboard className="h-5 w-5" />
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="mt-5 text-sm leading-7 text-[var(--paper)]/78">
                Start with the sample stories, replace the images and copy with real Moviejet
                content, then give your friend the admin credentials and hosting access.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--paper)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink)] transition hover:bg-white"
                >
                  Open admin
                </Link>
                <a
                  href="https://www.instagram.com/moviejet_official/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-white/14 px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[var(--paper)] transition hover:border-[var(--bronze)]"
                >
                  Match the IG tone
                </a>
              </div>
              <p className="mt-5 text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
                Updated {formatEditorialDate(spotlightStory.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
