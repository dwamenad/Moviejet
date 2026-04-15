import Link from "next/link";
import type { Post } from "@/lib/content";
import { getYoutubeEmbedUrl } from "@/lib/utils";

type TrailerFrameProps = {
  story: Post;
};

export function TrailerFrame({ story }: TrailerFrameProps) {
  const embedUrl = getYoutubeEmbedUrl(story.trailerUrl);

  return (
    <div className="poster-shadow overflow-hidden rounded-[2rem] border border-white/10 bg-black/45">
      {embedUrl ? (
        <div className="aspect-video">
          <iframe
            className="h-full w-full"
            src={embedUrl}
            title={`${story.title} trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="aspect-video bg-[linear-gradient(135deg,rgba(216,156,77,0.28),rgba(255,255,255,0.04)_40%,rgba(9,6,7,0.95)_100%)] p-8">
          <div className="flex h-full flex-col justify-end">
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--bronze)]">
              Featured watch
            </p>
            <h3 className="copy-balance mt-3 max-w-lg text-3xl font-semibold tracking-tight text-white">
              {story.title}
            </h3>
            <p className="mt-4 max-w-lg text-sm leading-7 text-[var(--paper)]/72">
              Add a YouTube trailer URL to this story from the admin panel and it will render here automatically.
            </p>
          </div>
        </div>
      )}

      <div className="border-t border-white/10 bg-black/35 p-5">
        <Link
          href={`/stories/${story.slug}`}
          className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--bronze)] transition hover:text-white"
        >
          Open story
        </Link>
      </div>
    </div>
  );
}
