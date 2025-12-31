<template>
	<scroll-view scroll-y class="page" :scroll-x="false" :show-scrollbar="false">
		<!-- 安全区域 -->
		<view class="safe-area-top" :style="{height: statusBarHeight + 'px'}"></view>
		
		<!-- 个人信息组件 -->
		<profile-info :userInfo="userInfo" :achievements="achievements"></profile-info>
	</scroll-view>
</template>

<script>
import ProfileInfo from './components/profile-info.vue'

export default {
	components: {
		ProfileInfo
	},
	data() {
		return {
			statusBarHeight: 0,
			userInfo: {
				username: "用户昵称",
				title: "新手玩家",
				avatar: "/static/default-avatar.png"
			},
			achievements: [
				{ id: 1, name: "初次登录", icon: "/static/medal-login.png" },
				{ id: 2, name: "连续签到", icon: "/static/medal-checkin.png" },
				{ id: 3, name: "分享达人", icon: "/static/medal-share.png" },
				{ id: 4, name: "活跃用户", icon: "/static/medal-active.png" },
				{ id: 5, name: "收藏家", icon: "/static/medal-collect.png" },
				{ id: 6, name: "评论员", icon: "/static/medal-comment.png" }
			]
		}
	},
	onLoad() {
		const systemInfo = uni.getSystemInfoSync()
		this.statusBarHeight = systemInfo.statusBarHeight
	}
}
</script>

<style>
.page {
	height: 100vh;
	padding: 20rpx;
	background-color: #f5f5f5;
}
.page::-webkit-scrollbar {
	width: 0;
	height: 0;
	color: transparent;
	display: none;
}
.safe-area-top {
	width: 100%;
}
</style>