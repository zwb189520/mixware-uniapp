<template>
	<view class="profile-info">
		<!-- 个人信息组件 -->
		<view class="profile-section">
			<view class="avatar-container">
				<image class="avatar" :src="userInfo.avatar" mode="aspectFill"></image>
			</view>
			
			<view class="title-section">
				<text class="username">{{ userInfo.username }}</text>
				<text class="title">{{ userInfo.title }}</text>
			</view>
		</view>
		
		<!-- 成就勋章墙 -->
		<view class="achievements-section">
			<view class="section-title">
				<text>成就勋章</text>
			</view>
			<view class="medals-grid">
				<view v-for="medal in achievements" :key="medal.id" class="medal-item">
					<image class="medal-icon" :src="medal.icon" mode="aspectFill"></image>
					<text class="medal-name">{{ medal.name }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: "ProfileInfo",
	props: {
		userInfo: {
			type: Object,
			default: () => ({
				username: "用户昵称",
				title: "新手玩家",
				avatar: "/static/default-avatar.png"
			})
		},
		achievements: {
			type: Array,
			default: () => [
				{ id: 1, name: "初次登录", icon: "/static/medal-login.png" },
				{ id: 2, name: "连续签到", icon: "/static/medal-checkin.png" },
				{ id: 3, name: "分享达人", icon: "/static/medal-share.png" },
				{ id: 4, name: "活跃用户", icon: "/static/medal-active.png" },
				{ id: 5, name: "收藏家", icon: "/static/medal-collect.png" },
				{ id: 6, name: "评论员", icon: "/static/medal-comment.png" }
			]
		}
	}
}
</script>

<style scoped>
.profile-section {
	display: flex;
	align-items: center;
	background: white;
	border-radius: 20rpx;
	padding: 40rpx;
	margin-bottom: 30rpx;
}

.avatar-container {
	margin-right: 30rpx;
}

.avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 60rpx;
	border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.title-section {
	flex: 1;
	color: #333;
}

.username {
	display: block;
	font-size: 36rpx;
	font-weight: bold;
	margin-bottom: 10rpx;
}

.title {
	display: block;
	font-size: 28rpx;
	opacity: 0.9;
}

.achievements-section {
	background: white;
	border-radius: 20rpx;
	padding: 30rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 30rpx;
	padding-bottom: 20rpx;
	border-bottom: 2rpx solid #f0f0f0;
}

.medals-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 30rpx;
}

.medal-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
}

.medal-icon {
	width: 80rpx;
	height: 80rpx;
	border-radius: 40rpx;
	margin-bottom: 15rpx;
}

.medal-name {
	font-size: 24rpx;
	color: #666;
	line-height: 1.2;
}
</style>