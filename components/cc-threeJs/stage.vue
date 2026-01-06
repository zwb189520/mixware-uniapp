<template>
	<view class="w-full h-full relative" @click="handleClick">
		<!-- #ifndef MP -->
		<!-- h5请使用div而不是view否则会被包装一层，无法直接获取到dom -->
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

<script setup>
	import {
		onMounted,
		onUnmounted,
		getCurrentInstance,
		ref
	} from 'vue'
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

	const props = defineProps({
		autoInit: {
			type: Boolean, // 抖音小程序传入false在页面内初始化，而不是组件内
			default: true
		},
		disableRaycaster: { //是否禁用射线检测（模型点击）
			type: Boolean,
			default: true
		},
		enablePan: { //是否启用平移（拖拽）
			type: Boolean,
			default: false
		}
	})

	const {
		proxy
	} = getCurrentInstance();
	const {
		isInit,
		initThreeJs,
		getInstance,
		loopFuncs,
		useLoop,
		dispose,
		setFps,
		setRenderFlag,
		setControlUpdateFlag,
		globalConfig
	} = useThreeJs()


	let canvas, platform;

	const emit = defineEmits(['onload', 'touch'])

	const container = ref(null)

	// 初始化 
	const getCanvas = async (id = '#webgl') => {
		return new Promise((resolve) => {
			// 组件中获取用proxy，外部获取用uni
			// #ifdef MP
			proxy.createSelectorQuery()
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
	}


	// const initLight = (scene) => {
	// 	scene.add(new THREE.AmbientLight(0xffffff, 0.2)) // 强度大于1会导致模型没有轮廓
	// 	const directLight = new THREE.DirectionalLight(0xffffff, 0.5)
	// 	scene.add(directLight)
	// 	const hemiLight = new THREE.HemisphereLight(0x111122, 0x443333);
	// 	scene.add(hemiLight);
	// }

	const destroy = () => {
		// 使用完毕后释放资源
		animation.dispose()
		events.removeEvents()
		dispose()
		// #ifndef APP
		THREE.PLATFORM && THREE.PLATFORM.dispose();
		// #endif
	}

	const init = async (c, helperCanvas) => {
		let webglRender = 'WebGLRenderer';
		canvas = c
		// #ifdef MP
		webglRender = 'WebGL1Renderer'
		platform = new Platform(canvas)
		THREE.PLATFORM.set(platform);
		const {
			width,
			height
		} = canvas
		// #endif

		// #ifndef MP
		const {
			width,
			height
		} = container.value.getBoundingClientRect()
		// #endif
		const renderer = new THREE[webglRender]({
			// #ifdef MP
			canvas,
			// #endif
			preserveDrawingBuffer: true, // 设置 canvas 可toDataURL
			antialias: true,
			alpha: true,
			// logarithmicDepthBuffer: true, // 会导致MeshRefractionMaterial在多个模型的时候渲染出现问题
		})


		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1
		// THREEJS 150左右就开始使用SRGBColorSpace了
		// #ifdef MP
		renderer.outputEncoding = THREE.sRGBEncoding
		// #endif
		// #ifndef MP
		// renderer.outputEncoding = THREE.SRGBColorSpace
		renderer.outputColorSpace = THREE.SRGBColorSpace
		// #endif
		renderer.setSize(width, height)
		// 限制像素比最大值，减少抗锯齿导致的线条模糊
		const pixelRatio = Math.min(devicePixelRatio || 1, 2)
		renderer.setPixelRatio(pixelRatio)
		// #ifndef MP
		container.value.appendChild(renderer.domElement)
		// #endif

		const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
		camera.position.z = 50 // Z轴位置设置为50
		camera.position.y = -220 // Y轴位置设置为-220
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

		// 地面网格辅助（已取消，只保留蓝色平台的网格）
		// const gridHelper = new THREE.GridHelper(200, 20, 0x888888, 0xcccccc)
		// gridHelper.position.y = 0
		// scene.add(gridHelper)

		// XYZ 平面网格辅助（已取消，只保留蓝色平台的网格）
		// const gridHelperXY = new THREE.GridHelper(200, 20, 0x5555ff, 0xaaaaff) // XY 平面（z=0）
		// gridHelperXY.rotation.x = Math.PI / 2
		// scene.add(gridHelperXY)

		// const gridHelperYZ = new THREE.GridHelper(200, 20, 0xff5555, 0xffaaaa) // YZ 平面（x=0）
		// gridHelperYZ.rotation.z = Math.PI / 2
		// scene.add(gridHelperYZ)

		// XYZ 轴辅助（已取消）
		// const axesHelper = new THREE.AxesHelper(100)
		// scene.add(axesHelper)

		// XYZ 方向箭头辅助（已取消）
		// const arrowLen = 120
		// const arrowHead = 12
		// const arrowWidth = 6
		// const arrowX = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), arrowLen, 0xff0000, arrowHead, arrowWidth)
		// const arrowY = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), arrowLen, 0x00ff00, arrowHead, arrowWidth)
		// const arrowZ = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), arrowLen, 0x0000ff, arrowHead, arrowWidth)
		// scene.add(arrowX)
		// scene.add(arrowY)
		// scene.add(arrowZ)
		
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

		controls.enablePan = props.enablePan // 根据props控制平移
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
		// 允许水平无限旋转（支持 XY、XZ 平面）
		controls.minAzimuthAngle = -Infinity
		controls.maxAzimuthAngle = Infinity
		// 现在支持所有平面的完整旋转：XY、XZ、YZ
		controls.autoRotate = false;
		controls.autoRotateSpeed = 1.6

		initThreeJs({
			canvas,
			container: container.value, // canvas 父容器
			helperCanvas, // 用于截图等操作
			camera,
			scene,
			clock,
			group,
			renderer,
			controls,
		})


		emit('onload')
	}

	onMounted(async () => {
		if (!props.autoInit) return

		const c = await getCanvas()
		const h = await getCanvas('#helperCanvas')
		init(c, h)
	})

	const handleClick = (evt) => {
		if (props.disableRaycaster) {
			console.log('禁用了射线检测')
			return
		}
		if (!isInit.value) {
			console.log('等待初始化完毕')
			return;
		}
		events.onEvent(evt)
	}

	onUnmounted(() => {
		destroy()
	})


	// 手势相关
	const onTX = (e) => {
		emit('touch', e)
		platform && platform.dispatchTouchEvent(e)
	}

	defineExpose({
		destroy,
		init,
		onTX
	})
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