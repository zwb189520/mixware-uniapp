<template>
	<view class="w-full h-full relative" @click="handleClick">
		<!-- #ifndef MP -->
		<div ref="container" class="w-full h-full">

		</div>
		<!-- #endif -->

		<!-- #ifdef MP -->
		<!-- 只有小程序需要这两个canvas，其他端通过js的方式创建canvas -->
		<canvas v-if="autoInit" class="w-full h-full" type="webgl" id="webgl" @touchstart="onTX" @touchmove="onTX"
			@touchend="onTX"></canvas>
		<canvas v-if="autoInit" id="helperCanvas" type="2d" class="fixed left-99999 opacity-0"></canvas>
		<!-- #endif -->
		<slot></slot>
	</view>


</template>

<script>
	import * as THREE from './lib'

	import {
		OrbitControls,
		Platform,
		$requestAnimationFrame,
		$cancelAnimationFrame,
		devicePixelRatio
	} from './lib'


	import {
		useThreeJs,
		events,
		animation
	} from './index.js'

	const {
		isInit,
		initThreeJs,
		getInstance,
		loopFuncs,
		useLoop,
		dispose,
	} = useThreeJs()

	let canvas, platform, frameId, disposing;

	export default {
		props: {
			autoInit: {
				type: Boolean, // 抖音小程序传入false在页面内初始化，而不是组件内
				default: true
			},
			disableRaycaster: { //是否禁用射线检测（模型点击）
				type: Boolean,
				default: true
			}
		},
		data() {
			return {
				container: null
			}
		},
		async mounted() {
			this.container = this.$refs.container
			if (!this.autoInit) return
			const c = await this.getCanvas()
			const h = await this.getCanvas('#helperCanvas')
			this.init(c, h)
		},
		beforeDestroy() {
			this.destroy()
		},
		methods: {
			async getCanvas(id = '#webgl') {
				return new Promise((resolve) => {
					// 组件中获取用proxy，外部获取用uni
					// #ifdef MP
					this.createSelectorQuery()
						.select(id)
						.node(v => v)
						.exec((res) => {
							const canvas = res && res.length ? res[0].node : null
							resolve(canvas)
						})
					// #endif
					// #ifdef APP-PLUS || H5
					resolve(document.querySelector(`${id} canvas`))
					// #endif

				})
			},
			destroy() {
				// 使用完毕后释放资源
				disposing = true
				$cancelAnimationFrame()(frameId)
				animation.dispose()
				events.removeEvents()
				dispose()
				// #ifndef APP
				THREE.PLATFORM && THREE.PLATFORM.dispose();
				// #endif
			},
			handleClick(evt) {
				if (this.disableRaycaster) {
					// 仅用了摄像检测
					return
				}
				if (!isInit.value) {
					console.log('等待初始化完毕')
					return;
				}
				events.onEvent(evt)
			},
			onTX(e) {
				this.$emit('touch', e)
				platform && platform.dispatchTouchEvent(e)
			},
			async init(c, helperCanvas) {
				let webglRender = 'WebGLRenderer';
				canvas = c
				// #ifdef MP
				webglRender = 'WebGL1Renderer'
				platform = new Platform(canvas)
				// #ifndef APP
				THREE.PLATFORM.set(platform);
				// #endif
				const {
					width,
					height
				} = canvas
				// #endif

				// #ifndef MP
				const {
					width,
					height
				} = this.container.getBoundingClientRect()
				// #endif
				const renderer = new THREE[webglRender]({
					// #ifdef MP
					canvas,
					// #endif
					preserveDrawingBuffer: true, // 设置 canvas 可toDataURL
					antialias: true,
					alpha: true,
					logarithmicDepthBuffer: true
				})


				renderer.toneMapping = THREE.ACESFilmicToneMapping;
				renderer.toneMappingExposure = 1
				// THREEJS 150左右就开始使用SRGBColorSpace了
				// #ifdef MP
				renderer.outputEncoding = THREE.sRGBEncoding
				// #endif
				// #ifndef MP
				renderer.outputEncoding = THREE.SRGBColorSpace
				// #endif
				renderer.setSize(width, height)
				// 限制像素比最大值，减少抗锯齿导致的线条模糊
				const pixelRatio = Math.min(devicePixelRatio || 1, 2)
				renderer.setPixelRatio(pixelRatio)
				// #ifndef MP
				this.container.appendChild(renderer.domElement)
				// #endif

				const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
				camera.position.z = 10
				const scene = new THREE.Scene()
				// 微信开发工具canvas层级显示有问题，真机没问题
				// scene.background = new THREE.Color('#f2f2f2')
				
				// 添加光源，解决模型显示为黑色的问题
				const ambientLight = new THREE.AmbientLight(0xffffff, 0.6) // 环境光，提供基础照明
				scene.add(ambientLight)
				
				const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8) // 方向光，提供主要照明
				directionalLight.position.set(5, 5, 5)
				scene.add(directionalLight)
				
				const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4) // 辅助方向光
				directionalLight2.position.set(-5, -5, -5)
				scene.add(directionalLight2)
				
				const clock = new THREE.Clock();
				const group = new THREE.Group()
				group.name = 'main-group'
				scene.add(group)
				// #ifdef MP
				const controls = new OrbitControls(camera, canvas);
				// #endif
				// #ifndef MP
				const controls = new OrbitControls(camera, renderer.domElement);
				// #endif

				// 设置旋转中心为正方体中心 (0, 0, 50)
				controls.target.set(0, 0, 50)
				camera.lookAt(controls.target)
				controls.update()
				
				controls.enablePan = false // 禁止平移摄像机
				controls.enableDamping = true //惯性
				controls.dampingFactor = 0.05 // 阻尼系数，控制惯性效果
				controls.enableRotate = true // 启用旋转
				controls.rotateSpeed = 1.0 // 旋转速度
				controls.enableZoom = true // 启用缩放
				controls.zoomSpeed = 1.0 // 缩放速度
				// 限制缩放范围（透视相机使用 minDistance 和 maxDistance）
				// 计算相机到目标点的初始距离（目标点是正方体中心）
				const initialDistance = camera.position.distanceTo(controls.target)
				controls.minDistance = initialDistance * 0.3 // 最小距离：初始距离的30%（可以放大到3.3倍）
				controls.maxDistance = initialDistance * 3.0 // 最大距离：初始距离的3倍（可以缩小到1/3）
				// 支持 XY、XZ、YZ 平面的完整旋转
				// 移除 polar angle 限制，允许完整的球面旋转（包括 XY 平面）
				controls.minPolarAngle = 0 // 允许垂直旋转到顶部（0度）
				controls.maxPolarAngle = Math.PI * 2 // 允许完整的垂直旋转（0 到 360 度），支持 XY 平面旋转
				controls.minAzimuthAngle = -Infinity // 允许水平无限旋转（支持 XY、XZ 平面）
				controls.maxAzimuthAngle = Infinity  // 允许水平无限旋转（支持 XY、XZ 平面）
				// 现在支持所有平面的完整旋转：XY、XZ、YZ
				controls.autoRotate = false;
				controls.autoRotateSpeed = 1.6

				initThreeJs({
					canvas,
					container:this.container, // canvas 父容器
					helperCanvas, // 用于截图等操作
					camera,
					scene,
					clock,
					group,
					renderer,
					controls,
				})

				this.$emit('onload')
			},
		}
	}
</script>


<style lang="scss">
	.w-full {
		width: 100%
	}

	.h-full {
		height: 100%;
	}

	.relative {
		position: relative;
	}

	.fixed {
		position: fixed;
	}

	.left-99999 {
		left: 99999;
	}

	.opacity-0 {
		opacity: 0;
	}
</style>