import * as THREE from '../lib'
// import * as THREE from 'three-platformize'
import {
	screenshot as shot
} from 'three-platformize/tools/screenshot'
import {
	initLoader
} from './loader.js'

import {
	useTween
} from './useTween'
import {
	$requestAnimationFrame,
	$cancelAnimationFrame
} from '../lib.js'

import {
	animation
} from './animation.js'

import {
	events
} from './event.js'

const getVersion = () => parseInt(THREE.REVISION.replace(/\D+/g, ''));
export const version = getVersion();

const {
	Easing,
	exec: execTween
} = useTween()

const isInit = {
	value: false
}
// 配置相关
const defaultFps = 60
const defaultConfig = {
	controlUpdateFlag: true, // 是否更新控制器
	renderFlag: true, // 是否渲染
	timeStamp: 0, // 上一次渲染的时间戳
	singleFrameTime: 1 / defaultFps, // 单帧时间
	fps: defaultFps, // 这里的fps是理想中的帧率，并不是实际渲染的帧率
	rendererEnabled: true, // 是否执行renderer.render方法
}
const globalConfig = {}

// 设置渲染帧率
const setFps = (fps = defaultFps) => {
	globalConfig.fps = fps
	globalConfig.singleFrameTime = 1 / fps
}

// 是否更新控制器
const setControlUpdateFlag = (flag = true) => {
	globalConfig.controlUpdateFlag = flag
}
// 是否渲染
const setRenderFlag = (flag = true) => {
	globalConfig.renderFlag = flag
}

// 是否执行renderer.render方法
const setRendererEnabled = (flag = true) => {
	globalConfig.rendererEnabled = flag
}


// 实例
const instance = {
	canvas: null, // 渲染模型的canvas
	helperCanvas: null, // 用于截图的canvas
	camera: null,
	scene: null,
	clock: null,
	group: null,
	renderer: null,
	controls: null,
	loader: null
}

const loopFuncs = []
let uid = 1;

const useLoop = (cb = () => {}) => {
	const funcId = ++uid;
	const stop = () => {
		loopFuncs.splice(
			loopFuncs.findIndex((item) => item.id === funcId),
			1
		)
	}
	loopFuncs.push({
		id: funcId,
		cb
	})

	return {
		loopFuncs,
		funcId,
		stop,
	}
}

const getInstance = () => {
	return {
		...instance
	}
}


// 开始渲染
let frameId;
const startRender = () => {
	const {
		controls,
		renderer,
		scene,
		camera,
		clock
	} = getInstance()


	const render = (t) => {
		controls.enabled = globalConfig.controlUpdateFlag
		controls.update()
		if (globalConfig.rendererEnabled) {
			renderer.render(scene, camera);
		}

	}
	const animate = () => {
		frameId = $requestAnimationFrame()(animate)
		const t = clock.getDelta()
		if (!isInit.value) {
			// 销毁了
			return
		}
		if (!globalConfig.renderFlag) {
			// 暂停渲染
			return
		}
		globalConfig.timeStamp += t
		if (globalConfig.timeStamp < globalConfig.singleFrameTime) {
			// 根据设置的帧率来渲染
			return
		}

		render(t)
		animation.update(t)
		loopFuncs.forEach(item => {
			item.cb && item.cb(t)
		})

		globalConfig.timeStamp = globalConfig.timeStamp % globalConfig.singleFrameTime

	}
	animate()
}


const initThreeJs = (inst = {}) => {
	Object.assign(instance, inst)
	instance.loader = initLoader()
	isInit.value = true
	// 重置配置
	Object.assign(globalConfig, defaultConfig)

	// 设置event.js中的参数
	const {
		camera
	} = getInstance()
	const rect = getContainerSize()
	events.setOptions({
		camera,
		rect
	})

	startRender()
}

let bboxHelper = null
let faceLabels = []
let centerPlatform = null
let centerPlatformEdges = null
let centerPlatformGrid = null
let xyGridHelper = null
let platformCube = null
let platformCubeEdges = null
let platformCubeGrid = null
let platformCubeLogo = null

// 从 Geometry 或 Mesh 计算模型尺寸
const calculateModelDimensions = (geometryOrMesh) => {
	let geometry = geometryOrMesh
	
	// 如果是 Mesh，获取其 geometry
	if (geometryOrMesh.isMesh) {
		geometry = geometryOrMesh.geometry
	}
	
	// 如果不是 Geometry，返回 null
	if (!geometry || !geometry.isBufferGeometry) {
		console.warn('calculateModelDimensions: 无效的 Geometry 对象')
		return null
	}
	
	// 计算包围盒
	geometry.computeBoundingBox()
	const box = geometry.boundingBox
	
	if (!box) {
		console.warn('calculateModelDimensions: 无法计算包围盒')
		return null
	}
	
	// 获取尺寸
	const size = new THREE.Vector3()
	box.getSize(size)
	
	const dimensions = {
		x: Math.abs(size.x), // 宽度（X 轴方向）
		y: Math.abs(size.y), // 高度（Y 轴方向）
		z: Math.abs(size.z)  // 深度（Z 轴方向）
	}
	
	console.log('从模型计算的尺寸:', dimensions)
	return dimensions
}

// 居中并对齐底部到网格，同时处理缩放和边界限制
const centerAndScale = (scaleRatio = 1) => {
	const {
		group,
		camera,
		scene,
		controls
	} = getInstance()

	// 1. 重置变换以便重新计算
	group.position.set(0, 0, 0)
	group.scale.set(1, 1, 1)
	group.updateMatrixWorld(true)

	// 2. 计算原始包围盒
	const boundingBox = new THREE.Box3().setFromObject(group);
	const size = new THREE.Vector3()
	boundingBox.getSize(size)
	
	// 3. 自动适配逻辑：如果模型尺寸超过 100mm，强制缩小到 100mm 范围内
	let autoScale = 1.0
	const maxDim = Math.max(size.x, size.y, size.z)
	if (maxDim > 100) {
		autoScale = 100 / maxDim
	}
	
	// 4. 应用最终缩放 (用户缩放 * 自动适配缩放)
	const finalScale = scaleRatio * autoScale
	group.scale.set(finalScale, finalScale, finalScale)
	group.updateMatrixWorld(true)

	// 5. 重新计算缩放后的包围盒和中心位置
	const scaledBox = new THREE.Box3().setFromObject(group)
	const scaledSize = new THREE.Vector3()
	const scaledCenter = new THREE.Vector3()
	scaledBox.getSize(scaledSize)
	scaledBox.getCenter(scaledCenter)

	// 6. 核心对齐逻辑：
	// X, Y 居中 (0, 0)
	// Z 轴底部对齐网格 (Z=0)
	group.position.x = -scaledCenter.x
	group.position.y = -scaledCenter.y
	group.position.z = -scaledCenter.z + (scaledSize.z / 2)

	// 7. 更新观察中心：盯着正方体中心 (0, 0, 50)
	if (controls) {
		controls.target.set(0, 0, 50)
		camera.lookAt(controls.target)
		controls.update()
	}

	// 8. 检测是否超过边界（100mm限制）
	const isOutOfBounds = scaledSize.x > 100 || scaledSize.y > 100 || scaledSize.z > 100
	const bboxColor = isOutOfBounds ? 0xff0000 : 0x00aaff // 超过边界变红，否则蓝色

	// 9. 立即更新辅助框显示（反映当前模型尺寸）
	if (bboxHelper) {
		scene.remove(bboxHelper)
		if (bboxHelper.material) {
			bboxHelper.material.dispose()
		}
		bboxHelper = null
	}
	// 确保模型变换矩阵已更新
	group.updateMatrixWorld(true)
	const finalScaledBox = new THREE.Box3().setFromObject(group)
	bboxHelper = new THREE.Box3Helper(finalScaledBox, bboxColor)
	if (bboxHelper.material) {
		// 启用深度测试，确保辅助框不会透过模型
		bboxHelper.material.depthTest = true
		bboxHelper.material.depthWrite = false
		bboxHelper.material.transparent = true
		bboxHelper.material.opacity = 0.8
	}
	bboxHelper.renderOrder = 999
	scene.add(bboxHelper)
	
	// 10. 绘制 100mm³ 的平台容器（logo只创建一次）
	const raf = typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame : (fn) => setTimeout(fn, 16)
	raf(() => {
		// 在 0,0,0 位置创建 100x100x100 的透明容器
		createPlatformCube(scene, new THREE.Box3(
			new THREE.Vector3(-50, -50, 0),
			new THREE.Vector3(50, 50, 100)
		))
	})
	
	// 返回真实尺寸
	return {
		x: Math.abs(scaledSize.x),
		y: Math.abs(scaledSize.y),
		z: Math.abs(scaledSize.z)
	}
}

// 创建中心平台（100mm×100mm，以(0,0,0)为中心，XZ平面）（已取消）
const createCenterPlatform = (scene) => {
	// 移除旧的平台（如果存在）
	if (centerPlatform) {
		scene.remove(centerPlatform)
		if (centerPlatform.geometry) centerPlatform.geometry.dispose()
		if (centerPlatform.material) centerPlatform.material.dispose()
		centerPlatform = null
	}
	if (centerPlatformEdges) {
		scene.remove(centerPlatformEdges)
		if (centerPlatformEdges.geometry) centerPlatformEdges.geometry.dispose()
		if (centerPlatformEdges.material) centerPlatformEdges.material.dispose()
		centerPlatformEdges = null
	}
	if (centerPlatformGrid) {
		scene.remove(centerPlatformGrid)
		centerPlatformGrid = null
	}
	
	// 创建100mm×100mm的平台（Three.js中1单位=1mm）
	// 以X、Y轴作为平台平面（XZ平面，水平放置），以(0,0,0)为中心
	// 在3D打印中，平台通常是水平的，X轴左右，Y轴前后，Z轴上下
	const platformSize = 100
	const platformGeometry = new THREE.PlaneGeometry(platformSize, platformSize)
	
	// 创建更明显的材质 - 增加不透明度和更鲜明的颜色
	const platformMaterial = new THREE.MeshBasicMaterial({
		color: 0x4a90e2, // 更鲜明的蓝色
		opacity: 0.7, // 增加不透明度从0.3到0.7
		transparent: true,
		side: THREE.DoubleSide,
		wireframe: false,
		depthTest: true,
		depthWrite: false // 禁用深度写入，避免遮挡其他物体
	})
	
	const platform = new THREE.Mesh(platformGeometry, platformMaterial)
	
	// 将平台放在XZ平面（水平面，PlaneGeometry默认就在XZ平面）
	// X轴左右，Y轴前后（在平台上），Z轴上下
	platform.rotation.x = 0 // 保持默认的XZ平面（水平面）
	platform.position.set(0, 0, 0) // 以(0,0,0)为中心
	platform.renderOrder = -1 // 设置低渲染顺序，确保平台先渲染
	
	// 添加更明显的边框线框
	const edges = new THREE.EdgesGeometry(platformGeometry)
	const edgesMaterial = new THREE.LineBasicMaterial({ 
		color: 0x2c5aa0, // 更深的蓝色边框
		depthTest: false, // 禁用深度测试，确保线条始终可见
		depthWrite: false,
		linewidth: 4, // 增加线宽，减少抗锯齿导致的模糊（某些平台可能不支持）
		vertexColors: false,
		fog: false, // 禁用雾效，确保线条清晰
		side: THREE.DoubleSide // 双面渲染，确保线条始终可见
	})
	const edgesLine = new THREE.LineSegments(edges, edgesMaterial)
	edgesLine.rotation.x = 0 // 保持在XZ平面
	edgesLine.position.set(0, 0.1, 0) // 稍微沿Y轴偏移一点避免z-fighting
	edgesLine.renderOrder = 999 // 设置高渲染顺序，确保线条最后渲染
	
	// 将平台和边框添加到场景
	scene.add(platform)
	scene.add(edgesLine)
	
	// 添加网格线增强视觉效果（已取消）
	// const platformGridHelper = new THREE.GridHelper(platformSize, 10, 0xffffff, 0x888888)
	// platformGridHelper.rotation.x = 0 // 保持在XZ平面（GridHelper默认也在XZ平面）
	// platformGridHelper.position.set(0, 0.05, 0) // 稍微沿Y轴偏移一点，确保在平台上方
	// // 设置网格线始终可见
	// if (platformGridHelper.material) {
	// 	platformGridHelper.material.depthTest = false
	// 	platformGridHelper.material.depthWrite = false
	// 	platformGridHelper.material.opacity = 1.0 // 完全不透明
	// 	platformGridHelper.material.transparent = false
	// }
	// platformGridHelper.renderOrder = 997 // 设置高渲染顺序
	// scene.add(platformGridHelper)
	
	// 在XY平面创建100mm×100mm的网格，以(0,0,0)为中心
	// 移除旧的XY网格（如果存在）
	if (xyGridHelper) {
		scene.remove(xyGridHelper)
		xyGridHelper = null
	}
	const xyGridSize = 100
	// 使用更明显的颜色对比：主网格线白色，次网格线深灰色
	xyGridHelper = new THREE.GridHelper(xyGridSize, 10, 0xffffff, 0x555555)
	xyGridHelper.rotation.x = -Math.PI / 2 // 绕X轴旋转-90度，使网格显示在XY平面
	xyGridHelper.position.set(0, 0, 0) // 以(0,0,0)为中心
	// 设置网格线始终可见
	if (xyGridHelper.material) {
		xyGridHelper.material.depthTest = false
		xyGridHelper.material.depthWrite = false
		xyGridHelper.material.opacity = 1.0 // 完全不透明
		xyGridHelper.material.transparent = false
		xyGridHelper.material.fog = false // 禁用雾效，确保线条清晰
		// 尝试增加线宽（如果材质支持），减少抗锯齿导致的模糊
		if (xyGridHelper.material.linewidth !== undefined) {
			xyGridHelper.material.linewidth = 3
		}
	}
	xyGridHelper.renderOrder = 997 // 设置高渲染顺序
	scene.add(xyGridHelper)
	
	// 保存引用以便后续清理
	centerPlatform = platform
	centerPlatformEdges = edgesLine
	centerPlatformGrid = null
	
	console.log(`Created center platform at (0,0,0) on XZ plane (horizontal), size=${platformSize}mm×${platformSize}mm`)
}

// 在平台上创建100mm×100mm×100mm的正方体
const createPlatformCube = (scene, boundingBox = null) => {
	// 移除旧的正方体（如果存在）
	if (platformCube) {
		scene.remove(platformCube)
		if (platformCube.geometry) platformCube.geometry.dispose()
		if (platformCube.material) platformCube.material.dispose()
		platformCube = null
	}
	if (platformCubeEdges) {
		scene.remove(platformCubeEdges)
		if (platformCubeEdges.geometry) platformCubeEdges.geometry.dispose()
		if (platformCubeEdges.material) platformCubeEdges.material.dispose()
		platformCubeEdges = null
	}
	if (platformCubeGrid) {
		scene.remove(platformCubeGrid)
		platformCubeGrid = null
	}
	// Logo只创建一次，不重复创建和删除，避免透明度叠加bug
	// if (platformCubeLogo) {
	// 	scene.remove(platformCubeLogo)
	// 	if (platformCubeLogo.geometry) platformCubeLogo.geometry.dispose()
	// 	if (platformCubeLogo.material) {
	// 		if (platformCubeLogo.material.map) {
	// 			platformCubeLogo.material.map.dispose()
	// 		}
	// 		platformCubeLogo.material.dispose()
	// 	}
	// 	platformCubeLogo = null
	// }
	// 如果logo已存在，只更新平台立方体部分，不删除logo
	if (platformCubeLogo) {
		// Logo已存在，只更新平台立方体的边线和网格部分
		const logoRef = platformCubeLogo
		
		// 创建平台立方体
		const cubeSize = 100
		const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)
		const cubeMaterial = new THREE.MeshBasicMaterial({
			color: 0x000000,
			transparent: true,
			opacity: 0,
			visible: false
		})
		const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
		cube.position.set(0, 0, 50)
		cube.renderOrder = 0
		cube.visible = false
		
		const edges = new THREE.EdgesGeometry(cubeGeometry)
		const edgesMaterial = new THREE.LineBasicMaterial({ 
			color: 0x000000,
			depthTest: true,
			depthWrite: true,
			linewidth: 2,
			vertexColors: false,
			fog: false,
			side: THREE.DoubleSide
		})
		const edgesLine = new THREE.LineSegments(edges, edgesMaterial)
		edgesLine.position.copy(cube.position)
		edgesLine.renderOrder = 0
		scene.add(edgesLine)
		
		const gridSize = 100
		const gridDivisions = 10
		platformCubeGrid = new THREE.GridHelper(gridSize, gridDivisions, 0x888888, 0x444444)
		platformCubeGrid.rotation.x = -Math.PI / 2
		platformCubeGrid.position.set(0, 0, 0)
		if (platformCubeGrid.material) {
			platformCubeGrid.material.depthTest = true
			platformCubeGrid.material.depthWrite = true
			platformCubeGrid.material.opacity = 1.0
			platformCubeGrid.material.transparent = false
			platformCubeGrid.material.fog = false
			if (platformCubeGrid.material.linewidth !== undefined) {
				platformCubeGrid.material.linewidth = 1
			}
		}
		platformCubeGrid.renderOrder = 0
		scene.add(platformCubeGrid)
		
		platformCube = cube
		platformCubeEdges = edgesLine
		platformCubeLogo = logoRef // 恢复logo引用
		
		console.log('Platform cube updated, logo preserved')
		return
	}
	
	// 创建100mm×100mm×100mm的正方体
	const cubeSize = 100
	const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)
	
	// 创建材质 - 立方体完全透明，只显示边框线
	const cubeMaterial = new THREE.MeshBasicMaterial({
		color: 0x000000,
		transparent: true,
		opacity: 0, // 完全透明，不显示立方体本身
		visible: false // 不可见
	})
	
	const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
	
	// 正方体中心固定在原点，Z轴上移5格（50个单位）
	cube.position.set(0, 0, 50)
	cube.renderOrder = 0 // 设置渲染顺序
	cube.visible = false // 立方体不可见，只显示边框
	
	// 添加黑色边框线框（只显示12条边，不显示面的对角线）
	const edges = new THREE.EdgesGeometry(cubeGeometry)
	const edgesMaterial = new THREE.LineBasicMaterial({ 
		color: 0x000000, // 黑色边框
		depthTest: true, // 启用深度测试，边框会被模型遮挡
		depthWrite: true, // 启用深度写入
		linewidth: 2, // 线条宽度
		vertexColors: false,
		fog: false, // 禁用雾效，确保线条清晰
		side: THREE.DoubleSide // 双面渲染，确保线条始终可见
	})
	const edgesLine = new THREE.LineSegments(edges, edgesMaterial)
	edgesLine.position.copy(cube.position)
	edgesLine.renderOrder = 0 // 设置正常渲染顺序，确保边框能被模型遮挡
	
	// 添加到场景（只添加边框线，立方体本身不显示）
	// scene.add(cube) // 不添加到场景，因为完全透明且不可见
	scene.add(edgesLine)
	
	// 在正方体底部添加100mm×100mm的网格（XY平面，z=0）
	const gridSize = 100
	const gridDivisions = 10 // 分割成10格，每格10mm
	platformCubeGrid = new THREE.GridHelper(gridSize, gridDivisions, 0x888888, 0x444444)
	// GridHelper 默认在 XZ 平面，需要绕 X 轴旋转 -90 度到 XY 平面
	platformCubeGrid.rotation.x = -Math.PI / 2
	platformCubeGrid.position.set(0, 0, 0) // 正方体底部在 z=0
	// 设置网格线深度测试，使其能被模型正确遮挡
	if (platformCubeGrid.material) {
		platformCubeGrid.material.depthTest = true // 启用深度测试，网格会被模型遮挡
		platformCubeGrid.material.depthWrite = true // 启用深度写入
		platformCubeGrid.material.opacity = 1.0
		platformCubeGrid.material.transparent = false
		platformCubeGrid.material.fog = false
		// 设置线宽（如果材质支持）
		if (platformCubeGrid.material.linewidth !== undefined) {
			platformCubeGrid.material.linewidth = 1
		}
	}
	platformCubeGrid.renderOrder = 0 // 设置正常渲染顺序，确保网格在模型下方时被遮挡
	scene.add(platformCubeGrid)
	
	// 在正方体底部（z=0）添加 logo 纹理
	const logoSize = 50 // logo 尺寸（调小）
	const logoGeometry = new THREE.PlaneGeometry(logoSize, logoSize)
	
	// 创建 logo 平面的函数（确保只创建一次，避免透明度叠加）
	const createLogoPlane = (texture) => {
		// 如果logo已存在，先移除旧的（确保只创建一个）
		if (platformCubeLogo) {
			scene.remove(platformCubeLogo)
			if (platformCubeLogo.geometry) platformCubeLogo.geometry.dispose()
			if (platformCubeLogo.material) {
				if (platformCubeLogo.material.map) {
					platformCubeLogo.material.map.dispose()
				}
				platformCubeLogo.material.dispose()
			}
			platformCubeLogo = null
		}
		
		texture.flipY = false // 翻转 Y 轴，确保图片方向正确
		texture.minFilter = THREE.LinearFilter
		texture.magFilter = THREE.LinearFilter
		
		const logoMaterial = new THREE.MeshBasicMaterial({
			map: texture,
			transparent: true,
			opacity: 0.1, // 设置透明度为 0.1（10% 不透明），固定值，不会叠加
			side: THREE.DoubleSide,
			depthTest: true,
			depthWrite: true
		})
		
		const logoPlane = new THREE.Mesh(logoGeometry, logoMaterial)
		// PlaneGeometry 默认在 XZ 平面（水平面），保持默认即可，logo 朝上
		// logoPlane.rotation.z = 0 // 不需要旋转，保持在 XZ 平面
		// 位置在正方体底部下方
		logoPlane.position.set(0, 0, -0.5) // x=0（中心），y=0（中心），z=-0.5（正方体底部下方）
		logoPlane.renderOrder = 2 // 设置较高的渲染顺序，确保 logo 在模型之后渲染，避免被穿透
		
		scene.add(logoPlane)
		platformCubeLogo = logoPlane
		
		console.log('Logo loaded and added at position (0, 0, -0.5) on XZ plane (horizontal) at cube bottom')
	}
	
	// 使用 TextureLoader 加载 logo
	const textureLoader = new THREE.TextureLoader()
	
	// 默认 logo 路径
	let logoPath = '/static/img/logo.png'
	
	// 如果是 H5 环境且路径是相对路径，尝试构建完整 URL
	if (typeof window !== 'undefined' && window.location && !logoPath.startsWith('http')) {
		// 如果路径以 / 开头，直接使用
		if (logoPath.startsWith('/')) {
			const baseUrl = window.location.origin
			logoPath = baseUrl + logoPath
	} else {
			// 相对路径，需要构建完整 URL
			const baseUrl = window.location.origin
			const pathname = window.location.pathname
			const basePath = pathname.substring(0, pathname.lastIndexOf('/'))
			logoPath = baseUrl + basePath + '/' + logoPath
		}
		console.log('H5 environment detected, using full path:', logoPath)
	}
	
	textureLoader.load(
		logoPath,
		(texture) => {
			// 纹理加载成功
			console.log('Logo texture loaded successfully from:', logoPath)
			createLogoPlane(texture)
		},
		(progress) => {
			// 加载进度（可选）
			if (progress && progress.total && progress.total > 0) {
				const percent = (progress.loaded / progress.total) * 100
				console.log('Logo loading progress:', percent.toFixed(2) + '%')
			}
		},
		(error) => {
			// 加载失败，尝试备用路径
			console.warn('Failed to load logo from primary path:', logoPath)
			console.warn('Error:', error)
			
			// 尝试备用路径
			const fallbackPaths = [
				'/static/img/logo.png',
				'./static/img/logo.png',
				'static/img/logo.png'
			]
			
			let fallbackIndex = 0
			const tryFallback = () => {
				if (fallbackIndex >= fallbackPaths.length) {
					console.error('All logo paths failed. Please check if logo.png exists at /static/img/logo.png')
					return
				}
				
				const fallbackPath = fallbackPaths[fallbackIndex]
				console.log('Trying fallback path:', fallbackPath)
				
				textureLoader.load(
					fallbackPath,
					(texture) => {
						console.log('Logo loaded from fallback path:', fallbackPath)
						createLogoPlane(texture)
					},
					undefined,
					(err) => {
						console.warn('Fallback path failed:', fallbackPath, err)
						fallbackIndex++
						tryFallback()
					}
				)
			}
			
			tryFallback()
		}
	)
	
	// 保存引用以便后续清理
	platformCube = cube
	platformCubeEdges = edgesLine
	
	console.log(`Created 100mm×100mm×100mm cube at position:`, cube.position)
}

const updateFaceLabels = (box, scene) => {
	// 仅在可用 DOM/canvas 环境下绘制标签（避免小程序无 document 报错）
	if (typeof document === 'undefined') return
	clearFaceLabels(scene)

	const min = box.min.clone()
	const max = box.max.clone()
	const offset = 15

	const midX = (min.x + max.x) / 2
	const midY = (min.y + max.y) / 2
	const midZ = (min.z + max.z) / 2

	const faces = [
		{ text: 'Mixware +Z', pos: new THREE.Vector3(midX, midY, max.z + offset) },
		{ text: 'Mixware -Z', pos: new THREE.Vector3(midX, midY, min.z - offset) },
		{ text: 'Mixware +X', pos: new THREE.Vector3(max.x + offset, midY, midZ) },
		{ text: 'Mixware -X', pos: new THREE.Vector3(min.x - offset, midY, midZ) },
		{ text: 'Mixware +Y', pos: new THREE.Vector3(midX, max.y + offset, midZ) },
		{ text: 'Mixware -Y', pos: new THREE.Vector3(midX, min.y - offset, midZ) },
	]

	faceLabels = faces.map(face => {
		const sprite = createLabelSprite(face.text)
		sprite.position.copy(face.pos)
		scene.add(sprite)
		return sprite
	})
	}

const clearFaceLabels = (scene) => {
	if (faceLabels && faceLabels.length) {
		faceLabels.forEach(s => scene.remove(s))
	}
	faceLabels = []
}

const createLabelSprite = (text) => {
	const canvas = document.createElement('canvas')
	const ctx = canvas.getContext('2d')
	const padding = 8
	ctx.font = 'bold 28px Arial'
	const textWidth = ctx.measureText(text).width
	canvas.width = textWidth + padding * 2
	canvas.height = 48
	// 透明背景，仅文字（加描边提可读性）
	ctx.textBaseline = 'middle'
	ctx.fillStyle = '#000000'
	ctx.strokeStyle = 'rgba(255,255,255,0.6)'
	ctx.lineWidth = 3
	ctx.strokeText(text, padding, canvas.height / 2)
	ctx.fillText(text, padding, canvas.height / 2)

	const texture = new THREE.CanvasTexture(canvas)
	texture.needsUpdate = true
	const material = new THREE.SpriteMaterial({ map: texture, depthTest: true, depthWrite: true, transparent: true, sizeAttenuation: false })
	const sprite = new THREE.Sprite(material)
	const scaleFactor = 0.5
	sprite.scale.set(canvas.width * scaleFactor, canvas.height * scaleFactor, 1)
	return sprite
}


export const traverse = (g, cb = () => {}) => {
	if (!g?.isScene) {
		cb(g)
	}

	if (g.children && g.children.length) {
	
		g.children.forEach(c => {
			
			traverse(c, cb)
		})
	}
}

// 小程序texture不是2的n次方也会导致无法正常显示材质
const fixFbxMaterial = (group, materialType = 'MeshStandardMaterial') => {
	traverse(group, (c) => {
		if (c.isMesh) {
			const m = c.material;
			let material = new THREE[materialType]({});
			if (Array.isArray(m)) {
				material = m.map(item => {
					const tempMaterial = new THREE[materialType]({});
					tempMaterial.copy(item);
					return tempMaterial
				})
			} else {
				material.copy(m);
			}

			c.material = material;
		}
	});
}

const disposeFuncs = []
let disposeUid = 1;
const useDispose = (cb) => {
	const funcId = ++disposeUid;
	const remove = () => {
		disposeFuncs.splice(
			disposeFuncs.findIndex((item) => item.id === funcId),
			1
		)
	}
	disposeFuncs.push({
		id: funcId,
		cb,
	})

	return {
		disposeFuncs,
		funcId,
		remove
	}
}
const dispose = () => {
	if (!isInit.value) {
		console.log('未初始化无需销毁场景')
		return
	}

	try {
		disposeFuncs.forEach(item => {
			item.cb && item.cb()
		})
	} catch (error) {
		//TODO handle the exception
		console.log('disposeFuncs error:', error)
	}
	disposeFuncs.length = 0


	const {
		scene,
		renderer
	} = instance;
	isInit.value = false;
	loopFuncs.length = 0;
	$cancelAnimationFrame()(frameId)

	try {
		traverse(scene, (c) => {
			if (c.isMesh) {
				c.geometry.dispose();
				if (Array.isArray(c.material)) {
					c.material.forEach(m => {
						m.dispose()
					})
				} else {
					c.material.dispose();
				}
			}
			if (c.isTexture) {
				c.dispose();
			}
		})
		traverse(scene, (c) => {
			if (c.parent) {
				c.parent.remove(c);
			}
		})
		for (let i = scene.children.length - 1; i >= 0; i--) {
			scene.remove(scene.children[i]);
		}
		scene.clear();
		renderer.dispose();
		renderer.forceContextLoss();
		renderer.content = null;

		clearFaceLabels(scene)
		
		// 清理XY平面网格
		if (xyGridHelper) {
			scene.remove(xyGridHelper)
			xyGridHelper = null
		}
		
		// 清理正方体底部网格
		if (platformCubeGrid) {
			scene.remove(platformCubeGrid)
			platformCubeGrid = null
		}
		if (platformCubeLogo) {
			scene.remove(platformCubeLogo)
			if (platformCubeLogo.geometry) platformCubeLogo.geometry.dispose()
			if (platformCubeLogo.material) {
				if (platformCubeLogo.material.map) {
					platformCubeLogo.material.map.dispose()
				}
				platformCubeLogo.material.dispose()
			}
			platformCubeLogo = null
		}

		for (const key in instance) {
			instance[key] = null
		}

		console.log('场景销毁')


	} catch (error) {
		//TODO handle the exception
		console.log('dispose error:', error)
	}

}


// 设置环境贴图，传入在线地址即可
function getFileExtension(url) {
	// 找到最后一个点的位置
	const lastDotIndex = url.lastIndexOf('.');
	// 如果没有点，说明没有后缀，返回空字符串
	if (lastDotIndex === -1) {
		return '';
	}
	// 截取从最后一个点到字符串末尾的部分
	const extension = url.substring(lastDotIndex + 1);
	return extension;
}
const setEnv = async (url, isSetBg = true, UrlExt = '') => {
	const {
		scene,
		loader
	} = getInstance()

	return new Promise((resolve, reject) => {
		const ext = UrlExt || getFileExtension(url)
		if (ext === 'hdr') {
			loader.load(url, (texture) => {
				texture.mapping = THREE.EquirectangularReflectionMapping;
				scene.environment = texture
				if (isSetBg) scene.background = texture
				resolve(texture)
			}, 'hdr')
		} else {
			// 图片格式走这里
			loader.load(url, texture => {
				texture.minFilter = THREE.LinearFilter
				texture.mapping = THREE.EquirectangularReflectionMapping;
				scene.environment = texture
				if (isSetBg) scene.background = texture
				resolve(texture)
			}, 'texture')

		}
	})
}

// 截图,MP专用
// 使用方法
// const tempPath = await screenshot()
// uni.saveImageToPhotosAlbum({
// 	filePath:tempPath
// })
// #ifdef MP
const screenshot = async () => {
	const {
		scene,
		renderer,
		camera,
		helperCanvas
	} = getInstance()

	const [data, w, h] = shot(renderer, scene, camera, THREE.WebGLRenderTarget);
	const ctx = helperCanvas.getContext('2d')
	const imgData = helperCanvas.createImageData(data, w, h);
	helperCanvas.height = imgData.height;
	helperCanvas.width = imgData.width;
	ctx.putImageData(imgData, 0, 0);
	// const imgDataFromCanvas = ctx.getImageData(0, 0, w, h)
	// const hasPixel = imgDataFromCanvas.data.some(i => i !== 0)
	// console.log('hasPixel', hasPixel)

	return new Promise((resolve, reject) => {
		uni.canvasToTempFilePath({
			canvas: helperCanvas,
			success(res) {
				resolve(res.tempFilePath)
			},
			fail(err) {
				reject(err)
			}
		})
	})
}
// #endif
// app、h5
// #ifndef MP
const screenshot = async () => {

	const {
		renderer,
	} = getInstance()

	return new Promise((resolve, reject) => {
		const canvas = renderer.domElement
		const url = canvas.toDataURL('image/png')
		resolve(url)
	})

}

// #endif

// 获取模型节点列表
const getNodes = (extKeys = []) => {
	const {
		group
	} = getInstance()
	const nodeMap = {}
	const root = {
		name: 'root',
		id: 'root',
		uuid: 'root',
		layer: 0,
		children: []
	}



	const createItem = (item, layer) => {
		const result = {}
		extKeys.forEach(key => {
			result[key] = item[key]
		})
		return {
			name: item.name,
			id: item.id,
			uuid: item.uuid,
			type: item.type,
			...result,
			layer,
			children: []
		}
	}

	const toTree = (list) => {
		list.forEach(item => {
			const parent = item.parent
			if (parent.name === 'main-group') {
				nodeMap[item.id] = createItem(item, 1)
				root.children.push(nodeMap[item.id])
			}
			if (item.children) {
				if (!nodeMap[item.id]) {
					nodeMap[item.id] = createItem(item, nodeMap[parent.id].layer + 1)

					nodeMap[parent.id].children.push(nodeMap[item.id])
				}
				toTree(item.children)
			} else {
				nodeMap[parent.id] && nodeMap[parent.id].children.push(
					createItem(item, nodeMap[parent.id].layer + 1)
				)
			}
		})
	}

	toTree(group.children)


	return root.children
}

// 查找对象,也可以使用Object3D.getObjectByName等方法查找
// findByKey('RobotArmature','name')
// findByKey(c=>c.name==='RobotArmature')
const findByKey = (target, key = '') => {
	const {
		group
	} = getInstance()
	// 获取字段
	const getFeild = (object, key) => {
		const keys = key.split('.')
		for (const key of keys) {
			object = object[key]
		}
		return object
	}

	let result = null
	try {
		traverse(group, child => {
			// 有可能是通过userData中的参数查找，所以key可以是：'userData.uuid'
			if ((typeof target === 'function' && target(child)) || getFeild(child, key) === target) {
				result = child
				throw new Error('中断')

			}
		})
	} catch (error) {
		//TODO handle the exception
		// console.log('中断', error)
	}

	return result
}



// 获取容器尺寸

const getContainerSize = () => {
	const {
		canvas,
		container
	} = getInstance()
	// #ifdef MP
	// 小程序的width和height是原始尺寸*devicePixelRatio的，会导致event计算点击位置出错，所以这里需要除以devicePixelRatio或者使用clientWidth
	const {
		clientWidth: width,
		clientHeight: height,
		_left: left,
		_top: top
	} = canvas
	const right = left + width
	const bottom = top + height
	// #endif

	// #ifndef MP
	const {
		width,
		height,
		left,
		top,
		right,
		bottom
	} = container.getBoundingClientRect()
	// #endif


	return {
		width,
		height,
		left,
		top,
		right,
		bottom
	}


}


// 控制器回到默认位置
const controlReset = async ({
	duration = 1000,
	cb = () => {}
}) => {
	const {
		controls,
	} = getInstance()

	if (!duration) {
		controls.reset()
		return
	}

	// 禁用controls
	setControlUpdateFlag(false)

	const {
		target,
		target0,
		position0,
	} = controls
	const {
		position
	} = controls.object

	const v3 = new THREE.Vector3()
	const spherical = new THREE.Spherical()
	const sphericalTmp = new THREE.Spherical()
	spherical.setFromVector3(position)
	const startRadius = spherical.radius
	const startPhi = spherical.phi
	const StartTheta = spherical.theta
	spherical.setFromVector3(position0)
	const endRadius = spherical.radius
	const endPhi = spherical.phi
	const endTheta = spherical.theta
	const quat = new THREE.Quaternion().setFromUnitVectors(
		controls.object.up,
		new THREE.Vector3(0, 1, 0)
	)
	const quatInverse = quat.clone().invert()

	// target
	const startTargetX = target.x
	const startTargetY = target.y
	const startTargetZ = target.z
	const endTargetX = target0.x
	const endTargetY = target0.y
	const endTargetZ = target0.z

	const obj = {
		radius: startRadius,
		phi: startPhi,
		theta: StartTheta,
		targetx: startTargetX,
		targety: startTargetY,
		targetz: startTargetZ
	}

	return new Promise(r => {
		execTween(obj, duration, {
			radius: endRadius,
			phi: endPhi,
			theta: endTheta,
			targetx: endTargetX,
			targety: endTargetY,
			targetz: endTargetZ,
			onComplete: () => {
				setControlUpdateFlag(true)
				cb && cb()
				r()
			},
			onUpdate: () => {
				let {
					phi,
					theta,
					radius,
					targetx,
					targety,
					targetz
				} = obj
				// sphericalTmp.theta = theta;
				sphericalTmp.theta = Math.max(
					controls.minAzimuthAngle,
					Math.min(controls.maxAzimuthAngle, theta)
				)
				// sphericalTmp.phi = phi;
				sphericalTmp.phi = Math.max(controls.minPolarAngle, Math
					.min(
						controls
						.maxPolarAngle,
						phi))
				sphericalTmp.makeSafe()

				// sphericalTmp.radius = radius;
				sphericalTmp.radius = Math.max(controls.minDistance, Math
					.min(
						controls
						.maxDistance,
						radius))
				v3.setFromSpherical(sphericalTmp)
				v3.applyQuaternion(quatInverse)
				controls.object.position.copy(controls.target).add(v3)
				controls.target.set(targetx, targety, targetz)
				controls.object.lookAt(controls.target)

				controls.object.updateProjectionMatrix()
				controls.update()
			}
		})
	})






}



export function useThreeJs() {
	return {
		centerAndScale,
		calculateModelDimensions,
		useLoop,
		loopFuncs,
		initThreeJs,
		isInit,
		dispose,
		getInstance,
		setEnv,
		screenshot,
		getContainerSize,
		setFps,
		setControlUpdateFlag,
		setRenderFlag,
		setRendererEnabled,
		globalConfig,
		controlReset,
		fixFbxMaterial,
		getNodes,
		findByKey,
		useTween,
		useDispose
	}
}