<template>
	<!-- 简易 mp-html 兼容组件：H5/App 直接使用 rich-text 渲染 HTML 字符串 -->
	<rich-text :nodes="content"></rich-text>
</template>

<script>
export default {
	name: 'mp-html',
	props: {
		// HTML 字符串
		content: {
			type: String,
			default: ''
		}
	}
}
</script>

