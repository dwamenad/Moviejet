import Link from "next/link";
import { getAdminStories } from "@/lib/content";
import { formatEditorialDate } from "@/lib/utils";

type AdminPageProps = {
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const stories = await getAdminStories();
  const params = await searchParams;
  const publishedCount = stories.filter((story) => story.published).length;
  const draftCount = stories.length - publishedCount;
  const spotlightCount = stories.filter((story) => story.spotlight).length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--bronze)]">
          Dashboard
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
          Editorial command center
        </h1>
      </div>

      {params.success ? (
        <div className="rounded-[1.4rem] border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {params.success}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.8rem] border border-white/10 bg-[var(--panel)] p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--bronze)]">
            Published
          </p>
          <p className="mt-4 font-display text-6xl leading-none text-white">{publishedCount}</p>
        </div>
        <div className="rounded-[1.8rem] border border-white/10 bg-[var(--panel)] p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--bronze)]">
            Drafts
          </p>
          <p className="mt-4 font-display text-6xl leading-none text-white">{draftCount}</p>
        </div>
        <div className="rounded-[1.8rem] border border-white/10 bg-[var(--panel)] p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--bronze)]">
            Spotlight picks
          </p>
          <p className="mt-4 font-display text-6xl leading-none text-white">{spotlightCount}</p>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-[var(--panel)] p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--bronze)]">
              Stories
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">All entries</h2>
          </div>
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center justify-center rounded-full bg-[var(--bronze)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink)] transition hover:bg-[#f0b15e]"
          >
            New story
          </Link>
        </div>

        <div className="mt-8 divide-y divide-white/8">
          {stories.map((story) => (
            <div key={story.id} className="flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--bronze)]">
                  {story.category}
                </p>
                <p className="text-xl font-semibold tracking-tight text-white">{story.title}</p>
                <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  <span>{story.published ? "Published" : "Draft"}</span>
                  {story.spotlight ? <span>Spotlight</span> : null}
                  {story.featured ? <span>Featured</span> : null}
                  <span>{formatEditorialDate(story.publishedAt ?? story.updatedAt)}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  href={`/stories/${story.slug}`}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition hover:border-[var(--bronze)]"
                >
                  View
                </Link>
                <Link
                  href={`/admin/posts/${story.id}`}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition hover:border-[var(--bronze)]"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
