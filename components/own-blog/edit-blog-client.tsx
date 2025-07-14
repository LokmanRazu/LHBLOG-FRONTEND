"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import { getSingleBlog, updateBlog, getAllTags, addTagToBlog, removeTagFromBlog } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface Tag {
  id: number;
  name: string;
}

interface Blog {
  id: number;
  title: string;
  body: string;
  userId: number;
  tags: { id: number; name: string }[];
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
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !accessToken) return;

      setLoading(true);
      setError(null);

      // Fetch blog details
      const { data: blogData, error: blogError } = await getSingleBlog(blogId, accessToken);
      if (blogData) {
        setTitle(blogData.title);
        setBody(blogData.body);
        setSelectedTagIds(blogData.tags.map((tag) => tag.id));
      } else {
        setError(blogError || "Failed to fetch blog details.");
        setLoading(false);
        return;
      }

      // Fetch all available tags
      const { data: allTagsData, error: allTagsError } = await getAllTags();
      if (allTagsData) {
        setTags(allTagsData);
      } else {
        console.error("Failed to fetch all tags:", allTagsError);
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

    const { data, error: apiError } = await updateBlog(
      blogId,
      { title, body },
      accessToken
    );

    if (data) {
      router.push("/own-blog");
    } else {
      setError(apiError || "Failed to update blog.");
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
              <div>
                <Label>Tags</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {tags.map((tag) => (
                    <div key={tag.id} className="flex items-center space-x-1">
                      <Checkbox
                        id={`tag-${tag.id}`}
                        checked={selectedTagIds.includes(tag.id)}
                        disabled
                      />
                      <Label htmlFor={`tag-${tag.id}`} className="text-sm">{tag.name}</Label>
                    </div>
                  ))}
                </div>
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
