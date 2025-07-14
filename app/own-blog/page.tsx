"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { getMyBlogs, deleteBlog } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Blog {
  id: number;
  title: string;
  body: string;
  userId: number;
  tags: { id: number; name: string }[];
}

export default function OwnBlogPage() {
  const { accessToken, isAuthenticated, loading } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogs = useCallback(async () => {
    setFetchLoading(true);
    setError(null);
    const { data, error } = await getMyBlogs(accessToken!);
    if (data) {
      setBlogs(data);
    } else {
      setError(error || "Failed to fetch blogs.");
    }
    setFetchLoading(false);
  }, [accessToken]);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchBlogs();
    }
  }, [isAuthenticated, accessToken, fetchBlogs]);
    setFetchLoading(true);
    setError(null);
    const { data, error } = await getMyBlogs(accessToken!);
    if (data) {
      setBlogs(data);
    } else {
      setError(error || "Failed to fetch blogs.");
    }
    setFetchLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this blog?")) {
      const { error } = await deleteBlog(id, accessToken!);
      if (!error) {
        fetchBlogs(); // Refresh the list
      } else {
        setError(error || "Failed to delete blog.");
      }
    }
  };

  if (loading || fetchLoading) {
    return <div className="flex justify-center items-center h-screen">Loading blogs...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <ProtectedRoute>
      <section className="py-32">
        <div className="container flex flex-col items-center gap-16 lg:px-16">
          <div className="text-center">
            <h2 className="mb-3 text-pretty text-3xl font-semibold md:mb-4 md:text-4xl lg:mb-6 lg:max-w-3xl lg:text-5xl">
              My Blogs
            </h2>
            <p className="mb-8 text-muted-foreground md:text-base lg:max-w-2xl lg:text-lg">
              Manage your blog posts here.
            </p>
            <Link href="/own-blog/create">
              <Button>Create New Blog</Button>
            </Link>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {blogs.length === 0 ? (
              <p>No blogs found. Create one!</p>
            ) : (
              blogs.map((blog) => (
                <Card key={blog.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle>{blog.title}</CardTitle>
                    
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Link href={`/own-blog/edit/${blog.id}`}>
                      <Button variant="outline">Edit</Button>
                    </Link>
                    <Button variant="destructive" onClick={() => handleDelete(blog.id)}>
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
}
