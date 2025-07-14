const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://maac-blog.onrender.com";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// DTO Interfaces

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponseDto {
  accessToken: string;
}

export interface BlogResponseDto {
  id: string;
  title: string;
  body: string;
  userId: string;
  user: { id: string; name: string; email: string };
  tags: { id: string; name: string }[];
}

export interface TagResponseDto {
  id: string;
  name: string;
}

export interface CommentResponseDto {
  body: string;
  blogId: string;
  id: string;
  user: { id: number; name: string };
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface UserRequestDto {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
}

export interface UserUpdateRequestDto {
  name: string;
}

export interface BlogRequestDto {
  title: string;
  body: string;
  tagIds: string[];
}

export interface UpdateBlogRequestDto {
  title: string;
  body: string;
}

export interface AddBlogTag {
  tagId: string;
}

export interface CommentRequestDto {
  body: string;
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
      return { data: undefined, error: errorText || response.statusText };
    }

    const text = await response.text();

    if (response.status === 204 || text === '') {
        return { data: "Operation successful" as any };
    }

    try {
      return { data: JSON.parse(text) as T };
    } catch (e) {
      return { data: text as any };
    }
  } catch (error: any) {
    return { data: undefined, error: error.message || "An unexpected error occurred" };
  }
}

// Auth Endpoints
export const signInUser = async (credentials: LoginRequestDto) =>
  fetcher<LoginResponseDto>("/auth/signin", "POST", credentials);
export const signUpUser = async (userData: UserRequestDto) =>
  fetcher<string>("/auth/signup", "POST", userData);

// User Endpoints
export const getMyProfile = async (token: string) =>
  fetcher<UserResponseDto>("/users/me", "GET", undefined, token);
export const updateMyProfile = async (name: string, token: string) =>
  fetcher<UserResponseDto>("/users/update-profile", "PUT", { name }, token);

// Blog Endpoints
export const getMyBlogs = async (token: string) =>
  fetcher<BlogResponseDto[]>("/blogs", "GET", undefined, token);
export const getSingleBlog = async (id: string, token: string) =>
  fetcher<BlogResponseDto>(`/blogs/${id}`, "GET", undefined, token);
export const createBlog = async (blogData: BlogRequestDto, token: string) =>
  fetcher<BlogResponseDto>(`/blogs`, "POST", blogData, token);
export const updateBlog = async (id: string, blogData: UpdateBlogRequestDto, token: string) =>
  fetcher<string>(`/blogs/${id}`, "PUT", blogData, token);
export const deleteBlog = async (id: string, token: string) =>
  fetcher<string>(`/blogs/${id}`, "DELETE", undefined, token);
export const addTagToBlog = async (blogId: string, tagId: string, token: string) =>
  fetcher<string>(`/blogs/${blogId}/add-tag`, "PUT", { tagId }, token);
export const removeTagFromBlog = async (blogId: string, tagId: string, token: string) =>
  fetcher<string>(`/blogs/${blogId}/delete-tag/${tagId}`, "DELETE", undefined, token);

// Comment Endpoints
export const getCommentsForBlog = async (blogId: string, token: string) =>
  fetcher<CommentResponseDto[]>(`/blogs/${blogId}/comments`, "GET", undefined, token);
export const addCommentToBlog = async (blogId: string, commentBody: string, token: string) =>
  fetcher<CommentResponseDto>(`/blogs/${blogId}/comments`, "POST", { body: commentBody }, token);
export const deleteComment = async (blogId: string, commentId: string, token: string) =>
  fetcher<string>(`/blogs/${blogId}/comments/${commentId}`, "DELETE", undefined, token);

// Tag Endpoints
export const getAllTags = async (): Promise<ApiResponse<TagResponseDto[]>> => {
  try {
    const res = await fetch(`${BASE_URL}/tags`); // Assuming /tags is the correct endpoint
    const data = await res.json();

    return {
      data: data, // Assuming the API returns an array of tags directly
      error: undefined,
    };
  } catch (err: any) {
    return {
      data: undefined,
      error: err.message || "Failed to fetch tags",
    };
  }
};
export const createTag = async (tagName: string) =>
  fetcher<TagResponseDto>("/tags", "POST", { name: tagName });