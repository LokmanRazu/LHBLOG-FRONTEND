const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function fetcher<T>(
  url: string,
  method: string = "GET",
  body?: any,
  token?: string
): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { error: errorText || response.statusText };
    }

    // Handle cases where the response might be plain text or empty
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data: T = await response.json();
      return { data };
    } else {
      const data: any = await response.text(); // Treat as text if not JSON
      return { data };
    }
  } catch (error: any) {
    return { error: error.message || "An unexpected error occurred" };
  }
}

// Auth Endpoints
export const signInUser = async (credentials: any) =>
  fetcher("/auth/signin", "POST", credentials);
export const signUpUser = async (userData: any) =>
  fetcher("/auth/signup", "POST", userData);

// User Endpoints
export const getMyProfile = async (token: string) =>
  fetcher("/users/me", "GET", undefined, token);
export const updateMyProfile = async (name: string, token: string) =>
  fetcher("/users/update-profile", "PUT", { name }, token);

// Blog Endpoints
export const getMyBlogs = async (token: string) =>
  fetcher("/blogs", "GET", undefined, token);
export const getSingleBlog = async (id: number, token: string) =>
  fetcher(`/blogs/${id}`, "GET", undefined, token);
export const createBlog = async (blogData: any, token: string) =>
  fetcher("/blogs", "POST", blogData, token);
export const updateBlog = async (id: number, blogData: any, token: string) =>
  fetcher(`/blogs/${id}`, "PUT", blogData, token);
export const deleteBlog = async (id: number, token: string) =>
  fetcher(`/blogs/${id}`, "DELETE", undefined, token);
export const addTagToBlog = async (blogId: number, tagId: number, token: string) =>
  fetcher(`/blogs/${blogId}/add-tag`, "PUT", { tagId }, token);
export const removeTagFromBlog = async (blogId: number, tagId: number, token: string) =>
  fetcher(`/blogs/${blogId}/delete-tag/${tagId}`, "DELETE", undefined, token);

// Comment Endpoints
export const getCommentsForBlog = async (blogId: number, token: string) =>
  fetcher(`/blogs/${blogId}/comments`, "GET", undefined, token);
export const addCommentToBlog = async (blogId: number, commentBody: string, token: string) =>
  fetcher(`/blogs/${blogId}/comments`, "POST", { body: commentBody }, token);
export const deleteComment = async (blogId: number, commentId: number, token: string) =>
  fetcher(`/blogs/${blogId}/comments/${commentId}`, "DELETE", undefined, token);

// Tag Endpoints
export const getAllTags = async () => fetcher("/tags", "GET");
export const createTag = async (tagName: string) =>
  fetcher("/tags", "POST", { name: tagName });
