import type { Post } from "@/lib/content";

type PostFormProps = {
  post?: Post | null;
  error?: string;
  success?: string;
};

export function PostForm({ post, error, success }: PostFormProps) {
  const redirectTo = post ? `/admin/posts/${post.id}` : "/admin/posts/new";

  return (
    <div className="rounded-[2rem] border border-white/10 bg-[var(--panel)] p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--bronze)]">
            Story Editor
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {post ? "Update story" : "Create a new story"}
          </h1>
        </div>
        <p className="max-w-xl text-sm leading-7 text-[var(--muted)]">
          Fill in the editorial fields below. Published stories appear on the site immediately.
        </p>
      </div>

      {error ? (
        <div className="mt-6 rounded-[1.4rem] border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-6 rounded-[1.4rem] border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {success}
        </div>
      ) : null}

      <form action="/admin/posts" method="post" className="mt-8 space-y-8">
        <input type="hidden" name="postId" value={post?.id ?? ""} />
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <div className="grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Title
            </span>
            <input
              name="title"
              required
              defaultValue={post?.title ?? ""}
              className="mt-3 w-full rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition focus:border-[var(--bronze)]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Slug
            </span>
            <input
              name="slug"
              defaultValue={post?.slug ?? ""}
              placeholder="leave blank to auto-generate"
              className="mt-3 w-full rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition focus:border-[var(--bronze)]"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Excerpt
          </span>
          <textarea
            name="excerpt"
            required
            rows={4}
            defaultValue={post?.excerpt ?? ""}
            className="mt-3 w-full rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition focus:border-[var(--bronze)]"
          />
        </label>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Category
            </span>
            <input
              name="category"
              required
              defaultValue={post?.category ?? ""}
              placeholder="Trailers, Reviews, News..."
              className="mt-3 w-full rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition focus:border-[var(--bronze)]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Cover image URL
            </span>
            <input
              type="url"
              name="coverImage"
              required
              defaultValue={post?.coverImage ?? ""}
              className="mt-3 w-full rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition focus:border-[var(--bronze)]"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            YouTube trailer URL
          </span>
          <input
            type="url"
            name="trailerUrl"
            defaultValue={post?.trailerUrl ?? ""}
            placeholder="Optional"
            className="mt-3 w-full rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition focus:border-[var(--bronze)]"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Story body
          </span>
          <textarea
            name="body"
            required
            rows={18}
            defaultValue={post?.body ?? ""}
            className="mt-3 w-full rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition focus:border-[var(--bronze)]"
          />
          <p className="mt-2 text-xs leading-6 text-[var(--muted)]">
            Separate paragraphs with a blank line.
          </p>
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex items-center gap-3 rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-[var(--paper)]">
            <input type="checkbox" name="spotlight" defaultChecked={post?.spotlight ?? false} />
            Spotlight on homepage
          </label>
          <label className="flex items-center gap-3 rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-[var(--paper)]">
            <input type="checkbox" name="featured" defaultChecked={post?.featured ?? false} />
            Feature in editorial grid
          </label>
          <label className="flex items-center gap-3 rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-[var(--paper)]">
            <input type="checkbox" name="published" defaultChecked={post?.published ?? false} />
            Publish immediately
          </label>
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-[var(--bronze)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink)] transition hover:bg-[#f0b15e]"
        >
          {post ? "Save changes" : "Create story"}
        </button>
      </form>

      {post ? (
        <form action={`/admin/posts/${post.id}/delete`} method="post" className="mt-4">
          <input type="hidden" name="slug" value={post.slug} />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full border border-red-400/40 px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-red-100 transition hover:bg-red-500/10"
          >
            Delete story
          </button>
        </form>
      ) : null}
    </div>
  );
}
