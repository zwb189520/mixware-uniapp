<template>
	<scroll-view scroll-y class="page" :scroll-x="false" :show-scrollbar="false">
		<!-- 安全区域 -->
		<view class="safe-area-top" :style="{height: statusBarHeight + 'px'}"></view>
		<text>小宝库</text>
	</scroll-view>
</template>

<script>
export default {
	data() {
		return {
			statusBarHeight: 0
		}
	},
	onLoad() {
		// 获取状态栏高度
		const systemInfo = uni.getSystemInfoSync()
		this.statusBarHeight = systemInfo.statusBarHeight
	}
}
</script>

<style>
.page {
	height: 100vh;
	padding: 20rpx;
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