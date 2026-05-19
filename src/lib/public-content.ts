import { getHomepageContent, getPublishedStories, getStorageMode, type Post } from "@/lib/content";

export type PublicContentPayload = {
  categories: string[];
  featuredStories: Post[];
  generatedAt: string;
  latestStories: Post[];
  spotlightStory: Post | null;
  storageMode: ReturnType<typeof getStorageMode>;
  stories: Post[];
  trailerStory: Post | null;
};

export async function getPublicContentPayload(): Promise<PublicContentPayload> {
  const [homepage, stories] = await Promise.all([getHomepageContent(), getPublishedStories()]);

  return {
    generatedAt: new Date().toISOString(),
    storageMode: getStorageMode(),
    stories,
    ...homepage,
  };
}
