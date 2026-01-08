<template>
  <view class="page-container">
    <!-- 作品详情导航栏组件 -->
    <WorkDetailNavbar
      :title="workTitle"
      @back-click="handleBack"
    />

    <!-- 页面内容 -->
    <scroll-view scroll-y class="content-scroll">
      <!-- 用户信息 -->
      <UserInfo
        :user-name="userName"
        :user-avatar="userAvatar"
      />

      <!-- 作品信息组件 -->
      <WorkInfo
        :model-image="modelImage"
        :description="description"
        :work-info="workInfo"
      />

      <!-- 评论组件 -->
      <CommentSection
        :comments="comments"
        @like-click="handleCommentLike"
        @reply-click="handleCommentReply"
      />
    </scroll-view>
  </view>
</template>

<script>
import WorkDetailNavbar from './components/WorkDetailNavbar.vue'
import UserInfo from './components/UserInfo.vue'
import WorkInfo from './components/WorkInfo.vue'
import CommentSection from './components/CommentSection.vue'

export default {
  components: {
    WorkDetailNavbar,
    UserInfo,
    WorkInfo,
    CommentSection
  },
  data() {
    return {
      workId: '',
      workTitle: '作品详情',
      userName: '',
      userAvatar: '',
      modelImage: '',
      description: '',
      workInfo: {},
      comments: []
    }
  },
  onLoad(options) {
    this.workId = options.workId || ''
    
    // 使用示例数据
    this.useMockData()
  },
  methods: {
    useMockData() {
      this.workTitle = '机械臂作品详情'
      this.userName = '张设计师'
      this.userAvatar = '/static/images/logo.png'
      this.modelImage = '/static/images/logo.png'
      this.description = '使用PLA材料打印的机械臂，经过精心调校后运行稳定，适合教育和演示使用。'
      this.workInfo = {
        printTime: '2024-01-15',
        material: 'PLA',
        size: '120x80x20mm'
      }
      
      this.comments = [
        {
          id: 1,
          userName: '李工程师',
          userAvatar: '/static/images/logo.png',
          content: '这个模型设计得很不错，关节活动很流畅！',
          time: '2小时前',
          likes: 5,
          isLiked: false,
          replies: [
            {
              id: 101,
              userName: '张设计师',
              content: '谢谢夸奖，还在优化中',
              time: '1小时前'
            }
          ]
        },
        {
          id: 2,
          userName: '王老师',
          userAvatar: '/static/images/logo.png',
          content: '能否分享一下打印参数？',
          time: '3小时前',
          likes: 2,
          isLiked: true,
          replies: []
        }
      ]
    },

    handleBack() {
      uni.navigateBack()
    },

    handleCommentLike(commentId) {
      const comment = this.comments.find(c => c.id === commentId)
      if (comment) {
        comment.isLiked = !comment.isLiked
        comment.likes += comment.isLiked ? 1 : -1
      }
    },

    handleCommentReply(commentId) {
      console.log('回复评论:', commentId)
      // 这里可以实现回复功能
    }
  }
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.content-scroll {
  flex: 1;
  height: 0;
}
</style>