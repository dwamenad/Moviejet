import { PostForm } from "@/components/admin/post-form";

type NewStoryPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function NewStoryPage({ searchParams }: NewStoryPageProps) {
  const params = await searchParams;

  return <PostForm error={params.error} success={params.success} />;
}
