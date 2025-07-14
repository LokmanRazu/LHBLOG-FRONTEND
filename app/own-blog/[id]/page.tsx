import SingleBlogClient from "@/components/own-blog/single-blog-client";

export default async function SingleBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  return <SingleBlogClient id={id} />;
}
