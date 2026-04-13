import { get, post, postFormWithQuery, del } from './request'
import type { ApiResponse, CommunityPost, Comment, PaginatedData } from '@/types/api'

export function getPostDetail(postId: string): Promise<ApiResponse<CommunityPost>> {
  return get<CommunityPost>(
    `/community/posts/${postId}`,
    {},
    {
      cache: true,
      cacheTime: 3 * 60 * 1000
    }
  )
}

export function getPostList(params: Record<string, unknown> = {}): Promise<ApiResponse<PaginatedData<CommunityPost>>> {
  return get<PaginatedData<CommunityPost>>('/community/posts', params)
}

export function getLikedPosts(params: Record<string, unknown> = {}): Promise<ApiResponse<PaginatedData<CommunityPost>>> {
  return get<PaginatedData<CommunityPost>>('/community/posts/liked', params)
}

export function createPost(postData: Record<string, unknown>): Promise<ApiResponse<CommunityPost>> {
  return post<CommunityPost>('/community/posts', postData)
}

export function deletePost(postId: string): Promise<ApiResponse<null>> {
  return del<null>(`/community/posts/${postId}`)
}

export function getPostComments(postId: string): Promise<ApiResponse<Comment[]>> {
  return get<Comment[]>(`/community/posts/${postId}/comments`)
}

export function createComment(commentData: Record<string, unknown>): Promise<ApiResponse<Comment>> {
  return post<Comment>('/community/comments', commentData)
}

export function deleteComment(commentId: string): Promise<ApiResponse<null>> {
  return del<null>(`/community/comments/${commentId}`)
}

export function toggleLike(targetType: string, targetId: string): Promise<ApiResponse<{ liked: boolean }>> {
  return postFormWithQuery<{ liked: boolean }>(
    '/community/likes',
    {},
    {
      targetType,
      targetId
    }
  )
}

export function checkLikeStatus(targetType: string, targetId: string): Promise<ApiResponse<{ liked: boolean }>> {
  return get<{ liked: boolean }>('/community/likes/check', {
    targetType,
    targetId
  })
}

export function toggleFollow(userId: string): Promise<ApiResponse<{ following: boolean }>> {
  return post<{ following: boolean }>(`/community/follows/${userId}`)
}

export function checkFollowStatus(userId: string): Promise<ApiResponse<{ following: boolean }>> {
  return get<{ following: boolean }>(`/community/follows/check/${userId}`)
}

export function getFollowingList(userId: string): Promise<ApiResponse<{ userId: string; userName: string; avatar: string }[]>> {
  return get(`/community/users/${userId}/followings`)
}

export function getFollowersList(userId: string): Promise<ApiResponse<{ userId: string; userName: string; avatar: string }[]>> {
  return get(`/community/users/${userId}/followers`)
}
