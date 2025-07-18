"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import { getSingleBlog, updateBlog, getAllTags, BlogResponseDto, TagResponseDto, UpdateBlogRequestDto } from "@/lib/api";
import { ApiResponse } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface Blog {
  id: string;
  title: string;
  body: string;
  userId: string;
  tags: { id: string; name: string }[];
}

interface Tag {
  id: string;
  name: string;
}

interface EditBlogClientProps {
  id: string;
}

export default function EditBlogClient({ id }: EditBlogClientProps) {
  const { accessToken, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // Validate if the ID is a valid MongoDB ObjectId (24-character hexadecimal string)
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id)) {
    notFound();
  }

  const blogId = id;

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<TagResponseDto[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !accessToken) return;

      setLoading(true);
      setError(null);

      // Fetch blog details
      const blogResult: ApiResponse<BlogResponseDto> = await getSingleBlog(blogId, accessToken);
      if (blogResult.data) {
        setTitle(blogResult.data.title);
        setBody(blogResult.data.body);
        setSelectedTagIds(blogResult.data.tags.map((tag) => tag.id));
      } else {
        setError(blogResult.error || "Failed to fetch blog details.");
        setLoading(false);
        return;
      }

      // Fetch all available tags
      const allTagsResult: ApiResponse<TagResponseDto[]> = await getAllTags();
      if (allTagsResult.data) {
        setTags(allTagsResult.data);
      } else {
        console.error("Failed to fetch all tags:", allTagsResult.error);
      }

      setLoading(false);
    };

    if (!authLoading) {
      fetchData();
    }
  }, [blogId, accessToken, isAuthenticated, authLoading]);

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!accessToken) {
      setError("Authentication token not found.");
      setLoading(false);
      return;
    }

    const updateResult: ApiResponse<string> = await updateBlog(
      blogId,
      { title, body },
      accessToken
    );

    if (updateResult.data) {
      router.push("/own-blog");
    } else {
      setError(updateResult.error || "Failed to update blog.");
    }
    setLoading(false);
  };

  if (authLoading || loading) {
    return <div className="flex justify-center items-center h-screen">Loading blog...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <ProtectedRoute>
      <section className="py-32">
        <div className="container flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-2xl rounded-lg border bg-card text-card-foreground shadow-sm p-6 md:p-8">
            <h2 className="mb-6 text-center text-2xl font-bold">Edit Blog Post</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="body">Body</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  rows={10}
                />
              </div>
              
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Updating..." : "Update Blog"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
}
