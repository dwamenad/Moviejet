import { notFound } from "next/navigation";
import { PostForm } from "@/components/admin/post-form";
import { getAdminStoryById } from "@/lib/content";

type EditStoryPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function EditStoryPage({
  params,
  searchParams,
}: EditStoryPageProps) {
  const { id } = await params;
  const [story, query] = await Promise.all([getAdminStoryById(id), searchParams]);

  if (!story) {
    notFound();
  }

  return <PostForm post={story} error={query.error} success={query.success} />;
}
