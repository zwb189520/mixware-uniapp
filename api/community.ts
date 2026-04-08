import { get, post, postFormWithQuery, del } from './request'

/**
 * 获取帖子详情
 * @param postId - 帖子 ID
 */
export function getPostDetail(postId: string): Promise<unknown> {
  return get(`/community/posts/${postId}`, {}, {
    cache: true,
    cacheTime: 3 * 60 * 1000
  })
}

/**
 * 获取帖子列表
 * @param params - 查询参数
 */
export function getPostList(params: Record<string, unknown> = {}): Promise<unknown> {
  return get('/community/posts', params)
}

/**
 * 获取点赞过的帖子列表
 * @param params - 查询参数
 */
export function getLikedPosts(params: Record<string, unknown> = {}): Promise<unknown> {
  return get('/community/posts/liked', params)
}

/**
 * 创建帖子
 * @param postData - 帖子数据
 */
export function createPost(postData: Record<string, unknown>): Promise<unknown> {
  return post('/community/posts', postData)
}

/**
 * 删除帖子
 * @param postId - 帖子 ID
 */
export function deletePost(postId: string): Promise<unknown> {
  return del(`/community/posts/${postId}`)
}

/**
 * 获取帖子评论
 * @param postId - 帖子 ID
 */
export function getPostComments(postId: string): Promise<unknown> {
  return get(`/community/posts/${postId}/comments`)
}

/**
 * 创建评论
 * @param commentData - 评论数据
 */
export function createComment(commentData: Record<string, unknown>): Promise<unknown> {
  return post('/community/comments', commentData)
}

/**
 * 删除评论
 * @param commentId - 评论 ID
 */
export function deleteComment(commentId: string): Promise<unknown> {
  return del(`/community/comments/${commentId}`)
}

/**
 * 切换点赞状态
 * @param targetType - 目标类型
 * @param targetId - 目标 ID
 */
export function toggleLike(targetType: string, targetId: string): Promise<unknown> {
  return postFormWithQuery('/community/likes', {}, {
    targetType,
    targetId
  })
}

/**
 * 检查点赞状态
 * @param targetType - 目标类型
 * @param targetId - 目标 ID
 */
export function checkLikeStatus(targetType: string, targetId: string): Promise<unknown> {
  return get('/community/likes/check', {
    targetType,
    targetId
  })
}

/**
 * 切换关注状态
 * @param userId - 用户 ID
 */
export function toggleFollow(userId: string): Promise<unknown> {
  return post(`/community/follows/${userId}`)
}

/**
 * 检查关注状态
 * @param userId - 用户 ID
 */
export function checkFollowStatus(userId: string): Promise<unknown> {
  return get(`/community/follows/check/${userId}`)
}

/**
 * 获取关注列表
 * @param userId - 用户 ID
 */
export function getFollowingList(userId: string): Promise<unknown> {
  return get(`/community/users/${userId}/followings`)
}

/**
 * 获取粉丝列表
 * @param userId - 用户 ID
 */
export function getFollowersList(userId: string): Promise<unknown> {
  return get(`/community/users/${userId}/followers`)
}
