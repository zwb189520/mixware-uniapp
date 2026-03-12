import { get, post, postFormWithQuery, del } from './request'

/**
 * 获取帖子详情
 * @param {string} postId - 帖子 ID
 * @returns {Promise<Object>} 返回帖子详情
 */
export function getPostDetail(postId) {
  return get(`/community/posts/${postId}`, {}, {
    cache: true,
    cacheTime: 3 * 60 * 1000
  })
}

/**
 * 获取帖子列表
 * @param {Object} [params={}] - 查询参数
 * @returns {Promise<Object>} 返回帖子列表
 */
export function getPostList(params = {}) {
  return get('/community/posts', params)
}

/**
 * 获取点赞过的帖子列表
 * @param {Object} [params={}] - 查询参数
 * @returns {Promise<Object>} 返回点赞帖子列表
 */
export function getLikedPosts(params = {}) {
  return get('/community/posts/liked', params)
}

/**
 * 创建帖子
 * @param {Object} postData - 帖子数据
 * @returns {Promise<Object>} 返回创建结果
 */
export function createPost(postData) {
  return post('/community/posts', postData)
}

/**
 * 删除帖子
 * @param {string} postId - 帖子 ID
 * @returns {Promise<Object>} 返回删除结果
 */
export function deletePost(postId) {
  return del(`/community/posts/${postId}`)
}

/**
 * 获取帖子评论
 * @param {string} postId - 帖子 ID
 * @returns {Promise<Object>} 返回评论列表
 */
export function getPostComments(postId) {
  return get(`/community/posts/${postId}/comments`)
}

/**
 * 创建评论
 * @param {Object} commentData - 评论数据
 * @returns {Promise<Object>} 返回创建结果
 */
export function createComment(commentData) {
  return post('/community/comments', commentData)
}

/**
 * 删除评论
 * @param {string} commentId - 评论 ID
 * @returns {Promise<Object>} 返回删除结果
 */
export function deleteComment(commentId) {
  return del(`/community/comments/${commentId}`)
}

/**
 * 切换点赞状态
 * @param {string} targetType - 目标类型
 * @param {string} targetId - 目标 ID
 * @returns {Promise<Object>} 返回切换结果
 */
export function toggleLike(targetType, targetId) {
  return postFormWithQuery('/community/likes', {}, {
    targetType,
    targetId
  })
}

/**
 * 检查点赞状态
 * @param {string} targetType - 目标类型
 * @param {string} targetId - 目标 ID
 * @returns {Promise<Object>} 返回点赞状态
 */
export function checkLikeStatus(targetType, targetId) {
  return get('/community/likes/check', {
    targetType,
    targetId
  })
}

/**
 * 切换关注状态
 * @param {string} userId - 用户 ID
 * @returns {Promise<Object>} 返回切换结果
 */
export function toggleFollow(userId) {
  return post(`/community/follows/${userId}`)
}

/**
 * 检查关注状态
 * @param {string} userId - 用户 ID
 * @returns {Promise<Object>} 返回关注状态
 */
export function checkFollowStatus(userId) {
  return get(`/community/follows/check/${userId}`)
}

/**
 * 获取关注列表
 * @param {string} userId - 用户 ID
 * @returns {Promise<Object>} 返回关注列表
 */
export function getFollowingList(userId) {
  return get(`/community/users/${userId}/followings`)
}

/**
 * 获取粉丝列表
 * @param {string} userId - 用户 ID
 * @returns {Promise<Object>} 返回粉丝列表
 */
export function getFollowersList(userId) {
  return get(`/community/users/${userId}/followers`)
}
