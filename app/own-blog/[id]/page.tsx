import SingleBlogClient from "@/components/own-blog/single-blog-client";

export default async function SingleBlogPage({ params }: { params: { id: string } }) {
  const id = params.id;

  return <SingleBlogClient id={id} />;
}
