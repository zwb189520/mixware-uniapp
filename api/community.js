import { get, post, postFormWithQuery, del } from './request'

// 帖子相关
export function getPostDetail(postId) {
  return get(`/community/posts/${postId}`, {}, {
    cache: true,
    cacheTime: 3 * 60 * 1000  // 3分钟缓存
  })
}

export function getPostList(params = {}) {
  return get('/community/posts', params)
}

export function getLikedPosts(params = {}) {
  return get('/community/posts/liked', params)
}

export function createPost(postData) {
  return post('/community/posts', postData)
}

export function deletePost(postId) {
  return del(`/community/posts/${postId}`)
}

// 评论相关
export function getPostComments(postId) {
  return get(`/community/posts/${postId}/comments`)
}

export function createComment(commentData) {
  return post('/community/comments', commentData)
}

export function deleteComment(commentId) {
  return del(`/community/comments/${commentId}`)
}

// 点赞相关 - 使用 form-urlencoded 格式（接口要求）
export function toggleLike(targetType, targetId) {
  return postFormWithQuery('/community/likes', {}, {
    targetType,
    targetId
  })
}

export function checkLikeStatus(targetType, targetId) {
  return get('/community/likes/check', {
    targetType,
    targetId
  })
}

// 关注相关
export function toggleFollow(userId) {
  return post(`/community/follows/${userId}`)
}

export function checkFollowStatus(userId) {
  return get(`/community/follows/check/${userId}`)
}

export function getFollowingList(userId) {
  return get(`/community/users/${userId}/followings`)
}

export function getFollowersList(userId) {
  return get(`/community/users/${userId}/followers`)
}

export default {
  getPostDetail,
  getPostList,
  getLikedPosts,
  createPost,
  deletePost,
  getPostComments,
  createComment,
  deleteComment,
  toggleLike,
  checkLikeStatus,
  toggleFollow,
  checkFollowStatus,
  getFollowingList,
  getFollowersList
}
