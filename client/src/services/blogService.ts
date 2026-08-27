import { apiClient } from './apiClient';
import { BlogPost } from '@stitchx/shared';

export const blogService = {
  // Get all blogs (public)
  getBlogs: async (params?: { category?: string; search?: string; tag?: string; isPublished?: boolean }): Promise<BlogPost[]> => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.tag) query.append('tag', params.tag);
    if (params?.isPublished !== undefined) query.append('isPublished', String(params.isPublished));

    const endpoint = `/blogs${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await apiClient.get<BlogPost[]>(endpoint);
    return res.data || [];
  },

  // Get single blog by slug
  getBlogBySlug: async (slug: string): Promise<BlogPost> => {
    const res = await apiClient.get<BlogPost>(`/blogs/${slug}`);
    if (!res.data) {
      throw new Error('Blog article not found');
    }
    return res.data;
  },

  // Create blog (Admin)
  createBlog: async (data: Partial<BlogPost>): Promise<BlogPost> => {
    const res = await apiClient.post<BlogPost>('/blogs', data);
    if (!res.success) throw new Error(res.error?.message || 'Failed to create blog article');
    return res.data!;
  },

  // Update blog (Admin)
  updateBlog: async (id: string, data: Partial<BlogPost>): Promise<BlogPost> => {
    const res = await apiClient.put<BlogPost>(`/blogs/${id}`, data);
    if (!res.success) throw new Error(res.error?.message || 'Failed to update blog article');
    return res.data!;
  },

  // Delete blog (Admin)
  deleteBlog: async (id: string): Promise<void> => {
    const res = await apiClient.delete(`/blogs/${id}`);
    if (!res.success) throw new Error(res.error?.message || 'Failed to delete blog article');
  },
};
