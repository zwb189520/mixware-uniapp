<template>
	<div class="w-full h-full relative">
		<!-- #ifdef APP -->
		<!-- app建议自己写逻辑，因为是renderjs的方式，调用方法很麻烦，自己写逻辑可以在template中直接调用renderjs中的方法 -->
		<StageApp ref="stageApp" v-bind="$props" @loaded="loaded" :playOptions="playOptions" @dimensions="onModelDimensions" @loadProgress="onLoadProgress"></StageApp>
		<!-- #endif -->

		<!-- #ifndef APP -->
		<Stage @onload="onload" :disableRaycaster="disableRaycaster" :enablePan="enablePan"></Stage>
		<!-- #endif -->
	</div>
</template>

<script>
	// #ifdef APP
	import StageApp from './stageApp.vue'
	// #endif	

	// #ifndef APP
	import Stage from './stage.vue'
	import * as THREE from './lib.js'
	import {
		useThreeJs,
		traverse,
		events,
		animation
	} from '@/components/cc-threeJs/index.js'
	const {
		getInstance, // 获取canvas、camera、等实例
		centerAndScale, // 用于调整模型大小和位置
		calculateModelDimensions, // 计算模型尺寸
		setEnv, // 设置环境贴图
		screenshot: _screenshot, // 截图
		fixFbxMaterial,
		controlReset
	} = useThreeJs()
	// #endif

	export default {
		name: 'preview3D',
		props: {
			// 模型链接
			modelurl: {
				type: [String, ArrayBuffer],
				default: ''
			},
			// 手动指定模型类型，比如h5预览本地模型可能会用到
			modelType: {
				type: String,
				default: '', // 'glb'
			},
			// 环境贴图链接
			env: {
				type: String,
				default: ''
			},
			// 环境贴图是否可见
			backgroundVisible: {
				type: Boolean,
				default: false
			},
			// 模型缩放比例
			scale: {
				type: Number,
				default: 1
			},
			// 模型自动旋转
			autoRotate: {
				type: Boolean,
				default: false
			},
			// 自动旋转速度
			autoRotateSpeed: {
				type: Number,
				default: 1.6
			},
			isFixFbxMaterial: {
				type: Boolean,
				default: false
			},
			// 是否禁用射线检测（模型点击）
			disableRaycaster: {
				type: Boolean,
				default: false
			},
			// 是否启用平移（拖拽）
			enablePan: {
				type: Boolean,
				default: false
			}
		},

		components: {
			// #ifndef APP
			Stage,
			// #endif
			// #ifdef APP
			StageApp
			// #endif
		},
		// #ifndef APP
		watch: {
			'modelurl': {
				handler() {
					this.loadModel()
				}
			},
			'autoRotate': {
				handler(val) {
					this.update()
				}
			},
			'autoRotateSpeed': {
				handler(val) {
					this.update()

				}
			},
		},
		// #endif
		data() {
			return {
				playOptions: {},
			}
		},
		methods: {
			// 统一暴露给外部的交互方法，支持全平台
			// 居中并缩放模型
			centerAndScale(scaleRatio = 1) {
				// #ifdef APP
				if (this.$refs.stageApp) {
					this.$refs.stageApp.call({
						key: 'centerAndScale',
						args: [scaleRatio],
						isReturn: false
					})
				}
				// #endif
				
				// #ifndef APP
				centerAndScale(scaleRatio)
				// #endif
			},
			// 重置相机视角
			resetCamera() {
				// #ifdef APP
				if (this.$refs.stageApp) {
					this.$refs.stageApp.call({
						key: 'resetCamera',
						args: [],
						isReturn: false
					})
				}
				// #endif
				
				// #ifndef APP
				// H5 端通过 useThreeJs 导出的 controlReset 重置
				if (typeof controlReset === 'function') {
					controlReset({ duration: 600 })
				} else {
					centerAndScale(this.scale)
				}
				// #endif
			},
			update() {
				const {
					controls
				} = getInstance()
				// 检查 controls 是否存在，避免在初始化时出错
				if (controls) {
				controls.autoRotateSpeed = this.autoRotateSpeed
				controls.autoRotate = this.autoRotate
				}
			},
			loaded() {
				this.$emit('loaded')
			},
			// 接收模型尺寸数据（APP端 renderjs 调用）
			onModelDimensions(dimensions) {
				console.log('收到模型尺寸数据:', dimensions)
				this.$emit('dimensions', dimensions)
			},
			// 接收加载进度（APP端 renderjs 调用）
			onLoadProgress(progressInfo) {
				this.$emit('loadProgress', progressInfo)
			},
			// 非app端，场景初始化完毕
			async onload() {
				// 设置环境贴图
				const {
					backgroundVisible,
					env
				} = this.$props
				setEnv(env, backgroundVisible)
				this.loadModel()
				this.update()
			},
			// 加载模型
			async loadModel() {
				const {
					modelurl,
					scale,
					isFixFbxMaterial,
					modelType
				} = this.$props
				
				if (!modelurl) {
					console.warn('模型URL为空')
					this.$emit('error', { message: '模型URL为空' })
					return
				}
				
				try {
				const {
					group,
					loader,
					scene,
					controls
				} = getInstance()
					
					// 检查 controls 是否存在，避免在初始化时出错
					if (controls && typeof controls.reset === 'function') {
				controls.reset() // 重置视角
					}

				;
				[...group.children].forEach(c => { // 切换模型需要删除上一个模型
					c.removeFromParent()
					// group.remove(c)
				})

					console.log('开始加载模型:', { modelurl, modelType })
					
					// 检查 URL 是否有效
					if (!modelurl || (typeof modelurl === 'string' && modelurl.trim() === '')) {
						throw new Error('模型 URL 无效')
					}

				const result = await loader.load(modelurl, null, modelType)
					
					if (!result) {
						throw new Error('模型加载结果为空')
					}
					
					const ctorName = result?.constructor?.name || 'Unknown'
					const isBuffer = result?.isBufferGeometry ?? result?.geometry?.isBufferGeometry ?? false
					console.log('模型加载成功，结果类型:', ctorName, 'isBufferGeometry:', isBuffer)
					
					// STL 文件返回的是 Mesh，直接添加
					// 其他格式返回的是 scene 或对象
					if (modelType === 'stl') {
						// STL 文件已经由 loader.js 包装成 Mesh
						console.log('添加 STL Mesh 到场景')
						
						// 从 STL Mesh 的 geometry 计算尺寸（在添加到场景之前）
						if (result.geometry && result.geometry.isBufferGeometry) {
							const dimensions = calculateModelDimensions(result.geometry)
							if (dimensions) {
								console.log('从 STL 文件计算的模型尺寸:', dimensions)
								this.$emit('dimensions', dimensions)
							}
						}
						
						group.add(result)
					} else {
						const modelToAdd = result?.scene || result
						console.log('添加模型到场景，类型:', modelToAdd.constructor.name)
						group.add(modelToAdd)
					}
				isFixFbxMaterial && fixFbxMaterial(group)

					// centerAndScale 现在返回尺寸
					// STL 文件保持原始大小，不缩放；其他格式可以使用 scale
					const finalScale = (modelType === 'stl') ? 1 : scale
					const dimensions = centerAndScale(finalScale)
					if (dimensions) {
						// 如果 STL 已经计算过尺寸，这里不再重复发送
						// 但对于其他格式，这里会发送尺寸
						if (modelType !== 'stl') {
							this.$emit('dimensions', dimensions)
						}
					}

					console.log('模型加载成功')
				this.loaded()
				} catch (error) {
					console.error('模型加载失败:', error)
					this.$emit('error', { message: error.message || '模型加载失败', error })
				}
			},
			async play(animationName, needReverse = false, attr = {}) {
				// #ifndef APP
				const {
					group,
				} = getInstance()
				const [model] = [...group.children]
				await animation.play(model, animationName, needReverse, attr)
				// #endif

				// #ifdef APP
				this.playOptions = {
					animationName,
					needReverse,
					attr
				}

				this.$nextTick(() => {
					this.playOptions = {}
				})
				// #endif

			},
		},
		mounted() {
			// 
		}
	}
</script>


<style lang="scss" scoped>
	.w-full {
		width: 100%;
	}

	.h-full {
		height: 100%;
	}

	.relative {
		position: relative;
	}
</style>