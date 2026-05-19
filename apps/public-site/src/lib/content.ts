import { readFile } from "node:fs/promises";
import { join } from "node:path";

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

export type PublicContentPayload = {
  categories: string[];
  featuredStories: Post[];
  generatedAt: string;
  latestStories: Post[];
  spotlightStory: Post | null;
  storageMode: "database" | "file";
  stories: Post[];
  trailerStory: Post | null;
};

function normaliseBaseUrl(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/\/+$/, "");
}

function getLocalSnapshotPath() {
  return join(process.cwd(), "content", "published-content.json");
}

async function readLocalSnapshot() {
  try {
    const raw = await readFile(getLocalSnapshotPath(), "utf8");
    return JSON.parse(raw) as PublicContentPayload;
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

async function fetchRemoteContent(contentSourceUrl: string) {
  const endpoint = new URL("/api/public/content", `${contentSourceUrl}/`);
  const response = await fetch(endpoint, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Content source request failed (${response.status})`);
  }

  return (await response.json()) as PublicContentPayload;
}

export async function getPublicContent() {
  const contentSourceUrl = normaliseBaseUrl(process.env.CONTENT_SOURCE_URL);

  if (contentSourceUrl) {
    try {
      return await fetchRemoteContent(contentSourceUrl);
    } catch (error) {
      if (process.env.CONTENT_SOURCE_STRICT === "true") {
        throw error;
      }

      console.warn("Falling back to local public snapshot.", error);
    }
  }

  const snapshot = await readLocalSnapshot();

  if (snapshot) {
    return snapshot;
  }

  throw new Error(
    "No public content source is available. Set CONTENT_SOURCE_URL or generate content/published-content.json.",
  );
}

export async function getHomepageContent() {
  const payload = await getPublicContent();

  return {
    categories: payload.categories,
    featuredStories: payload.featuredStories,
    latestStories: payload.latestStories,
    spotlightStory: payload.spotlightStory,
    trailerStory: payload.trailerStory,
  };
}

export async function getPublishedStories() {
  return (await getPublicContent()).stories;
}

export async function getStoryBySlug(slug: string) {
  return (await getPublicContent()).stories.find((story) => story.slug === slug) ?? null;
}

export async function getRelatedStories(category: string, excludeId: string) {
  return (await getPublicContent()).stories
    .filter((story) => story.category === category && story.id !== excludeId)
    .slice(0, 3);
}

export async function getStorySlugs() {
  return (await getPublicContent()).stories.map((story) => story.slug);
}

export function getAdminSiteUrl() {
  return normaliseBaseUrl(process.env.ADMIN_SITE_URL);
}

export function buildAdminSiteUrl(path = "/login") {
  const adminSiteUrl = getAdminSiteUrl();

  if (!adminSiteUrl) {
    return null;
  }

  const normalisedPath = path.startsWith("/") ? path : `/${path}`;
  return `${adminSiteUrl}${normalisedPath}`;
}
