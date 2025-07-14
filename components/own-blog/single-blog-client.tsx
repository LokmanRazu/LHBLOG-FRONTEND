"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import { getSingleBlog, BlogResponseDto } from "@/lib/api";
import { ApiResponse } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Blog {
  id: string;
  title: string;
  body: string;
  userId: string;
  tags: { id: string; name: string }[];
}

interface SingleBlogClientProps {
  id: string;
}

export default function SingleBlogClient({ id }: SingleBlogClientProps) {
  const { accessToken, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id)) {
    notFound();
  }

  const blogId = id;

  const [blog, setBlog] = useState<BlogResponseDto | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!isAuthenticated || !accessToken) return;

      setFetchLoading(true);
      setError(null);

      const blogResult: ApiResponse<BlogResponseDto> = await getSingleBlog(blogId, accessToken);
      if (blogResult.data) {
        setBlog(blogResult.data);
      } else {
        setError(blogResult.error || "Failed to fetch blog details.");
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
            <Link href="/own-blog">
              <Button>Back to My Blogs</Button>
            </Link>
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
}
