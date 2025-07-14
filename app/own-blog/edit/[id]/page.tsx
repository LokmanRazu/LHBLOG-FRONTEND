import EditBlogClient from "@/components/own-blog/edit-blog-client";

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  return <EditBlogClient id={id} />;
}
