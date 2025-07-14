"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import { getSingleBlog } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Blog {
  id: number;
  title: string;
  body: string;
  userId: number;
  tags: { id: number; name: string }[];
}

interface PageProps {
  params: { id: string };
}

export default function SingleBlogPage({ params }: PageProps) {
  const { accessToken, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const id = params.id;

  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id)) {
    notFound();
  }

  const blogId = id;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!isAuthenticated || !accessToken) return;

      setFetchLoading(true);
      setError(null);

      const { data, error: apiError } = await getSingleBlog(blogId, accessToken);
      if (data) {
        setBlog(data);
      } else {
        setError(apiError || "Failed to fetch blog details.");
      }
      setFetchLoading(false);
    };

    if (!authLoading) {
      fetchBlog();
    }
  }, [blogId, accessToken, isAuthenticated, authLoading]);

  if (authLoading || fetchLoading) {
    return <div className="flex justify-center items-center h-screen">Loading blog...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  if (!blog) {
    return <div className="flex justify-center items-center h-screen">Blog not found.</div>;
  }

  return (
    <ProtectedRoute>
      <section className="py-32">
        <div className="container flex flex-col items-center gap-16 lg:px-16">
          <div className="text-center">
            <h2 className="mb-3 text-pretty text-3xl font-semibold md:mb-4 md:text-4xl lg:mb-6 lg:max-w-3xl lg:text-5xl">
              {blog.title}
            </h2>
            <div className="mb-8 text-muted-foreground md:text-base lg:max-w-2xl lg:text-lg text-left">
              {blog.body}
            </div>
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {blog.tags.map((tag, index) => (
                <span
                  key={`${tag.id}-${index}`}
                  className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                >
                  {tag.name}
                </span>
              ))}
            </div>
            <Link href="/own-blog">
              <Button>Back to My Blogs</Button>
            </Link>
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
}
