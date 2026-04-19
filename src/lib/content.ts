import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join } from "node:path";
import { Pool, type PoolClient } from "pg";
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

type PostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  cover_image: string;
  trailer_url: string | null;
  spotlight: boolean;
  featured: boolean;
  published: boolean;
  published_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

const dataDirectory = (() => {
  const configuredPath = process.env.DATA_DIR?.trim();

  if (!configuredPath) {
    return join(/* turbopackIgnore: true */ process.cwd(), "data");
  }

  return isAbsolute(configuredPath)
    ? configuredPath
    : join(/* turbopackIgnore: true */ process.cwd(), configuredPath);
})();

const dataFile = join(dataDirectory, "posts.json");
const databaseUrl = process.env.DATABASE_URL?.trim() || null;
const createPostsTableSql = `
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT NOT NULL,
    body TEXT NOT NULL,
    category TEXT NOT NULL,
    cover_image TEXT NOT NULL,
    trailer_url TEXT,
    spotlight BOOLEAN NOT NULL DEFAULT FALSE,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
  );
`;
const createPostsIndexSql = `
  CREATE INDEX IF NOT EXISTS posts_publish_order_idx
  ON posts (published, published_at DESC, updated_at DESC);
`;

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

let pool: Pool | null = null;
let databaseInitPromise: Promise<void> | null = null;

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

function isDatabaseEnabled() {
  return Boolean(databaseUrl);
}

function getPool() {
  if (!databaseUrl) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });

    pool.on("error", (error) => {
      console.error("Unexpected Postgres pool error", error);
    });
  }

  return pool;
}

async function withDatabaseClient<T>(callback: (client: PoolClient) => Promise<T>) {
  const client = await getPool().connect();

  try {
    return await callback(client);
  } finally {
    client.release();
  }
}

function normaliseTimestamp(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapRowToPost(row: PostRow): Post {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    body: row.body,
    category: row.category,
    coverImage: row.cover_image,
    trailerUrl: row.trailer_url,
    spotlight: row.spotlight,
    featured: row.featured,
    published: row.published,
    publishedAt: normaliseTimestamp(row.published_at),
    createdAt: normaliseTimestamp(row.created_at) ?? new Date().toISOString(),
    updatedAt: normaliseTimestamp(row.updated_at) ?? new Date().toISOString(),
  };
}

async function readPostsFileIfPresent() {
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
      return null;
    }

    throw error;
  }
}

async function writePosts(posts: Post[]) {
  await mkdir(dirname(dataFile), { recursive: true });

  const tempFile = `${dataFile}.tmp`;
  await writeFile(tempFile, JSON.stringify(posts, null, 2));
  await rename(tempFile, dataFile);
}

async function ensurePostsFile() {
  const posts = await readPostsFileIfPresent();

  if (posts) {
    return posts;
  }

  const seedPosts = buildSeedPosts();
  await writePosts(seedPosts);
  return seedPosts;
}

async function loadBootstrapPosts() {
  const filePosts = await readPostsFileIfPresent();
  return filePosts && filePosts.length > 0 ? filePosts : buildSeedPosts();
}

async function insertPosts(client: PoolClient, posts: Post[]) {
  for (const post of posts) {
    await client.query(
      `
        INSERT INTO posts (
          id,
          title,
          slug,
          excerpt,
          body,
          category,
          cover_image,
          trailer_url,
          spotlight,
          featured,
          published,
          published_at,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `,
      [
        post.id,
        post.title,
        post.slug,
        post.excerpt,
        post.body,
        post.category,
        post.coverImage,
        post.trailerUrl,
        post.spotlight,
        post.featured,
        post.published,
        post.publishedAt,
        post.createdAt,
        post.updatedAt,
      ],
    );
  }
}

async function initialiseDatabase() {
  await withDatabaseClient(async (client) => {
    await client.query("BEGIN");

    try {
      await client.query(createPostsTableSql);
      await client.query(createPostsIndexSql);

      const countResult = await client.query<{ count: string | number }>(
        "SELECT COUNT(*)::int AS count FROM posts",
      );
      const count = Number(countResult.rows[0]?.count ?? 0);

      if (count === 0) {
        const bootstrapPosts = await loadBootstrapPosts();
        await insertPosts(client, bootstrapPosts);
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

async function ensureDatabaseReady() {
  if (!isDatabaseEnabled()) {
    return;
  }

  databaseInitPromise ??= initialiseDatabase();
  await databaseInitPromise;
}

async function getAllPosts() {
  if (!isDatabaseEnabled()) {
    return ensurePostsFile();
  }

  await ensureDatabaseReady();

  const result = await getPool().query<PostRow>(
    `
      SELECT *
      FROM posts
      ORDER BY COALESCE(published_at, updated_at) DESC
    `,
  );

  return result.rows.map(mapRowToPost);
}

function sortPosts(posts: Post[]) {
  return [...posts].sort((left, right) => {
    const leftDate = new Date(left.publishedAt ?? left.updatedAt).getTime();
    const rightDate = new Date(right.publishedAt ?? right.updatedAt).getTime();

    return rightDate - leftDate;
  });
}

function isUniqueViolation(error: unknown) {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "23505"
  );
}

export async function getHomepageContent() {
  const posts = sortPosts((await getAllPosts()).filter((post) => post.published));

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
  return sortPosts((await getAllPosts()).filter((post) => post.published));
}

export async function getStoryBySlug(slug: string) {
  return (await getAllPosts()).find((post) => post.slug === slug) ?? null;
}

export async function getRelatedStories(category: string, excludeId: string) {
  return sortPosts(
    (await getAllPosts()).filter(
      (post) => post.published && post.category === category && post.id !== excludeId,
    ),
  ).slice(0, 3);
}

export async function getAdminStories() {
  return sortPosts(await getAllPosts());
}

export async function getAdminStoryById(id: string) {
  return (await getAllPosts()).find((post) => post.id === id) ?? null;
}

export async function saveStory(input: PostInput) {
  if (!isDatabaseEnabled()) {
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

  await ensureDatabaseReady();

  const now = new Date().toISOString();
  const slug = slugify(input.slug || input.title);

  return withDatabaseClient(async (client) => {
    await client.query("BEGIN");

    try {
      if (input.id) {
        const existingResult = await client.query<PostRow>(
          `
            SELECT *
            FROM posts
            WHERE id = $1
            LIMIT 1
          `,
          [input.id],
        );

        if (existingResult.rowCount === 0) {
          throw new Error("NOT_FOUND");
        }

        const existing = mapRowToPost(existingResult.rows[0]);
        const publishedAt =
          input.published && !existing.publishedAt ? now : input.published ? existing.publishedAt : null;
        const updatedResult = await client.query<PostRow>(
          `
            UPDATE posts
            SET
              title = $2,
              slug = $3,
              excerpt = $4,
              body = $5,
              category = $6,
              cover_image = $7,
              trailer_url = $8,
              spotlight = $9,
              featured = $10,
              published = $11,
              published_at = $12,
              updated_at = $13
            WHERE id = $1
            RETURNING *
          `,
          [
            input.id,
            input.title,
            slug,
            input.excerpt,
            input.body,
            input.category,
            input.coverImage,
            input.trailerUrl || null,
            input.spotlight,
            input.featured,
            input.published,
            publishedAt,
            now,
          ],
        );

        await client.query("COMMIT");
        return mapRowToPost(updatedResult.rows[0]);
      }

      const createdResult = await client.query<PostRow>(
        `
          INSERT INTO posts (
            id,
            title,
            slug,
            excerpt,
            body,
            category,
            cover_image,
            trailer_url,
            spotlight,
            featured,
            published,
            published_at,
            created_at,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          RETURNING *
        `,
        [
          crypto.randomUUID(),
          input.title,
          slug,
          input.excerpt,
          input.body,
          input.category,
          input.coverImage,
          input.trailerUrl || null,
          input.spotlight,
          input.featured,
          input.published,
          input.published ? now : null,
          now,
          now,
        ],
      );

      await client.query("COMMIT");
      return mapRowToPost(createdResult.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");

      if (isUniqueViolation(error)) {
        throw new Error("DUPLICATE_SLUG");
      }

      throw error;
    }
  });
}

export async function deleteStory(id: string) {
  if (!isDatabaseEnabled()) {
    const posts = await ensurePostsFile();
    const nextPosts = posts.filter((post) => post.id !== id);

    if (nextPosts.length === posts.length) {
      throw new Error("NOT_FOUND");
    }

    await writePosts(nextPosts);
    return;
  }

  await ensureDatabaseReady();

  const result = await getPool().query(
    `
      DELETE FROM posts
      WHERE id = $1
    `,
    [id],
  );

  if (result.rowCount === 0) {
    throw new Error("NOT_FOUND");
  }
}

export async function resetSeedContent() {
  if (!isDatabaseEnabled()) {
    await writePosts(buildSeedPosts());
    return;
  }

  await ensureDatabaseReady();

  await withDatabaseClient(async (client) => {
    await client.query("BEGIN");

    try {
      await client.query("TRUNCATE TABLE posts");
      await insertPosts(client, buildSeedPosts());
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export function getDataFilePath() {
  return isDatabaseEnabled() ? null : dataFile;
}

export function getStorageMode() {
  return isDatabaseEnabled() ? "database" : "file";
}
