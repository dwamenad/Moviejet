import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { slugify } from "@/lib/utils";

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  coverImage: string;
  trailerUrl: string | null;
  spotlight: boolean;
  featured: boolean;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PostInput = {
  id?: string;
  title: string;
  slug?: string;
  excerpt: string;
  body: string;
  category: string;
  coverImage: string;
  trailerUrl?: string | null;
  spotlight: boolean;
  featured: boolean;
  published: boolean;
};

const dataFile = join(process.cwd(), "data", "posts.json");

const seedStories = [
  {
    title: "The trailer week that reset the conversation around summer releases",
    excerpt:
      "Moviejet tracked the drops, the reactions, and the shareable moments that made a full release calendar feel loud again.",
    category: "Trailers",
    coverImage:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
    spotlight: true,
    featured: true,
    published: true,
    body:
      "Trailer week is never just about the clip itself. It is about the first line that fans quote, the single frame that gets screen-grabbed, and the speed at which a release suddenly feels bigger than it did the day before.\n\nFor Moviejet, that means packaging the moment with enough shape that followers can scan it quickly and still feel like they got the full pulse. The site is built to support that rhythm: a strong lead story, quick follow-up entries, and a trailer block that gives the page motion.\n\nThis kind of coverage turns a passive news post into an active entertainment feed. It also leaves room for partner work later, because the same editorial structure can support amplified release campaigns without breaking the brand voice.",
  },
  {
    title: "Why cast chemistry clips are outperforming polished promos right now",
    excerpt:
      "Audiences are responding faster to raw interview moments and behind-the-scenes banter than to over-produced promo assets.",
    category: "Entertainment News",
    coverImage:
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80",
    trailerUrl: null,
    spotlight: false,
    featured: true,
    published: true,
    body:
      "The best-performing entertainment clips right now tend to feel immediate. Short exchanges, reaction moments, and unscripted chemistry beats are moving faster than polished rollouts because they read as more real in-feed.\n\nMoviejet can use that insight in two ways. The first is editorial, by building stories around the moments audiences are already clipping. The second is strategic, by creating campaign pages that feel closer to fan conversation than formal advertising.\n\nThat blend matters for an entertainment brand trying to grow attention without looking like a recycled press release feed.",
  },
  {
    title: "Three formats Moviejet can use to turn Instagram energy into site traffic",
    excerpt:
      "The site should not duplicate the social feed. It should deepen it with stronger packaging, better indexing, and a clear reading flow.",
    category: "Editorial",
    coverImage:
      "https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?auto=format&fit=crop&w=1200&q=80",
    trailerUrl: null,
    spotlight: false,
    featured: true,
    published: true,
    body:
      "Instagram is the spark, but the website is where Moviejet can build depth. A social post can catch attention quickly, while the site can hold richer context, category organization, and stories that stay discoverable.\n\nThe strongest format mix is simple: one spotlight feature, a stream of short updates, and a selective trailer or premiere section that feels current the moment someone lands on the page.\n\nThat gives your friend a straightforward publishing rhythm. Post to social for speed, then use the backend to expand the story on the site when it deserves more space.",
  },
  {
    title: "Premiere-week coverage works best when the homepage changes shape with it",
    excerpt:
      "Moviejet should feel live during major release windows, with editorial flags that let one story take over the homepage when needed.",
    category: "Premieres",
    coverImage:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
    trailerUrl: null,
    spotlight: false,
    featured: false,
    published: true,
    body:
      "Premiere week has a different energy. Instead of treating every story the same, the site can push the main release forward using the spotlight toggle, then support it with a few secondary entries.\n\nThat single control is enough to make the homepage feel fresh without requiring a full redesign. The admin can feature one story, publish the supporting posts, and let the site do the rest.\n\nThe result is a cleaner workflow and a homepage that always has an obvious editorial center.",
  },
];

function buildSeedPosts(): Post[] {
  return seedStories.map((story, index) => {
    const timestamp = new Date(Date.now() - index * 86_400_000).toISOString();

    return {
      id: crypto.randomUUID(),
      slug: slugify(story.title),
      createdAt: timestamp,
      updatedAt: timestamp,
      publishedAt: timestamp,
      ...story,
    };
  });
}

async function writePosts(posts: Post[]) {
  await mkdir(dirname(dataFile), { recursive: true });

  const tempFile = `${dataFile}.tmp`;
  await writeFile(tempFile, JSON.stringify(posts, null, 2));
  await rename(tempFile, dataFile);
}

async function ensurePostsFile() {
  try {
    const raw = await readFile(dataFile, "utf8");
    return JSON.parse(raw) as Post[];
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      const posts = buildSeedPosts();
      await writePosts(posts);
      return posts;
    }

    throw error;
  }
}

function sortPosts(posts: Post[]) {
  return [...posts].sort((left, right) => {
    const leftDate = new Date(left.publishedAt ?? left.updatedAt).getTime();
    const rightDate = new Date(right.publishedAt ?? right.updatedAt).getTime();

    return rightDate - leftDate;
  });
}

export async function getHomepageContent() {
  const posts = sortPosts((await ensurePostsFile()).filter((post) => post.published));

  const spotlightStory = posts.find((post) => post.spotlight) ?? posts[0] ?? null;
  const featuredStories = posts
    .filter((post) => post.id !== spotlightStory?.id)
    .sort((left, right) => Number(right.featured) - Number(left.featured))
    .slice(0, 3);
  const latestStories = posts.filter((post) => post.id !== spotlightStory?.id).slice(0, 6);
  const trailerStory = posts.find((post) => Boolean(post.trailerUrl)) ?? null;
  const categories = Array.from(new Set(posts.map((post) => post.category))).slice(0, 6);

  return {
    spotlightStory,
    featuredStories,
    latestStories,
    trailerStory,
    categories,
  };
}

export async function getPublishedStories() {
  return sortPosts((await ensurePostsFile()).filter((post) => post.published));
}

export async function getStoryBySlug(slug: string) {
  return (await ensurePostsFile()).find((post) => post.slug === slug) ?? null;
}

export async function getRelatedStories(category: string, excludeId: string) {
  return sortPosts(
    (await ensurePostsFile()).filter(
      (post) => post.published && post.category === category && post.id !== excludeId,
    ),
  ).slice(0, 3);
}

export async function getAdminStories() {
  return sortPosts(await ensurePostsFile());
}

export async function getAdminStoryById(id: string) {
  return (await ensurePostsFile()).find((post) => post.id === id) ?? null;
}

export async function saveStory(input: PostInput) {
  const posts = await ensurePostsFile();
  const now = new Date().toISOString();
  const slug = slugify(input.slug || input.title);

  const duplicate = posts.find((post) => post.slug === slug && post.id !== input.id);

  if (duplicate) {
    throw new Error("DUPLICATE_SLUG");
  }

  if (input.id) {
    const index = posts.findIndex((post) => post.id === input.id);

    if (index === -1) {
      throw new Error("NOT_FOUND");
    }

    const existing = posts[index];
    const publishedAt =
      input.published && !existing.publishedAt ? now : input.published ? existing.publishedAt : null;

    const updated: Post = {
      ...existing,
      ...input,
      slug,
      trailerUrl: input.trailerUrl || null,
      updatedAt: now,
      publishedAt,
    };

    posts[index] = updated;
    await writePosts(posts);
    return updated;
  }

  const created: Post = {
    id: crypto.randomUUID(),
    title: input.title,
    slug,
    excerpt: input.excerpt,
    body: input.body,
    category: input.category,
    coverImage: input.coverImage,
    trailerUrl: input.trailerUrl || null,
    spotlight: input.spotlight,
    featured: input.featured,
    published: input.published,
    createdAt: now,
    updatedAt: now,
    publishedAt: input.published ? now : null,
  };

  await writePosts([created, ...posts]);
  return created;
}

export async function deleteStory(id: string) {
  const posts = await ensurePostsFile();
  const nextPosts = posts.filter((post) => post.id !== id);

  if (nextPosts.length === posts.length) {
    throw new Error("NOT_FOUND");
  }

  await writePosts(nextPosts);
}

export async function resetSeedContent() {
  await writePosts(buildSeedPosts());
}
