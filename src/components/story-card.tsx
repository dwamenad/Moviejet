/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Post } from "@/lib/content";
import { formatEditorialDate } from "@/lib/utils";

type StoryCardProps = {
  story: Post;
  variant?: "default" | "feature";
};

export function StoryCard({ story, variant = "default" }: StoryCardProps) {
  const isFeature = variant === "feature";

  return (
    <article
      className={`group overflow-hidden rounded-[1.9rem] border border-white/10 bg-[var(--panel)] transition duration-300 hover:border-[var(--bronze)]/55 ${
        isFeature ? "md:grid md:grid-cols-[1.1fr_0.9fr]" : ""
      }`}
    >
      <div className={`overflow-hidden ${isFeature ? "min-h-[24rem]" : "min-h-[18rem]"}`}>
        <img
          src={story.coverImage}
          alt={story.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04] group-hover:translate-y-[-2px]"
        />
      </div>

      <div className={`flex flex-col justify-between p-6 ${isFeature ? "md:p-8" : ""}`}>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--bronze)]">
            {story.category}
          </p>
          <Link href={`/stories/${story.slug}`} className="mt-4 block">
            <h3
              className={`copy-balance font-semibold tracking-tight text-white transition group-hover:text-[var(--bronze)] ${
                isFeature ? "text-3xl md:text-4xl" : "text-2xl"
              }`}
            >
              {story.title}
            </h3>
          </Link>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{story.excerpt}</p>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/8 pt-5 text-xs uppercase tracking-[0.22em] text-[var(--paper)]/64">
          <span>{formatEditorialDate(story.publishedAt ?? story.updatedAt)}</span>
          <Link href={`/stories/${story.slug}`} className="transition hover:text-[var(--bronze)]">
            Read story
          </Link>
        </div>
      </div>
    </article>
  );
}
