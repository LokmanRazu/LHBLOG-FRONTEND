"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import { createBlog, getAllTags } from "@/lib/api";
import { ApiResponse, TagResponseDto } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";



export default function CreateBlogPage() {
  const { accessToken, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<TagResponseDto[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      const result: ApiResponse<TagResponseDto[]> = await getAllTags();
      if (result.data) {
        setTags(result.data);
      } else {
        console.error("Failed to fetch tags:", result.error);
      }
    };
    fetchTags();
  }, []);

  const handleTagChange = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!accessToken) {
      setError("Authentication token not found.");
      setLoading(false);
      return;
    }

    const { data, error: apiError } = await createBlog(
      { title, body, tagIds: selectedTagIds },
      accessToken
    );

    if (data) {
      router.push("/own-blog");
    } else {
      setError(apiError || "Failed to create blog.");
    }
    setLoading(false);
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <ProtectedRoute>
      <section className="py-32">
        <div className="container flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-2xl rounded-lg border bg-card text-card-foreground shadow-sm p-6 md:p-8">
            <h2 className="mb-6 text-center text-2xl font-bold">Create New Blog Post</h2>
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
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag.id}`}
                        checked={selectedTagIds.includes(tag.id)}
                        onCheckedChange={() => handleTagChange(tag.id)}
                      />
                      <Label htmlFor={`tag-${tag.id}`}>{tag.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create Blog"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
}
