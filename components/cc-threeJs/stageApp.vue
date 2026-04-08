<template>
	<view class="w-full h-full relative stage-app-touch" :prop="$props" :callParam="callParam" :change:callParam="three.callSelfMethod"
		:change:prop="three.init" @click.stop="">
		<div id='container' class="w-full h-full container-touch" @click="three.handleClick">
		</div>
		<!-- 自己写逻辑可以这样调用方法比较方便。 -->
		<!-- <button @click="three.xxx"></button> -->
	</view>
</template>

<script>
	export default {
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
			// 用于执行一些渲染层的方法
			playOptions: {
				type: Object,
				default: {}
			},
			isFixFbxMaterial: {
				type: Boolean,
				default: false
			},
			disableRaycaster: { //是否禁用射线检测（模型点击）
				type: Boolean,
				default: true
			},
			// Logo 图片路径（可选，默认使用 /static/images/logo.png）
			logoPath: {
				type: String,
				default: ''
			},
			// 是否启用平移（拖拽）
			enablePan: {
				type: Boolean,
				default: false
			},
			// 是否允许单指拖动模型（选中时移动模型位置，与 enablePan 不同：此为移动模型本身）
			enableModelDrag: {
				type: Boolean,
				default: false
			}
		},
		data() {
			this.listeners = {}
			return {
				callParam: {
					// key: 'render.js中的方法名',
					// args: [], // 参数,应该是一个数组
					// isReturn:false //是否接受返回值，默认false
				},
			}
		},
		mounted() {},
		methods: {
			// 用于调用render.js中的方法的
			async call(callParam) {
				callParam._t = Date.now()
				this.callParam = callParam
				return new Promise((resolve, reject) => {
					if (callParam.isReturn) {
						this.listeners[callParam.key] = {
							resolve,
							reject
						}
					} else {
						resolve()
					}
				})
			},
			// render.js中的返回值
			callback(callParam) {
				const listener = this.listeners[callParam.key]
				if (!listener) {
					console.warn('callback 未找到 listener，key:', callParam.key)
					return
				}
				const {
					resolve,
					reject
				} = listener
				if (!callParam.err) {
					resolve && resolve(callParam?.args)
				} else {
					reject && reject(callParam.err)
				}
				delete this.listeners[callParam.key]
				this.callParam = {}
			},
			loaded() {
				this.$emit('loaded')
			},
			onModelClick(data) {
				console.log('StageApp.onModelClick 被调用, data:', data)
				this.$emit('modelClick', data)
			},
			onBoundaryCheck(data) {
				console.log('StageApp.onBoundaryCheck 被调用, data:', data)
				this.$emit('boundaryCheck', data)
			},
			onScaleUpdate(data) {
				console.log('StageApp.onScaleUpdate 被调用, data:', data)
				this.$emit('scaleUpdate', data)
			},
			onLoadProgress(progressInfo) {
				this.$emit('loadProgress', progressInfo)
			},
			onModelDimensions(dimensions) {
				this.$emit('dimensions', dimensions)
			},
		},
	}
</script>
<script module="three" lang="renderjs">
	const instance = {}
	import * as THREE from 'three'
	import {
		OrbitControls
	} from 'three/examples/jsm/controls/OrbitControls.js'
	import {
		FBXLoader
	} from 'three/examples/jsm/loaders/FBXLoader.js'
	import {
		OBJLoader
	} from 'three/examples/jsm/loaders/OBJLoader.js'
	import {
		GLTFLoader
	} from 'three/examples/jsm/loaders/GLTFLoader.js'
	import {
		RGBELoader
	} from 'three/examples/jsm/loaders/RGBELoader.js'
	import {
		STLLoader
	} from 'three/examples/jsm/loaders/STLLoader.js'
	import {
		STLExporter
	} from 'three/examples/jsm/exporters/STLExporter.js'

	import {
		animation,
		initAnimation
	} from './utils/animation.js'

	import {
		events
	} from './utils/event.js'

	import {
		MeshoptDecoder
	} from './utils/meshopt/meshopt_decoder.asm.module.js'


	export default {
		data() {
			this.frameId = 0
			return {
				isInit: false,
				props: {}
			}
		},
		mounted() {

		},

		computed: {

		},
		methods: {
			async callSelfMethod({
				key,
				args = [],
				isReturn = false
			}) {
				if (!key || !args) return
				let result = this[key](...args)
				if (isReturn) {
					if (result instanceof Promise) {
						try {
							result = await result
							this.$ownerInstance.callMethod('callback', {
								key,
								args: result,
							})
						} catch (error) {
							this.$ownerInstance.callMethod('callback', {
								key,
								err: error
							})
						}
						return
					}
					this.$ownerInstance.callMethod('callback', {
						key,
						args: result
					})
				}

			},
			handleClick(evt) {
				const {
					disableRaycaster
				} = this.props
				if (disableRaycaster) {
					console.log('禁用了射线检测')
					return
				}
				if (!this.isInit) {
					console.log('等待初始化完毕')
					return
				}
				
				// 如果刚刚发生了拖动，不触发点击（避免拖动结束时误触发选中）
				if (instance.dragState && instance.dragState.isDragging) {
					console.log('拖动中，忽略点击')
					return
				}
				
				const { camera, group, renderer } = instance
				if (!camera || !renderer) {
					console.log('没有相机或渲染器，不触发点击')
					return
				}
				
				// 获取所有模型 group（包括复制出来的）
				const allGroups = (instance.modelGroups || [group]).filter(g => g && g.children.length > 0)
				if (allGroups.length === 0) {
					console.log('没有模型，不触发点击')
					return
				}
				
				const raycaster = new THREE.Raycaster()
				const mouse = new THREE.Vector2()
				const rect = renderer.domElement.getBoundingClientRect()
				
				let clientX, clientY
				if (evt.touches && evt.touches.length > 0) {
					clientX = evt.touches[0].clientX
					clientY = evt.touches[0].clientY
				} else if (evt.changedTouches && evt.changedTouches.length > 0) {
					clientX = evt.changedTouches[0].clientX
					clientY = evt.changedTouches[0].clientY
				} else {
					clientX = evt.clientX
					clientY = evt.clientY
				}
				
				mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1
				mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1
				
				// 收集所有可见 Mesh 并记录所属 group
				const meshes = []
				const meshToGroup = new Map()
				allGroups.forEach(g => {
					g.traverse(child => {
						if (child.isMesh && child.visible) {
							meshes.push(child)
							meshToGroup.set(child, g)
						}
					})
				})
				
				console.log('可检测的 Mesh 数量:', meshes.length)
				
				if (meshes.length === 0) {
					console.log('没有可检测的 Mesh')
					return
				}
				
				raycaster.setFromCamera(mouse, camera)
				const intersects = raycaster.intersectObjects(meshes, false)
				
				console.log('点击位置 NDC:', mouse.x.toFixed(2), mouse.y.toFixed(2), '命中数量:', intersects.length)
				
				if (intersects.length > 0) {
					// 找到命中的 group
					const hitMesh = intersects[0].object
					const hitGroup = meshToGroup.get(hitMesh)
					const hitGroupIndex = allGroups.indexOf(hitGroup)
					console.log('命中模型，group 索引:', hitGroupIndex)
					
					const prevGroup = instance.selectedGroup
					
					if (prevGroup === hitGroup) {
						// 点击同一个模型：切换选中/取消选中
						this.$ownerInstance.callMethod('onModelClick', { hitModel: true, groupIndex: hitGroupIndex, isSame: true })
					} else {
						// 点击不同模型：把上一个变灰，新模型变绿
						if (prevGroup) {
							// 上一个模型变灰
							prevGroup.traverse(child => {
								if (child.isMesh && child.material) {
									const mats = Array.isArray(child.material) ? child.material : [child.material]
									mats.forEach(m => { if (m.color) m.color.setHex(0x808080) })
								}
							})
						}
						// 移除旧包围框
						if (instance.bboxHelper) {
							instance.scene.remove(instance.bboxHelper)
							if (instance.bboxHelper.material) instance.bboxHelper.material.dispose()
							instance.bboxHelper = null
						}
						// 切换到新 group
						instance.selectedGroup = hitGroup
						// 新模型变绿
						hitGroup.traverse(child => {
							if (child.isMesh && child.material) {
								const mats = Array.isArray(child.material) ? child.material : [child.material]
								mats.forEach(m => { if (m.color) m.color.setHex(0x00ff00) })
							}
						})
						// 显示新包围框
						this.updateBoundingBox()
						// 通知父组件切换了选中目标（保持 isModelSelected = true）
						this.$ownerInstance.callMethod('onModelClick', { hitModel: true, groupIndex: hitGroupIndex, isSame: false })
					}
				} else {
					console.log('未命中模型，不通知父组件')
				}
			},
			// 貌似不需要销毁，会自动销毁相关变量
			// 退出页面requestAnimationFrame不会在执行了
			destroy() {
				cancelAnimationFrame(this.frameId)
				animation.dispose()
				const {
					group,
					scene,
					renderer
				} = instance
				try {
					group.traverse(c => {
						if (c.isMesh) {
							c.geometry.dispose();
							c.material.dispose();
						}
						if (c.isTexture) {
							c.dispose();
						}
					})

					scene.traverse(c => {
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

					// 清理平台上的正方体
					if (instance.platformCube) {
						scene.remove(instance.platformCube)
						if (instance.platformCube.geometry) instance.platformCube.geometry.dispose()
						if (instance.platformCube.material) instance.platformCube.material.dispose()
						instance.platformCube = null
					}
					if (instance.platformCubeEdges) {
						scene.remove(instance.platformCubeEdges)
						if (instance.platformCubeEdges.geometry) instance.platformCubeEdges.geometry.dispose()
						if (instance.platformCubeEdges.material) instance.platformCubeEdges.material.dispose()
						instance.platformCubeEdges = null
					}
					if (instance.platformCubeGrid) {
						scene.remove(instance.platformCubeGrid)
						instance.platformCubeGrid = null
					}
					if (instance.platformCubeLogo) {
						scene.remove(instance.platformCubeLogo)
						if (instance.platformCubeLogo.geometry) instance.platformCubeLogo.geometry.dispose()
						if (instance.platformCubeLogo.material) {
							if (instance.platformCubeLogo.material.map) {
								instance.platformCubeLogo.material.map.dispose()
							}
							instance.platformCubeLogo.material.dispose()
						}
						instance.platformCubeLogo = null
					}

					for (const key in instance) {
						instance[key] = null
					}
					console.log('场景销毁')
				} catch (error) {
					//TODO handle the exception
					// console.log('dispose error:', error)
				}
			},
			// 从 Geometry 或 Mesh 直接获取模型尺寸（STL 文件直接从几何体获取）
			calculateModelDimensions(geometryOrMesh) {
				let geometry = geometryOrMesh
				
				// 如果是 Mesh，获取其 geometry
				if (geometryOrMesh.isMesh) {
					geometry = geometryOrMesh.geometry
				}
				
				// 如果不是 Geometry，返回 null
				if (!geometry || !geometry.isBufferGeometry) {
					return null
				}
				
				// 计算包围盒（如果还没有计算过）
				if (!geometry.boundingBox) {
					geometry.computeBoundingBox()
				}
				const box = geometry.boundingBox
				
				if (!box) {
					return null
				}
				
				// 直接从几何体包围盒获取尺寸
				const size = new THREE.Vector3()
				box.getSize(size)
				
				const dimensions = {
					x: Math.abs(size.x),
					y: Math.abs(size.y),
					z: Math.abs(size.z)
				}
				
				// 通过 callMethod 传递给父组件
				if (dimensions) {
					this.$ownerInstance.callMethod('onModelDimensions', dimensions)
				}
				
				return dimensions
			},
			// 居中并对齐底部到网格，同时处理缩放和边界限制
			centerAndScale(scaleRatio = 1) {
				const {
					camera,
					scene,
					controls
				} = instance
				
				// 操作选中的 group
				const targetGroup = instance.selectedGroup || instance.group
				if (!targetGroup) return

				// 1. 重置变换以便重新计算
				targetGroup.position.set(0, 0, 0)
				targetGroup.scale.set(1, 1, 1)
				targetGroup.updateMatrixWorld(true)

				// 2. 计算原始包围盒
				let boundingBox = new THREE.Box3().setFromObject(targetGroup)
				const size = new THREE.Vector3()
				boundingBox.getSize(size)
				
				// 3. 自动适配逻辑：如果模型尺寸超过 100mm，强制缩小到 100mm 范围内
				let autoScale = 1.0
				const maxDim = Math.max(size.x, size.y, size.z)
				if (maxDim > 100) {
					autoScale = 100 / maxDim
				}
				
				// 发送原始尺寸到主层
				const originalDimensions = {
					x: Math.round(size.x * 10) / 10,
					y: Math.round(size.y * 10) / 10,
					z: Math.round(size.z * 10) / 10
				}
				if (originalDimensions.x > 0) {
					this.$ownerInstance.callMethod('onModelDimensions', originalDimensions)
				}
				
				// 4. 应用最终缩放 (用户缩放 * 自动适配缩放)
				const finalScale = scaleRatio * autoScale
				// 保存 autoScale 供 scaleModelInPlace 使用
				instance.autoScale = autoScale
				targetGroup.scale.set(finalScale, finalScale, finalScale)
				targetGroup.updateMatrixWorld(true)

				// 5. 重新计算缩放后的包围盒和中心
				const scaledBox = new THREE.Box3().setFromObject(targetGroup)
				const scaledSize = new THREE.Vector3()
				const scaledCenter = new THREE.Vector3()
				scaledBox.getSize(scaledSize)
				scaledBox.getCenter(scaledCenter)

				// 6. 核心对齐逻辑：X, Y 居中，Z 轴底部对齐网格
				targetGroup.position.x = -scaledCenter.x
				targetGroup.position.y = -scaledCenter.y
				targetGroup.position.z = -scaledCenter.z + (scaledSize.z / 2)

				// 7. 更新观察中心
				if (controls) {
					controls.target.set(0, 0, 50)
					camera.lookAt(controls.target)
					controls.update()
				}

				// 8. 检测是否超过边界（100mm限制）
				const isOutOfBounds = scaledSize.x > 100.1 || scaledSize.y > 100.1 || scaledSize.z > 100.1
				const bboxColor = isOutOfBounds ? 0xff0000 : 0x00aaff

				// 9. 绘制 100mm³ 的辅助框
				this.createPlatformCube(new THREE.Box3(
					new THREE.Vector3(-50, -50, 0),
					new THREE.Vector3(50, 50, 100)
				))

				// 返回显示用的缩放后尺寸
				const dimensions = {
					x: Math.round(Math.abs(scaledSize.x) * 10) / 10,
					y: Math.round(Math.abs(scaledSize.y) * 10) / 10,
					z: Math.round(Math.abs(scaledSize.z) * 10) / 10
				}
				
				// 检查是否选中模型
				const isSelected = this.props.enableModelDrag
				
				// 更新辅助框显示
				if (instance.bboxHelper) {
					scene.remove(instance.bboxHelper)
					if (instance.bboxHelper.material) {
						instance.bboxHelper.material.dispose()
					}
					instance.bboxHelper = null
				}
				
				// 只有选中时才显示包围框
				if (isSelected) {
					targetGroup.updateMatrixWorld(true)
					const finalScaledBox = new THREE.Box3().setFromObject(targetGroup)
					instance.bboxHelper = new THREE.Box3Helper(finalScaledBox, bboxColor)
					if (instance.bboxHelper.material) {
						instance.bboxHelper.material.depthTest = true
						instance.bboxHelper.material.depthWrite = false
						instance.bboxHelper.material.transparent = true
						instance.bboxHelper.material.opacity = 0.8
					}
					instance.bboxHelper.renderOrder = 999
					scene.add(instance.bboxHelper)
				}

				return dimensions
			},
			resetCamera() {
				const { controls, camera } = instance
				if (controls) {
					controls.reset()
					// 确保旋转中心正确（对应 centerAndScale 中的位置）
					controls.target.set(0, 0, 50)
					camera.lookAt(controls.target)
					controls.update()
				}
			},
			resetModel() {
				const { controls, camera } = instance
				const targetGroup = instance.selectedGroup || instance.group
				if (targetGroup) {
					// 重置模型旋转
					targetGroup.rotation.set(0, 0, 0)
					targetGroup.updateMatrixWorld(true)
				}
				if (camera && controls) {
					// 停止自动旋转
					controls.autoRotate = false
					
					// 确保 Up 向量正确 (Z轴向上)
					camera.up.set(0, 0, 1)
					
					// 恢复到初始视角：前左上方略带俯视，模型朝向屏幕右下
					camera.position.set(-120, -180, 100)
					controls.target.set(0, 0, 50)
					
					// 更新控制器和相机
					camera.lookAt(controls.target)
					controls.update()
				}
				// 重新居中和缩放（1代表100%大小）
				this.centerAndScale(1)
			},
			// 原地缩放模型（不改变 XY 中心位置，保持底部贴地）
			scaleModelInPlace(userScale) {
				const targetGroup = instance.selectedGroup || instance.group
				if (!targetGroup) return
				
				const autoScale = instance.autoScale || 1
				const finalScale = autoScale * userScale
				
				// 缩放前记录模型包围盒的 XY 中心
				targetGroup.updateMatrixWorld(true)
				const boxBefore = new THREE.Box3().setFromObject(targetGroup)
				const centerXBefore = (boxBefore.min.x + boxBefore.max.x) / 2
				const centerYBefore = (boxBefore.min.y + boxBefore.max.y) / 2
				const minZBefore = boxBefore.min.z
				
				// 应用缩放（Three.js 以 group.position 为缩放中心）
				targetGroup.scale.set(finalScale, finalScale, finalScale)
				targetGroup.updateMatrixWorld(true)
				
				// 缩放后重新计算包围盒
				const boxAfter = new THREE.Box3().setFromObject(targetGroup)
				const centerXAfter = (boxAfter.min.x + boxAfter.max.x) / 2
				const centerYAfter = (boxAfter.min.y + boxAfter.max.y) / 2
				const minZAfter = boxAfter.min.z
				
				// 补偿 XY：让模型中心保持在原来位置
				targetGroup.position.x += centerXBefore - centerXAfter
				targetGroup.position.y += centerYBefore - centerYAfter
				// 补偿 Z：保持底部贴地
				targetGroup.position.z += minZBefore - minZAfter
				
				// 更新包围框
				this.updateBoundingBox()
			},
			// 设置模型颜色（操作选中的 group）
			setModelColor(color) {
				console.log('renderjs: 设置模型颜色:', color)
				const targetGroup = instance.selectedGroup || instance.group
				if (!targetGroup) {
					console.log('renderjs: group不存在')
					return
				}
				
				let found = false
				targetGroup.traverse((child) => {
					if (child.isMesh && child.material) {
						found = true
						if (Array.isArray(child.material)) {
							child.material.forEach(mat => {
								if (mat.color) {
									mat.color.setHex(color)
									mat.needsUpdate = true
								}
							})
						} else {
							if (child.material.color) {
								child.material.color.setHex(color)
								child.material.needsUpdate = true
							}
						}
					}
				})
				
				if (!found) {
					console.log('renderjs: 未找到任何mesh')
				}
			},
			// 将模型移动到平台中心 (0, 0)
			centerModel() {
				const targetGroup = instance.selectedGroup || instance.group
				if (!targetGroup) return
				
				targetGroup.updateMatrixWorld(true)
				const box = new THREE.Box3().setFromObject(targetGroup)
				const center = new THREE.Vector3()
				box.getCenter(center)
				
				targetGroup.position.x = targetGroup.position.x - center.x
				targetGroup.position.y = targetGroup.position.y - center.y
				
				this.updateBoundingBox()
			},
			// 设置模型旋转角度（单位：度）—— 绕模型自身中心原地旋转
			setModelRotation(x, y, z) {
				const targetGroup = instance.selectedGroup || instance.group
				if (!targetGroup) return
				
				targetGroup.updateMatrixWorld(true)
				const boxBefore = new THREE.Box3().setFromObject(targetGroup)
				const centerBefore = new THREE.Vector3()
				boxBefore.getCenter(centerBefore)
				
				targetGroup.rotation.x = (x * Math.PI) / 180
				targetGroup.rotation.y = (y * Math.PI) / 180
				targetGroup.rotation.z = (z * Math.PI) / 180
				targetGroup.updateMatrixWorld(true)
				
				const boxAfter = new THREE.Box3().setFromObject(targetGroup)
				const centerAfter = new THREE.Vector3()
				boxAfter.getCenter(centerAfter)
				
				targetGroup.position.x += centerBefore.x - centerAfter.x
				targetGroup.position.y += centerBefore.y - centerAfter.y
				
				targetGroup.updateMatrixWorld(true)
				const boxFinal = new THREE.Box3().setFromObject(targetGroup)
				targetGroup.position.z += -boxFinal.min.z
				
				this.updateBoundingBox()
			},
			// 复制模型（克隆到旁边，独立 group，可分别选中）
			copyModel() {
				const { scene } = instance
				const targetGroup = instance.selectedGroup || instance.group
				if (!targetGroup || targetGroup.children.length === 0) return
				
				// 计算当前 group 的包围盒
				targetGroup.updateMatrixWorld(true)
				const box = new THREE.Box3().setFromObject(targetGroup)
				const size = new THREE.Vector3()
				box.getSize(size)
				
				// 创建独立新 group
				const newGroup = new THREE.Group()
				newGroup.position.copy(targetGroup.position)
				newGroup.rotation.copy(targetGroup.rotation)
				newGroup.scale.copy(targetGroup.scale)
				
				// 深克隆所有子对象，独立材质
				targetGroup.children.forEach(child => {
					const clone = child.clone(true)
					clone.traverse(obj => {
						if (obj.isMesh && obj.material) {
							if (Array.isArray(obj.material)) {
								obj.material = obj.material.map(m => m.clone())
							} else {
								obj.material = obj.material.clone()
							}
						}
					})
					newGroup.add(clone)
				})
				
				// 偏移到旁边（X 轴方向，间距 10mm）
				newGroup.position.x += size.x + 10
				
				scene.add(newGroup)
				
				// 加入多模型管理列表
				if (!instance.modelGroups) instance.modelGroups = [instance.group]
				instance.modelGroups.push(newGroup)
				
				// 新克隆的模型默认为未选中（灰色）
				newGroup.traverse(obj => {
					if (obj.isMesh && obj.material) {
						const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
						mats.forEach(m => { if (m.color) m.color.setHex(0x808080) })
					}
				})
				
				console.log('复制模型完成，当前模型数量:', instance.modelGroups.length)
			},
			// 删除模型
			deleteModel() {
				const { scene } = instance
				const targetGroup = instance.selectedGroup || instance.group
				if (!targetGroup) return
				
				// 移除 group 中的所有子对象并释放内存
				while (targetGroup.children.length > 0) {
					const child = targetGroup.children[0]
					if (child.geometry) child.geometry.dispose()
					if (child.material) {
						if (Array.isArray(child.material)) {
							child.material.forEach(m => m.dispose())
						} else {
							child.material.dispose()
						}
					}
					targetGroup.remove(child)
				}
				
				// 从场景中移除 group
				scene.remove(targetGroup)
				
				// 从 modelGroups 中移除
				if (instance.modelGroups) {
					const idx = instance.modelGroups.indexOf(targetGroup)
					if (idx !== -1) instance.modelGroups.splice(idx, 1)
				}
				
				// 移除包围框
				if (instance.bboxHelper) {
					scene.remove(instance.bboxHelper)
					if (instance.bboxHelper.material) instance.bboxHelper.material.dispose()
					instance.bboxHelper = null
				}
				
				// 切换 selectedGroup 到剩余的第一个模型，没有则为 null
				const remaining = instance.modelGroups || []
				instance.selectedGroup = remaining.length > 0 ? remaining[0] : null
				
				// 如果还有模型，把它变绿色并显示包围框
				if (instance.selectedGroup) {
					instance.selectedGroup.traverse(child => {
						if (child.isMesh && child.material) {
							const mats = Array.isArray(child.material) ? child.material : [child.material]
							mats.forEach(m => { if (m.color) m.color.setHex(0x00ff00) })
						}
					})
					this.updateBoundingBox()
				}
			},
			// 导出修改后的STL
			async exportModifiedSTL() {
				const exporter = new STLExporter()
				const { group, modelGroups } = instance
				
				console.log('exportModifiedSTL - modelGroups:', modelGroups ? modelGroups.length : 0)
				console.log('exportModifiedSTL - group children:', group ? group.children.length : 0)
				
				// 创建临时 group 合并所有模型
				const tempGroup = new THREE.Group()
				
				if (modelGroups && modelGroups.length > 0) {
					console.log('使用 modelGroups 导出，数量:', modelGroups.length)
					modelGroups.forEach((g, idx) => {
						console.log(`modelGroups[${idx}] children:`, g ? g.children.length : 0)
						if (g && g.children.length > 0) {
							g.traverse(child => {
								if (child.isMesh) {
									const clone = child.clone()
									child.updateMatrixWorld(true)
									clone.applyMatrix4(child.matrixWorld)
									tempGroup.add(clone)
								}
							})
						}
					})
				} else if (group && group.children.length > 0) {
					console.log('使用 group 导出')
					group.traverse(child => {
						if (child.isMesh) {
							const clone = child.clone()
							child.updateMatrixWorld(true)
							clone.applyMatrix4(child.matrixWorld)
							tempGroup.add(clone)
						}
					})
				}
				
				console.log('tempGroup children:', tempGroup.children.length)
				
				if (tempGroup.children.length === 0) {
					return null
				}
				
				// 导出为二进制 STL
				let stlData = exporter.parse(tempGroup, { binary: true })
				console.log('STL 导出结果类型:', typeof stlData, '构造函数:', stlData ? stlData.constructor?.name : 'null')
				
				// 处理不同类型的返回值
				let uint8Array
				if (stlData instanceof ArrayBuffer) {
					uint8Array = new Uint8Array(stlData)
				} else if (stlData instanceof Uint8Array) {
					uint8Array = stlData
				} else if (stlData?.buffer instanceof ArrayBuffer) {
					// Buffer 类型
					uint8Array = new Uint8Array(stlData.buffer)
				} else if (typeof stlData === 'string') {
					// ASCII STL
					uint8Array = new TextEncoder().encode(stlData)
				} else {
					console.error('未知的 STL 数据类型:', stlData)
					return null
				}
				
				console.log('uint8Array 长度:', uint8Array.length)
				
				if (uint8Array.length === 0) {
					console.error('STL 导出失败，数据为空')
					return null
				}
				
				// 直接保存文件并返回路径
				const fileName = `modified_${Date.now()}.stl`
				const filePath = `_doc/${fileName}`
				
				console.log('准备保存文件:', filePath)
				
				try {
					// 将 Uint8Array 转为 Base64
					const base64 = this.uint8ArrayToBase64(uint8Array)
					console.log('导出 STL 成功，base64 长度:', base64 ? base64.length : 0)
					
					// 保存文件（使用 base64）
					const savedPath = await this.saveBase64File(filePath, base64)
					console.log('文件保存成功:', savedPath)
					return savedPath
				} catch (e) {
					console.error('保存文件失败:', e)
					return null
				}
			},
			// 保存 Base64 文件
			async saveBase64File(filePath, base64) {
				console.log('saveBase64File 开始, filePath:', filePath, 'base64长度:', base64.length)
				return new Promise((resolve, reject) => {
					console.log('开始解析目录 _doc/')
					plus.io.resolveLocalFileSystemURL('_doc/', (dirEntry) => {
						console.log('目录解析成功')
						const fileName = filePath.split('/').pop()
						dirEntry.getFile(fileName, { create: true }, (fileEntry) => {
							console.log('文件创建成功:', fileEntry.fullPath)
							fileEntry.createWriter((writer) => {
								console.log('开始写入文件')
								writer.onwriteend = () => {
									console.log('文件写入完成')
									resolve(fileEntry.fullPath)
								}
								writer.onerror = (err) => {
									console.error('文件写入失败:', err)
									reject(err)
								}
								// 直接写入字符串
								writer.write(base64)
							}, (err) => {
								console.error('创建Writer失败:', err)
								reject(err)
							})
						}, (err) => {
							console.error('创建文件失败:', err)
							reject(err)
						})
					}, (err) => {
						console.error('解析目录失败:', err)
						reject(err)
					})
				})
			},
			// Uint8Array 转 Base64
			uint8ArrayToBase64(uint8Array) {
				let binary = ''
				const len = uint8Array.length
				for (let i = 0; i < len; i++) {
					binary += String.fromCharCode(uint8Array[i])
				}
				try {
					const base64 = btoa(binary)
					console.log('uint8ArrayToBase64 成功, 输入长度:', len, '输出长度:', base64.length)
					return base64
				} catch (e) {
					console.error('btoa 失败:', e)
					return null
				}
			},
			// 旋转模型 90 度（绕 Z 轴）
			rotateModel() {
				const { group } = instance
				if (!group) return
				
				// 绕 Z 轴旋转 90 度
				group.rotation.z += Math.PI / 2
				group.updateMatrixWorld(true)
				
				// 更新包围框
				this.updateBoundingBox()
			},
			// 自动适配模型到平台大小（缩放到刚好适合 100mm³）
			fitModel() {
				const targetGroup = instance.selectedGroup || instance.group
				if (!targetGroup) return
				
				// 重置缩放
				targetGroup.scale.set(1, 1, 1)
				targetGroup.updateMatrixWorld(true)
				
				// 计算原始包围盒
				const box = new THREE.Box3().setFromObject(targetGroup)
				const size = new THREE.Vector3()
				box.getSize(size)
				
				// 计算需要的缩放比例（适配到 95mm，留 5mm 边距）
				const maxDim = Math.max(size.x, size.y, size.z)
				const targetSize = 95
				const scale = targetSize / maxDim
				
				// 应用缩放
				targetGroup.scale.set(scale, scale, scale)
				targetGroup.updateMatrixWorld(true)
				
				// 居中模型
				this.centerModel()
				
				// 通知父组件更新缩放百分比
				const scalePercent = Math.round(scale * 100)
				this.$ownerInstance.callMethod('onScaleUpdate', { scalePercent })
			},
			// 更新包围框位置和颜色（拖动模型时调用）
			updateBoundingBox() {
				const { scene } = instance
				const targetGroup = instance.selectedGroup || instance.group
				if (!targetGroup || !scene) return
				
				// 检查是否选中模型
				const isSelected = this.props.enableModelDrag
				
				// 更新模型的世界矩阵
				targetGroup.updateMatrixWorld(true)
				
				// 计算当前模型的包围盒
				const currentBox = new THREE.Box3().setFromObject(targetGroup)
				const size = new THREE.Vector3()
				currentBox.getSize(size)
				
				// 检测是否超出 100mm³ 边界
				const isOutOfBounds = size.x > 100.1 || size.y > 100.1 || size.z > 100.1
				
				// 检测模型中心是否在平台范围内
				const center = new THREE.Vector3()
				currentBox.getCenter(center)
				const min = currentBox.min
				const max = currentBox.max
				
				console.log('边界检测 - 尺寸:', size.x.toFixed(2), size.y.toFixed(2), size.z.toFixed(2))
				console.log('边界检测 - 位置 min:', min.x.toFixed(2), min.y.toFixed(2), min.z.toFixed(2))
				console.log('边界检测 - 位置 max:', max.x.toFixed(2), max.y.toFixed(2), max.z.toFixed(2))
				console.log('边界检测 - isOutOfBounds:', isOutOfBounds)
				
				const isOutsidePlatform = 
					min.x < -50.1 || max.x > 50.1 ||
					min.y < -50.1 || max.y > 50.1 ||
					min.z < -0.1 || max.z > 100.1
				
				console.log('边界检测 - isOutsidePlatform:', isOutsidePlatform)
				
				const finalIsOutOfBounds = isOutOfBounds || isOutsidePlatform
				const finalColor = finalIsOutOfBounds ? 0xff0000 : 0x00aaff
				
				console.log('边界检测 - finalIsOutOfBounds:', finalIsOutOfBounds)
				
				// 更新模型颜色
				if (finalIsOutOfBounds) {
					this.setModelColor(0xff0000)
				} else {
					this.setModelColor(isSelected ? 0x00ff00 : 0x808080)
				}
				
				// 移除旧的包围框
				if (instance.bboxHelper) {
					scene.remove(instance.bboxHelper)
					if (instance.bboxHelper.material) {
						instance.bboxHelper.material.dispose()
					}
					instance.bboxHelper = null
				}
				
				// 只有选中时才显示包围框
				if (isSelected) {
					instance.bboxHelper = new THREE.Box3Helper(currentBox, finalColor)
					if (instance.bboxHelper.material) {
						instance.bboxHelper.material.depthTest = true
						instance.bboxHelper.material.depthWrite = false
						instance.bboxHelper.material.transparent = true
						instance.bboxHelper.material.opacity = 0.8
					}
					instance.bboxHelper.renderOrder = 999
					scene.add(instance.bboxHelper)
				}
				
				// 通知父组件边界状态
				this.$ownerInstance.callMethod('onBoundaryCheck', {
					isOutOfBounds: finalIsOutOfBounds,
					size: {
						x: Math.round(size.x * 10) / 10,
						y: Math.round(size.y * 10) / 10,
						z: Math.round(size.z * 10) / 10
					},
					position: {
						x: Math.round(center.x * 10) / 10,
						y: Math.round(center.y * 10) / 10,
						z: Math.round(center.z * 10) / 10
					}
				})
			},
			createPlatformCube(boundingBox = null) {
				const { scene, group } = instance
				
				// 移除旧的正方体（如果存在）
				if (instance.platformCube) {
					scene.remove(instance.platformCube)
					if (instance.platformCube.geometry) instance.platformCube.geometry.dispose()
					if (instance.platformCube.material) instance.platformCube.material.dispose()
					instance.platformCube = null
				}
				if (instance.platformCubeEdges) {
					scene.remove(instance.platformCubeEdges)
					if (instance.platformCubeEdges.geometry) instance.platformCubeEdges.geometry.dispose()
					if (instance.platformCubeEdges.material) instance.platformCubeEdges.material.dispose()
					instance.platformCubeEdges = null
				}
				if (instance.platformCubeGrid) {
					scene.remove(instance.platformCubeGrid)
					instance.platformCubeGrid = null
				}
				// Logo只创建一次，不重复创建和删除，避免透明度叠加bug
				// if (instance.platformCubeLogo) {
				// 	scene.remove(instance.platformCubeLogo)
				// 	if (instance.platformCubeLogo.geometry) instance.platformCubeLogo.geometry.dispose()
				// 	if (instance.platformCubeLogo.material) {
				// 		if (instance.platformCubeLogo.material.map) {
				// 			instance.platformCubeLogo.material.map.dispose()
				// 		}
				// 		instance.platformCubeLogo.material.dispose()
				// 	}
				// 	instance.platformCubeLogo = null
				// }
				// Logo只创建一次，如果已存在则只更新平台立方体，不重复创建logo
				if (instance.platformCubeLogo) {
					// Logo已存在，只更新平台立方体部分（边线、网格），不创建logo
					// 先清理旧的平台元素
					if (instance.platformCube) {
						scene.remove(instance.platformCube)
						if (instance.platformCube.geometry) instance.platformCube.geometry.dispose()
						if (instance.platformCube.material) instance.platformCube.material.dispose()
						instance.platformCube = null
					}
					if (instance.platformCubeEdges) {
						scene.remove(instance.platformCubeEdges)
						if (instance.platformCubeEdges.geometry) instance.platformCubeEdges.geometry.dispose()
						if (instance.platformCubeEdges.material) instance.platformCubeEdges.material.dispose()
						instance.platformCubeEdges = null
					}
					if (instance.platformCubeGrid) {
						scene.remove(instance.platformCubeGrid)
						instance.platformCubeGrid = null
					}
					
					// 只创建平台立方体的边线和网格（不创建logo）
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
						linewidth: 1,
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
					const cubeBottomGrid = new THREE.GridHelper(gridSize, gridDivisions, 0x888888, 0x444444)
					cubeBottomGrid.rotation.x = -Math.PI / 2
					cubeBottomGrid.position.set(0, 0, 0)
					if (cubeBottomGrid.material) {
						cubeBottomGrid.material.depthTest = true
						cubeBottomGrid.material.depthWrite = true
						cubeBottomGrid.material.opacity = 1.0
						cubeBottomGrid.material.transparent = false
						cubeBottomGrid.material.fog = false
						if (cubeBottomGrid.material.linewidth !== undefined) {
							cubeBottomGrid.material.linewidth = 1
						}
					}
					cubeBottomGrid.renderOrder = 0
					scene.add(cubeBottomGrid)
					
					instance.platformCube = cube
					instance.platformCubeEdges = edgesLine
					instance.platformCubeGrid = cubeBottomGrid
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
					linewidth: 1, // 线条宽度（更细）
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
				const cubeBottomGrid = new THREE.GridHelper(gridSize, gridDivisions, 0x888888, 0x444444)
				// GridHelper 默认在 XZ 平面，需要绕 X 轴旋转 -90 度到 XY 平面
				cubeBottomGrid.rotation.x = -Math.PI / 2
				cubeBottomGrid.position.set(0, 0, 0) // 正方体底部在 z=0
				// 设置网格线深度测试，使其能被模型正确遮挡
				if (cubeBottomGrid.material) {
					cubeBottomGrid.material.depthTest = true // 启用深度测试，网格会被模型遮挡
					cubeBottomGrid.material.depthWrite = true // 启用深度写入
					cubeBottomGrid.material.opacity = 1.0
					cubeBottomGrid.material.transparent = false
					cubeBottomGrid.material.fog = false
					// 设置线宽（如果材质支持）
					if (cubeBottomGrid.material.linewidth !== undefined) {
						cubeBottomGrid.material.linewidth = 1
					}
				}
				cubeBottomGrid.renderOrder = 0 // 设置正常渲染顺序，确保网格在模型下方时被遮挡
				scene.add(cubeBottomGrid)
				
				// 在正方体底部（z=0）添加 logo 纹理
				const logoSize = 50 // logo 尺寸（调小）
				const logoGeometry = new THREE.PlaneGeometry(logoSize, logoSize)
				
				// 创建 logo 平面的函数（确保只创建一次，避免透明度叠加）
				const createLogoPlane = (texture) => {
					// 如果logo已存在，先移除旧的
					if (instance.platformCubeLogo) {
						scene.remove(instance.platformCubeLogo)
						if (instance.platformCubeLogo.geometry) instance.platformCubeLogo.geometry.dispose()
						if (instance.platformCubeLogo.material) {
							if (instance.platformCubeLogo.material.map) {
								instance.platformCubeLogo.material.map.dispose()
							}
							instance.platformCubeLogo.material.dispose()
						}
						instance.platformCubeLogo = null
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
				instance.platformCubeLogo = logoPlane
				}
				
				// 使用 TextureLoader 加载 logo（uni-app renderjs 中推荐方式）
				const textureLoader = new THREE.TextureLoader()
				
				// 获取 logo 路径：优先使用 props 传入的路径，否则使用默认路径
				// 在 H5/App 中，./static 往往比 /static 更可靠
				let logoPath = this.props.logoPath || './static/images/logo.png'
				
				// H5 环境下的完整路径处理
				if (typeof window !== 'undefined' && window.location && window.location.protocol !== 'file:' && !logoPath.startsWith('http')) {
					const baseUrl = window.location.origin
					// 如果是 ./static 开头，去掉 .
					let path = logoPath
					if (path.startsWith('.')) path = path.substring(1)
					if (!path.startsWith('/')) path = '/' + path
					logoPath = baseUrl + path
				}
				
				textureLoader.load(
					logoPath,
					(texture) => {
						createLogoPlane(texture)
					},
					null,
					() => {
						// 尝试备用路径
						const fallbackPaths = [
							'/static/images/logo.png',
							'static/images/logo.png'
						]
						
						let fallbackIndex = 0
						const tryFallback = () => {
							if (fallbackIndex >= fallbackPaths.length) return
							
							const fallbackPath = fallbackPaths[fallbackIndex]
							textureLoader.load(
								fallbackPath,
								(texture) => {
									createLogoPlane(texture)
								},
								null,
								() => {
									fallbackIndex++
									tryFallback()
								}
							)
						}
						tryFallback()
					}
				)
				
				// 保存引用以便后续清理
				instance.platformCube = cube
				instance.platformCubeEdges = edgesLine
				instance.platformCubeGrid = cubeBottomGrid
			},
			setEnv() {
				const {
					backgroundVisible,
					env,
				} = this.props
				if (!env) return
				const rgbeLoader = new RGBELoader()
				rgbeLoader.load(env, texture => {
					texture.mapping = THREE.EquirectangularReflectionMapping;
					instance.scene.environment = texture
					if (backgroundVisible) instance.scene.background = texture
				}, null, () => {
					// 即使环境贴图加载失败也不报错，保持模型可预览
				})
			},
			fixFbxMaterial(group, materialType = 'MeshStandardMaterial') {
				group.traverse((c) => {
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
			},
			getLoader(url, suffix = '') {
				let loader;
				if (suffix == '') {
					suffix = url.split('.').pop()
				}
				suffix = suffix.toLocaleLowerCase()
				switch (suffix) {
					case 'glb':
						loader = new GLTFLoader()
						break;
					case 'gltf':
						loader = new GLTFLoader()
						break;
					case 'fbx':
						loader = new FBXLoader()
						break;
					case 'obj':
						loader = new OBJLoader()
						break;
					case 'stl':
						loader = new STLLoader()
						break;
					case 'jpg':
					case 'png':
					case 'jpeg':
						loader = new THREE.TextureLoader()
						break;
					default:
						break;
				}

				// 只对 GLTFLoader 调用 setMeshoptDecoder，避免对不支持的方法调用
				if (loader && (suffix === 'glb' || suffix === 'gltf')) {
				try {
					loader.setMeshoptDecoder(MeshoptDecoder);
				} catch (error) {
						console.log(`${suffix} loader setMeshoptDecoder failed:`, error)
					}
				}

				return loader
			},
			// 读取本地文件为 ArrayBuffer（App 渲染层）- 优化版本
			readLocalFileToArrayBuffer(filePath) {
				// renderjs 无 uni.getFileSystemManager，使用 plus.io
				return new Promise((resolve, reject) => {
					if (!(typeof plus !== 'undefined' && plus.io)) {
						return reject(new Error('plus.io 不可用，无法读取本地文件'))
					}
					
					// 去掉 file:// 前缀（只处理一次）
					let path = filePath.replace(/^file:\/\//, '')
					
					// 优化：如果是 _doc 路径，直接使用，不需要转换
					if (!path.startsWith('_doc/')) {
						// 尝试转换路径
						try {
							path = plus.io.convertLocalFileSystemURL(path).replace(/^file:\/\//, '')
						} catch (e) {
							// 转换失败，使用原路径
						}
					}
					
					// 优化：减少嵌套，使用更直接的方式
					plus.io.resolveLocalFileSystemURL(path, 
						entry => {
							entry.file(
								file => {
									// 优化：使用同步方式读取（如果文件不太大）
									const reader = new plus.io.FileReader()
									
									// 设置超时，避免长时间等待
									const timeout = setTimeout(() => {
										reject(new Error('文件读取超时'))
									}, 10000) // 10秒超时
									
									reader.onload = (e) => {
										clearTimeout(timeout)
										resolve(e.target.result)
									}
									reader.onerror = (err) => {
										clearTimeout(timeout)
										reject(err)
									}
									
									// 开始读取
									reader.readAsArrayBuffer(file)
								}, 
								reject
							)
						}, 
						reject
					)
				})
			},
			isLocalFile(url) {
				if (!url || typeof url !== 'string') return false
				return url.startsWith('file://') || (!/^https?:\/\//i.test(url))
			},
			// 获取缓存键名（基于 URL）
			getCacheKey(url) {
				// 使用 URL 作为键，可以添加 hash 来确保唯一性
				return `model_cache_${encodeURIComponent(url)}`
			},
			// 检查模型缓存（APP 端）- 优化版本，减少异步嵌套
			async getCachedModelPath(url, skipExpireCheck = false) {
				if (this.isLocalFile(url)) {
					return null // 本地文件不需要缓存
				}
				
				try {
					if (typeof plus !== 'undefined' && plus.io) {
						const cacheKey = this.getCacheKey(url)
						// 使用安全的文件名（移除特殊字符）
						const safeFileName = cacheKey.replace(/[^a-zA-Z0-9]/g, '_') + '.cache'
						const cacheDir = '_doc/model_cache/'
						const cachePath = cacheDir + safeFileName
						
						// 优化：直接检查文件是否存在，减少嵌套
						return new Promise((resolve) => {
							plus.io.resolveLocalFileSystemURL(cachePath,
								(entry) => {
									// 文件存在
									if (skipExpireCheck) {
										// 快速模式：跳过过期检查，直接返回
										resolve(cachePath)
										return
									}
									
									// 正常模式：检查修改时间（简单过期检查：7天）
									entry.file(file => {
										const now = Date.now()
										const fileTime = file.lastModified || (file.lastModifiedDate ? file.lastModifiedDate.getTime() : 0)
										const cacheAge = now - fileTime
										const maxAge = 7 * 24 * 60 * 60 * 1000 // 7天
										
										if (cacheAge < maxAge) {
											resolve(cachePath)
										} else {
											// 缓存过期，异步删除文件（不阻塞）
											entry.remove(() => resolve(null), () => resolve(null))
										}
									}, () => {
										// 无法读取文件信息，直接返回路径（让加载时处理错误）
										resolve(cachePath)
									})
								},
								() => resolve(null) // 文件不存在
							)
						})
					}
				} catch (error) {
					console.warn('检查模型缓存失败:', error)
					return null
				}
				return null
			},
			// 保存模型到缓存（APP 端）
			async saveModelToCache(url, arrayBuffer) {
				if (this.isLocalFile(url) || !arrayBuffer) {
					return null
				}
				
				try {
					if (typeof plus !== 'undefined' && plus.io) {
						const cacheKey = this.getCacheKey(url)
						// 使用安全的文件名（移除特殊字符）
						const safeFileName = cacheKey.replace(/[^a-zA-Z0-9]/g, '_') + '.cache'
						const cacheDir = '_doc/model_cache/'
						
						return new Promise((resolve) => {
							// 确保缓存目录存在
							plus.io.resolveLocalFileSystemURL(cacheDir,
								() => {
									// 目录存在，保存文件
									this.writeArrayBufferToFile(cacheDir + safeFileName, arrayBuffer)
										.then(resolve)
										.catch(() => resolve(null))
								},
								() => {
									// 目录不存在，创建目录
									plus.io.resolveLocalFileSystemURL('_doc/',
										(docEntry) => {
											docEntry.getDirectory('model_cache', { create: true, exclusive: false },
												() => {
													this.writeArrayBufferToFile(cacheDir + safeFileName, arrayBuffer)
														.then(resolve)
														.catch(() => resolve(null))
												},
												() => resolve(null)
											)
										},
										() => resolve(null)
									)
								}
							)
						})
					}
				} catch (error) {
					console.warn('保存模型缓存失败:', error)
					return null
				}
				return null
			},
			// 将 ArrayBuffer 写入文件（APP 端）
			writeArrayBufferToFile(filePath, arrayBuffer) {
				return new Promise((resolve, reject) => {
					if (!(typeof plus !== 'undefined' && plus.io)) {
						return reject(new Error('plus.io 不可用'))
					}
					
					plus.io.resolveLocalFileSystemURL(filePath,
						(entry) => {
							// 文件已存在，删除后重新创建
							entry.remove(() => {
								this.createFileWithArrayBuffer(filePath, arrayBuffer).then(resolve).catch(reject)
							}, () => {
								this.createFileWithArrayBuffer(filePath, arrayBuffer).then(resolve).catch(reject)
							})
						},
						() => {
							// 文件不存在，直接创建
							this.createFileWithArrayBuffer(filePath, arrayBuffer).then(resolve).catch(reject)
						}
					)
				})
			},
			// 创建文件并写入 ArrayBuffer
			createFileWithArrayBuffer(filePath, arrayBuffer) {
				return new Promise((resolve, reject) => {
					const pathParts = filePath.split('/')
					const fileName = pathParts.pop()
					const dirPath = pathParts.join('/')
					
					plus.io.resolveLocalFileSystemURL(dirPath,
						(dirEntry) => {
							dirEntry.getFile(fileName, { create: true, exclusive: false },
								(fileEntry) => {
									fileEntry.createWriter((writer) => {
										const blob = new Blob([arrayBuffer])
										writer.write(blob)
										writer.onwriteend = () => resolve(filePath)
										writer.onerror = reject
									}, reject)
								},
								reject
							)
						},
						reject
					)
				})
			},
			// 下载模型文件并返回 ArrayBuffer（支持流式加载和进度回调）
			async downloadModelToArrayBuffer(url, onProgress) {
				return new Promise((resolve, reject) => {
					// 使用 fetch 流式下载（在 renderjs 中可用）
					fetch(url)
						.then(response => {
							if (!response.ok) {
								throw new Error(`HTTP error! status: ${response.status}`)
							}
							
							// 检查 response.body 是否支持流式读取
							if (!response.body || typeof response.body.getReader !== 'function') {
								// 不支持流式读取，直接使用 arrayBuffer
								return response.arrayBuffer().then(arrayBuffer => {
									// 下载成功后保存到缓存
									this.saveModelToCache(url, arrayBuffer).catch(err => {
										console.warn('保存模型缓存失败:', err)
									})
									resolve(arrayBuffer)
								})
							}
							
							// 获取内容长度
							const contentLength = response.headers.get('content-length')
							const total = contentLength ? parseInt(contentLength, 10) : 0
							
							// 如果没有进度回调或无法获取总大小，直接使用 arrayBuffer
							if (!onProgress || !total) {
								return response.arrayBuffer().then(arrayBuffer => {
									// 下载成功后保存到缓存
									this.saveModelToCache(url, arrayBuffer).catch(err => {
										console.warn('保存模型缓存失败:', err)
									})
									resolve(arrayBuffer)
								})
							}
							
							// 流式读取，显示进度
							try {
								const reader = response.body.getReader()
								const chunks = []
								let receivedLength = 0
								
								// 读取流数据
								const readChunk = () => {
									reader.read().then(({ done, value }) => {
										if (done) {
											// 所有数据读取完成，合并 chunks
											const allChunks = new Uint8Array(receivedLength)
											let position = 0
											for (const chunk of chunks) {
												allChunks.set(chunk, position)
												position += chunk.length
											}
											const arrayBuffer = allChunks.buffer
											// 下载成功后保存到缓存
											this.saveModelToCache(url, arrayBuffer).catch(err => {
												console.warn('保存模型缓存失败:', err)
											})
											resolve(arrayBuffer)
										} else {
											chunks.push(value)
											receivedLength += value.length
											
											// 计算并报告进度
											const progress = total > 0 ? (receivedLength / total) * 100 : 0
											onProgress({
												loaded: receivedLength,
												total: total,
												progress: Math.min(progress, 100)
											})
											
											// 继续读取下一块
											readChunk()
										}
									}).catch(err => {
										// 流式读取失败，回退到直接 arrayBuffer
										console.warn('流式读取失败，回退到直接下载:', err)
										// 取消读取器
										reader.cancel().catch(() => {})
										// 重新获取响应
										fetch(url).then(response => response.arrayBuffer()).then(arrayBuffer => {
											this.saveModelToCache(url, arrayBuffer).catch(() => {})
											resolve(arrayBuffer)
										}).catch(reject)
									})
								}
								
								readChunk()
							} catch (err) {
								// 流式读取初始化失败，回退到直接 arrayBuffer
								console.warn('流式读取初始化失败，回退到直接下载:', err)
								response.arrayBuffer().then(arrayBuffer => {
									this.saveModelToCache(url, arrayBuffer).catch(() => {})
									resolve(arrayBuffer)
								}).catch(reject)
							}
						})
						.catch(err => {
							// 确保错误被正确传递
							reject(err)
						})
				})
			},
			// 处理 STL 模型（从 buffer 解析）
			processSTLModel(buffer, loader, loadStartTime, scale, isFixFbxMaterial) {
				const { group } = instance
				let geometry = loader.parse(buffer)
				
				if (geometry.isBufferGeometry) {
					// 直接从 STL 几何体计算包围盒并获取尺寸（只计算一次）
					geometry.computeBoundingBox()
					this.calculateModelDimensions(geometry)
					
					// 使用更轻量的材质以加快渲染
					const material = new THREE.MeshStandardMaterial({
						color: 0xffffff,
						metalness: 0.1,
						roughness: 0.8,
						flatShading: true
					})
					
					const mesh = new THREE.Mesh(geometry, material)
					group.add(mesh)
					
					// 计算加载耗时
					const loadEndTime = performance.now()
					const loadDuration = loadEndTime - loadStartTime
					console.log(`模型加载完成（缓存），耗时: ${loadDuration.toFixed(2)}ms (${(loadDuration / 1000).toFixed(2)}秒)`)
					
					// 延迟执行非关键操作
					requestAnimationFrame(() => {
						this.centerAndScale(1)
						this.$ownerInstance.callMethod('loaded')
					})
				}
			},
			// 处理已加载的模型（非 STL）
			processLoadedModel(res, modelType, scale, isFixFbxMaterial, loadStartTime, modelurl) {
				const { group } = instance
				initAnimation(res)
				
				res = res?.scene || res
				group.add(res)
				
				const ext = modelurl.split('.').pop()
				if (ext === 'fbx' && isFixFbxMaterial) {
					this.fixFbxMaterial(group)
				}
				
				const finalScale = (modelType === 'stl') ? 1 : scale
				this.centerAndScale(finalScale)
				
				if (modelType !== 'stl') {
					this.calculateModelDimensions(res)
				}
				
				const loadEndTime = performance.now()
				const loadDuration = loadEndTime - loadStartTime
				console.log(`模型加载完成（缓存），耗时: ${loadDuration.toFixed(2)}ms (${(loadDuration / 1000).toFixed(2)}秒)`)
				
				this.$ownerInstance.callMethod('loaded')
			},
			// 下载并加载模型（带缓存和进度提示）
			async downloadAndLoadModel(url, modelType, scale, isFixFbxMaterial, loadStartTime, loader) {
				const { group } = instance
				
				// 进度回调函数
				const onProgress = (progressInfo) => {
					// 通知前端显示加载进度（通过 callMethod 调用 Vue 组件方法）
					this.$ownerInstance.callMethod('onLoadProgress', {
						progress: progressInfo.progress,
						loaded: progressInfo.loaded,
						total: progressInfo.total
					})
				}
				
				if (modelType === 'stl') {
					// STL 文件：流式下载为 ArrayBuffer，然后解析
					try {
						const buffer = await this.downloadModelToArrayBuffer(url, onProgress)
						this.processSTLModel(buffer, loader, loadStartTime, scale, isFixFbxMaterial)
					} catch (err) {
						const loadEndTime = performance.now()
						const loadDuration = loadEndTime - loadStartTime
						console.error(`模型加载失败，耗时: ${loadDuration.toFixed(2)}ms (${(loadDuration / 1000).toFixed(2)}秒)`)
						console.error('模型下载失败:', err instanceof Error ? err.message : (err ? JSON.stringify(err) : '未知错误'))
						this.$ownerInstance.callMethod('callback', {
							key: 'loadModel',
							err
						})
					}
				} else {
					// 其他格式：使用 loader 加载（支持进度回调）
					// 对于 GLB/GLTF 等格式，可以先用 fetch 流式下载，再解析
					if (modelType === 'glb' || modelType === 'gltf') {
						// GLB/GLTF：先流式下载，再使用 loader.parse 解析
						try {
							const buffer = await this.downloadModelToArrayBuffer(url, onProgress)
							// 使用 loader.parse 解析 buffer（异步）
							// 注意：缓存已在 downloadModelToArrayBuffer 中保存，这里不需要重复保存
							loader.parse(buffer, '', (gltf) => {
								this.processLoadedModel(gltf, modelType, scale, isFixFbxMaterial, loadStartTime, url)
							}, (err) => {
								const loadEndTime = performance.now()
								const loadDuration = loadEndTime - loadStartTime
								console.error(`模型解析失败，耗时: ${loadDuration.toFixed(2)}ms (${(loadDuration / 1000).toFixed(2)}秒)`)
								console.error('模型解析失败:', err)
								this.$ownerInstance.callMethod('callback', {
									key: 'loadModel',
									err: err instanceof Error ? err.message : String(err)
								})
							})
						} catch (err) {
							// 如果流式下载失败，回退到 loader.load
							console.warn('流式下载失败，使用传统方式加载:', err)
							// 直接使用 loader.load，不尝试流式下载
							loader.load(url, res => {
								this.processLoadedModel(res, modelType, scale, isFixFbxMaterial, loadStartTime, url)
								// 尝试下载并缓存（异步，不影响加载）
								fetch(url).then(response => {
									if (response.ok) {
										return response.arrayBuffer()
									}
									throw new Error(`HTTP error! status: ${response.status}`)
								}).then(buffer => {
									this.saveModelToCache(url, buffer).catch(() => {})
								}).catch(() => {
									// 缓存失败不影响模型显示
								})
							}, onProgress ? (progress) => {
								// 如果 loader 支持进度回调
								if (progress && progress.total > 0) {
									onProgress({
										loaded: progress.loaded,
										total: progress.total,
										progress: (progress.loaded / progress.total) * 100
									})
								}
							} : null, (loadErr) => {
								const loadEndTime = performance.now()
								const loadDuration = loadEndTime - loadStartTime
								console.error(`模型加载失败，耗时: ${loadDuration.toFixed(2)}ms (${(loadDuration / 1000).toFixed(2)}秒)`)
								console.error('模型加载失败:', loadErr)
								// 确保错误信息被正确传递
								const errorMessage = loadErr instanceof Error ? loadErr.message : (loadErr ? String(loadErr) : '未知错误')
								this.$ownerInstance.callMethod('callback', {
									key: 'loadModel',
									err: errorMessage
								})
							})
						}
					} else {
						// 其他格式：使用 loader 加载，并在加载成功后缓存
						loader.load(url, res => {
							this.processLoadedModel(res, modelType, scale, isFixFbxMaterial, loadStartTime, url)
							// 对于非 STL 文件，尝试下载并缓存原始文件
							fetch(url).then(response => response.arrayBuffer()).then(buffer => {
								this.saveModelToCache(url, buffer).catch(err => {
									console.warn('保存模型缓存失败:', err)
								})
							}).catch(() => {
								// 缓存失败不影响模型显示
							})
						}, onProgress ? (progress) => {
							// 如果 loader 支持进度回调
							if (progress.total > 0) {
								onProgress({
									loaded: progress.loaded,
									total: progress.total,
									progress: (progress.loaded / progress.total) * 100
								})
							}
						} : null, (err) => {
							const loadEndTime = performance.now()
							const loadDuration = loadEndTime - loadStartTime
							console.error(`模型加载失败，耗时: ${loadDuration.toFixed(2)}ms (${(loadDuration / 1000).toFixed(2)}秒)`)
							console.error('模型加载失败:', err instanceof Error ? err.message : (err ? JSON.stringify(err) : '未知错误'))
							this.$ownerInstance.callMethod('callback', {
								key: 'loadModel',
								err: err instanceof Error ? err.message : (err ? JSON.stringify(err) : '未知错误')
							})
						})
					}
				}
			},
			loadModel() {
				const {
					modelurl,
					scale,
					isFixFbxMaterial,
					modelType
				} = this.props


				const {
					controls,
					group
				} = instance
				controls.reset() // 重置视角

				;
				[...group.children].forEach(c => { // 切换模型需要删除上一个模型
					c.removeFromParent()
					// group.remove(c)
				})

				const loader = this.getLoader(modelurl, modelType)

				if (!loader) {
					console.error('无法获取加载器，模型类型:', modelType, 'URL:', modelurl)
					this.$ownerInstance.callMethod('callback', {
						key: 'loadModel',
						err: new Error(`不支持的文件格式: ${modelType || '未知'}`)
					})
					return
				}
				
				// 减少日志输出以提升性能（生产环境可完全移除）
				// console.log('开始加载模型:', { modelurl, modelType, loaderType: loader.constructor.name })
				
				// 记录加载开始时间
				const loadStartTime = performance.now()
				
				const isLocal = this.isLocalFile(modelurl)
				
				// 优化：快速检查缓存，超时则直接网络下载（非本地文件）
				if (!isLocal) {
					let loadingStarted = false
					
					// 设置缓存检查超时（150ms），超时则直接使用网络，不等待缓存
					const cacheCheckTimeout = setTimeout(() => {
						if (!loadingStarted) {
							loadingStarted = true
							// 缓存检查超时，直接网络下载
							this.downloadAndLoadModel(modelurl, modelType, scale, isFixFbxMaterial, loadStartTime, loader)
						}
					}, 150)
					
					// 快速检查缓存（跳过过期检查以加快速度）
					this.getCachedModelPath(modelurl, true).then(cachedPath => {
						clearTimeout(cacheCheckTimeout)
						
						if (loadingStarted) {
							return // 已经开始网络下载，不再使用缓存
						}
						
						if (cachedPath) {
							loadingStarted = true
							
							// 优化：对于所有格式，都先读取为ArrayBuffer，然后使用parse()方法
							// 这样可以避免loader.load()的额外处理开销
							if (modelType === 'stl') {
								// STL 文件从缓存加载
								this.readLocalFileToArrayBuffer(cachedPath).then(buffer => {
									this.processSTLModel(buffer, loader, loadStartTime, scale, isFixFbxMaterial)
								}).catch(err => {
									console.warn('从缓存加载模型失败，使用网络下载:', err)
									this.downloadAndLoadModel(modelurl, modelType, scale, isFixFbxMaterial, loadStartTime, loader)
								})
							} else if (modelType === 'glb' || modelType === 'gltf') {
								// GLB/GLTF：读取ArrayBuffer后使用parse()，比load()更快
								this.readLocalFileToArrayBuffer(cachedPath).then(buffer => {
									loader.parse(buffer, '', (gltf) => {
										this.processLoadedModel(gltf, modelType, scale, isFixFbxMaterial, loadStartTime, modelurl)
									}, (err) => {
										console.warn('从缓存解析模型失败，使用网络下载:', err)
										this.downloadAndLoadModel(modelurl, modelType, scale, isFixFbxMaterial, loadStartTime, loader)
									})
								}).catch(err => {
									console.warn('从缓存读取模型失败，使用网络下载:', err)
									this.downloadAndLoadModel(modelurl, modelType, scale, isFixFbxMaterial, loadStartTime, loader)
								})
							} else {
								// 其他格式：尝试使用load()加载（兼容性考虑）
								// 但先尝试读取ArrayBuffer（如果loader支持parse）
								const localPath = plus.io.convertLocalFileSystemURL(cachedPath)
								loader.load(localPath, res => {
									this.processLoadedModel(res, modelType, scale, isFixFbxMaterial, loadStartTime, modelurl)
								}, null, (err) => {
									console.warn('从缓存加载模型失败，使用网络下载:', err)
									this.downloadAndLoadModel(modelurl, modelType, scale, isFixFbxMaterial, loadStartTime, loader)
								})
							}
						} else {
							// 缓存不存在，下载并缓存
							if (!loadingStarted) {
								loadingStarted = true
								this.downloadAndLoadModel(modelurl, modelType, scale, isFixFbxMaterial, loadStartTime, loader)
							}
						}
					}).catch(() => {
						clearTimeout(cacheCheckTimeout)
						// 缓存检查失败，如果还没开始加载，则下载
						if (!loadingStarted) {
							loadingStarted = true
							this.downloadAndLoadModel(modelurl, modelType, scale, isFixFbxMaterial, loadStartTime, loader)
						}
					})
					
					return
				}
				
				// 本地 STL：用 FileSystemManager 读取 ArrayBuffer 再 parse，避免 fetch file://
				if (isLocal && modelType === 'stl') {
					this.readLocalFileToArrayBuffer(modelurl).then(buffer => {
						let geometry = loader.parse(buffer)
						// 减少日志输出以提升性能
						// console.log('本地 STL 解析成功，结果类型:', geometry.constructor.name, 'isBufferGeometry:', geometry.isBufferGeometry)
						
						if (geometry.isBufferGeometry) {
							// 优化几何体：合并重复顶点（可选，可能稍微慢一点但能减少内存）
							// geometry = THREE.BufferGeometryUtils.mergeVertices(geometry)
							
							// 直接从 STL 几何体计算包围盒并获取尺寸（只计算一次）
							geometry.computeBoundingBox()
							this.calculateModelDimensions(geometry)
							
							// 使用更轻量的材质以加快渲染（如果不需要光照效果）
							const material = new THREE.MeshStandardMaterial({
								color: 0xffffff,
								metalness: 0.1,
								roughness: 0.8,
								flatShading: true // 平面着色，稍微快一点
							})
							
							const mesh = new THREE.Mesh(geometry, material)
							
							// 先添加到场景，让用户看到模型
							group.add(mesh)
							
							// 计算加载耗时
							const loadEndTime = performance.now()
							const loadDuration = loadEndTime - loadStartTime
							console.log(`模型加载完成，耗时: ${loadDuration.toFixed(2)}ms (${(loadDuration / 1000).toFixed(2)}秒)`)
							
							// 延迟执行非关键操作，使用 requestAnimationFrame 分批处理
							requestAnimationFrame(() => {
								// 居中和对齐（在下一帧执行）
								this.centerAndScale(1) // STL 文件保持原始大小，不缩放
								
								// 通知加载完成
								this.$ownerInstance.callMethod('loaded')
							})
						}
					}).catch(err => {
						// 计算加载耗时（失败时）
						const loadEndTime = performance.now()
						const loadDuration = loadEndTime - loadStartTime
						console.error(`模型加载失败，耗时: ${loadDuration.toFixed(2)}ms (${(loadDuration / 1000).toFixed(2)}秒)`)
						console.error('本地 STL 读取/解析失败:', err instanceof Error ? err.message : (err ? JSON.stringify(err) : '未知错误'))
						this.$ownerInstance.callMethod('callback', {
							key: 'loadModel',
							err
						})
					})
					return
				}
				
				loader.load(modelurl, res => {
					// 减少日志输出以提升性能
					// console.log('模型加载成功，结果类型:', res.constructor.name, 'isBufferGeometry:', res.isBufferGeometry)
					
					initAnimation(res)
					// STL 文件返回的是 Geometry，需要包装成 Mesh
					if (modelType === 'stl' && res.isBufferGeometry) {
						// console.log('STL 文件，优化加载流程')
						
						// 优化几何体：合并重复顶点（可选，可能稍微慢一点但能减少内存）
						// res = THREE.BufferGeometryUtils.mergeVertices(res)
						
						// 直接从 STL 几何体计算包围盒并获取尺寸（只计算一次）
						res.computeBoundingBox()
						this.calculateModelDimensions(res)
						
						// 使用更轻量的材质以加快渲染（如果不需要光照效果）
						const material = new THREE.MeshStandardMaterial({
							color: 0xffffff,
							metalness: 0.1,
							roughness: 0.8,
							flatShading: true // 平面着色，稍微快一点
						})
						
						const mesh = new THREE.Mesh(res, material)
						
						// 先添加到场景，让用户看到模型
						group.add(mesh)
						
						// 计算加载耗时
						const loadEndTime = performance.now()
						const loadDuration = loadEndTime - loadStartTime
						console.log(`模型加载完成，耗时: ${loadDuration.toFixed(2)}ms (${(loadDuration / 1000).toFixed(2)}秒)`)
						
						// 延迟执行非关键操作，使用 requestAnimationFrame 分批处理
						requestAnimationFrame(() => {
							// 居中和对齐（在下一帧执行）
							this.centerAndScale(1) // STL 文件保持原始大小，不缩放
							
							// 通知加载完成
							this.$ownerInstance.callMethod('loaded')
						})
					} else {
					res = res?.scene || res
						// 减少日志输出以提升性能
						// console.log('添加到场景，对象类型:', res.constructor.name)
					group.add(res)
					const ext = modelurl.split('.').pop()
					if (ext === 'fbx' && isFixFbxMaterial) {
						this.fixFbxMaterial(group)
					}
					// STL 文件保持原始大小，其他格式可以使用 scale
					const finalScale = (modelType === 'stl') ? 1 : scale
					this.centerAndScale(finalScale)
					// 对于非 STL 文件，计算尺寸
					if (modelType !== 'stl') {
						this.calculateModelDimensions(res)
					}
						
						// 计算加载耗时
						const loadEndTime = performance.now()
						const loadDuration = loadEndTime - loadStartTime
						console.log(`模型加载完成，耗时: ${loadDuration.toFixed(2)}ms (${(loadDuration / 1000).toFixed(2)}秒)`)
						
					this.$ownerInstance.callMethod('loaded')
					}
				}, null, (err) => {
					// 计算加载耗时（失败时）
					const loadEndTime = performance.now()
					const loadDuration = loadEndTime - loadStartTime
					console.error(`模型加载失败，耗时: ${loadDuration.toFixed(2)}ms (${(loadDuration / 1000).toFixed(2)}秒)`)
					console.error('模型加载失败:', err instanceof Error ? err.message : (err ? JSON.stringify(err) : '未知错误'))
					/*
					console.error('错误详情:', {
						message: err.message,
						stack: err.stack,
						modelurl,
						modelType
					})
					*/
					this.$ownerInstance.callMethod('callback', {
						key: 'loadModel',
						err: err instanceof Error ? err.message : (err ? JSON.stringify(err) : '未知错误')
					})
				})
			},
			async playAnimation({
				animationName,
				needReverse = false,
				attr = {}
			}) {
				const {
					group,
				} = instance
				const [model] = [...group.children]
				await animation.play(model, animationName, needReverse, attr)
			},
			update() {
				if (!Object.keys(instance).length) {
					return
				}
				const {
					props
				} = this;
				const {
					controls
				} = instance
				if (controls) {
					controls.autoRotate = props.autoRotate
					controls.autoRotateSpeed = props.autoRotateSpeed
					// 始终允许旋转视角（触摸模型拖动，触摸空白处旋转视角）
					controls.enableRotate = true
				}
			},

			// 模型点击
			onClick() {
				// 点击相关
				const rect = container.getBoundingClientRect()
				events.setOptions({
					camera: instance.camera,
					rect
				})


				const seleObj = ({
					object
				}) => {
					// 让模型闪一下红色
					if (object.userData?.active) return
					object.userData.active = true
					const m = object.material
					const activeColor = new THREE.Color(0xff0000)
					if (m.color.getHex() == activeColor.getHex()) { // 如果模型本身就是红色，那就闪绿色
						activeColor.set(0x00ff0f)
					}
					m.colorOld = m.color.getHex()
					setTimeout(() => {
						m.color.set(activeColor)
					}, 30)
					setTimeout(() => {
						m.color.set(m.colorOld)
						object.userData.active = false
					}, 800)

				}
				// 点击模型事件，我这里是点击机器人的眼睛
				// 第一个参数是个数组，每项是Object3D
				// 第二个参数是个回调，返回此次屏幕发出的射线所命中的mesh数组
				const remove = events.onClickMesh(instance.group.children, (intersects) => {
					// 需要根据自己的业务逻辑来找到对应的mesh
					let isSele = false;
					// 注意：隐藏的模型还是可以命中的，即object.visible == false 也会被命中
					// 命中的都是mesh，你需要的可能是某个mesh的parent，根据自己的业务逻辑寻找
					for (let i = 0; i < intersects.length; i++) {
						const {
							object
						} = intersects[i]
						if (!object.visible) {
							continue
						}
						// 如果第一个不是隐藏的模型，不是眼镜就是没有点击到我要找的mesh
						if (!["Head_4"].includes(object
								.name)) {
							return
						}
						seleObj(intersects[i])
						if (isSele) break
					}
				})

			},
			init(props) {
				if (this.isInit) {
					const prevUrl = this.props.modelurl
					this.props = props // 保证触摸回调里 enableModelDrag 等是最新
					// 播放动画
					if (!!props.playOptions?.animationName) {
						this.playAnimation(props.playOptions)
						return
					}
					// 切换模型
					if (props.modelurl && props.modelurl !== prevUrl) {
						this.loadModel()
					}
					this.update()
					return
				}
				
				const container = document.querySelector('#container')
				let {
					width,
					height
				} = container.getBoundingClientRect()
				console.log('容器尺寸: width=' + width + ', height=' + height)
				
				// 如果容器尺寸为0，延迟初始化
				if (width === 0 || height === 0) {
					console.log('容器尺寸为0，延迟初始化...')
					setTimeout(() => {
						this.init(props)
					}, 100)
					return
				}
				
				this.isInit = true
				this.props = props
				
				const renderer = new THREE.WebGLRenderer({
					preserveDrawingBuffer: true, // 设置 canvas 可toDataURL
					antialias: true,
					alpha: true,
					logarithmicDepthBuffer: true,
					powerPreference: "high-performance" // 优化性能
				})

				renderer.toneMapping = THREE.ACESFilmicToneMapping;
				renderer.toneMappingExposure = 1
				// 如果使用133版本需要修改SRGBColorSpace
				renderer.outputEncoding = THREE.SRGBColorSpace

				renderer.setSize(width, height)
				// 使用设备像素比，但限制最大值以避免线条模糊
				const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
				renderer.setPixelRatio(pixelRatio)
				// APP 端：让 canvas 接收触摸，跟手拖动/旋转/缩放
				renderer.domElement.style.touchAction = 'none'
				renderer.domElement.style.userSelect = 'none'
				renderer.domElement.style.webkitUserSelect = 'none'
				container.appendChild(renderer.domElement)

				const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
				camera.up.set(0, 0, 1) // 设置 Z 轴向上
				// 初始视角：前左上方略带俯视，模型朝向屏幕右下
				camera.position.set(-120, -180, 100)
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

				const controls = new OrbitControls(camera, renderer.domElement);
				// 设置旋转中心为正方体中心 (0, 0, 50)
				controls.target.set(0, 0, 50)
				camera.lookAt(controls.target)
				controls.update()
				
				controls.enablePan = this.props.enablePan !== undefined ? this.props.enablePan : false // 根据props控制平移
				controls.screenSpacePanning = true // 平移在屏幕空间，APP 上跟手更自然
				controls.enableDamping = true //惯性
				controls.dampingFactor = 0.05 // 阻尼系数，控制惯性效果
				// 始终允许旋转视角（触摸模型时拖动模型，触摸空白处旋转视角）
				controls.enableRotate = true
				controls.rotateSpeed = 1.0 // 旋转速度
				controls.enableZoom = true // 启用缩放（双指 pinch）
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
				controls.autoRotate = props.autoRotate;
				controls.autoRotateSpeed = props.autoRotateSpeed

				Object.assign(instance, {
					container, // canvas 父容器
					camera,
					scene,
					clock,
					group,
					renderer,
					controls,
				})
				
				// 初始化多模型管理
				instance.modelGroups = [group]
				instance.selectedGroup = group

				// 单指拖动模型：选中时用平面射线交点移动 group
				this.setupModelDragListeners()

				const render = () => {
					controls.update()
					renderer.render(scene, camera);
				}

				const animate = () => {
					const t = clock.getDelta()
					animation.update(t)
					this.frameId = requestAnimationFrame(animate)
					render()
				}
				animate()
				this.setEnv()
				this.loadModel()
				this.onClick()

			},
			// 选中模型时单指拖动：用「像素位移→世界位移」增量移动，跟手
			setupModelDragListeners() {
				const el = instance.renderer && instance.renderer.domElement
				if (!el) return
				const { camera, group, renderer } = instance
				const DRAG_THRESHOLD_PX = 8
				const dragState = {
					isDragging: false,
					startX: 0,
					startY: 0,
					lastX: 0,
					lastY: 0
				}
				instance.dragState = dragState

				// 根据透视相机和画布尺寸，把像素位移换算成世界位移（在模型所在平面）
				const pixelToWorldScale = () => {
					const rect = renderer.domElement.getBoundingClientRect()
					const h = rect.height
					const w = rect.width
					if (h <= 0 || w <= 0) return 0
					// 使用选中的 group 或主 group
					const targetGroup = instance.selectedGroup || group
					// 获取模型实际中心位置（考虑模型当前的变换）
					const box = new THREE.Box3().setFromObject(targetGroup)
					const center = new THREE.Vector3()
					box.getCenter(center)
					const d = camera.position.distanceTo(center)
					const fovRad = (camera.fov * Math.PI) / 180
					// 屏幕高度对应世界高度 ≈ 2 * d * tan(fov/2)
					const worldPerPixel = (2 * d * Math.tan(fovRad / 2)) / h
					return worldPerPixel
				}

				const onTouchStart = (e) => {
					if (!this.props.enableModelDrag || e.touches.length !== 1) return
					
					// 射线检测：判断触摸点是否命中模型
					const allGroups = (instance.modelGroups || [group]).filter(g => g && g.children.length > 0)
					if (allGroups.length === 0) return
					
					const touch = e.touches[0]
					const rect = renderer.domElement.getBoundingClientRect()
					const mouse = new THREE.Vector2(
						((touch.clientX - rect.left) / rect.width) * 2 - 1,
						-((touch.clientY - rect.top) / rect.height) * 2 + 1
					)
					const raycaster = new THREE.Raycaster()
					raycaster.setFromCamera(mouse, camera)
					
					const meshes = []
					allGroups.forEach(g => g.traverse(child => {
						if (child.isMesh && child.visible) meshes.push(child)
					}))
					
					const intersects = raycaster.intersectObjects(meshes, false)
					
					if (intersects.length === 0) {
						// 未命中模型，不启用拖动，让 OrbitControls 处理旋转
						dragState.hitModel = false
						return
					}
					
					// 命中模型，启用拖动，禁用 OrbitControls 旋转
					dragState.hitModel = true
					dragState.isDragging = false
					dragState.startX = touch.clientX
					dragState.startY = touch.clientY
					dragState.lastX = dragState.startX
					dragState.lastY = dragState.startY
					// 命中模型时立即禁用旋转，防止视角转动
					if (instance.controls) instance.controls.enableRotate = false
				}

				const onTouchMove = (e) => {
					if (!this.props.enableModelDrag || e.touches.length !== 1) return
					// 未命中模型，不拦截事件，让 OrbitControls 旋转视角
					if (!dragState.hitModel) return
					
					const x = e.touches[0].clientX
					const y = e.touches[0].clientY
					const dx = x - dragState.startX
					const dy = y - dragState.startY
					const dist = Math.sqrt(dx * dx + dy * dy)
					if (!dragState.isDragging && dist > DRAG_THRESHOLD_PX) {
						dragState.isDragging = true
						dragState.lastX = dragState.startX
						dragState.lastY = dragState.startY
					}
					if (dragState.isDragging) {
						const deltaPxX = x - dragState.lastX
						const deltaPxY = y - dragState.lastY
						dragState.lastX = x
						dragState.lastY = y
						const scale = pixelToWorldScale()
						
						// 屏幕X轴在世界空间的投影：相机坐标系的X轴
						// 屏幕Y轴在世界空间的投影：相机坐标系的Y轴（向下为正）
						const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
						const camDown = new THREE.Vector3(0, -1, 0).applyQuaternion(camera.quaternion)
						
						// 屏幕X右移 = 沿camRight方向，屏幕Y下移 = 沿camDown方向
						const worldDelta = new THREE.Vector3()
						worldDelta.addScaledVector(camRight, deltaPxX * scale)
						worldDelta.addScaledVector(camDown, deltaPxY * scale)
						
						// 移动选中的 group，如果没有选中则移动主 group
						const targetGroup = instance.selectedGroup || group
						targetGroup.position.x += worldDelta.x
						targetGroup.position.y += worldDelta.y
						// Z轴保持不变，模型始终在底部
						
						// 更新包围框位置和颜色
						this.updateBoundingBox()
						
						e.preventDefault()
						e.stopPropagation()
					}
				}

				const onTouchEnd = (e) => {
					if (e.touches.length === 0) {
						dragState.isDragging = false
						dragState.hitModel = false
						// 拖动结束，恢复旋转视角
						if (instance.controls) instance.controls.enableRotate = true
						// 拖动结束后最后更新一次包围框
						this.updateBoundingBox()
					}
				}

				el.addEventListener('touchstart', onTouchStart, { capture: true, passive: true })
				el.addEventListener('touchmove', onTouchMove, { capture: true, passive: false })
				el.addEventListener('touchend', onTouchEnd, { capture: true, passive: false })
				el.addEventListener('touchcancel', onTouchEnd, { capture: true, passive: false })
			},
		},
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

	/* APP 端：整块 3D 区域可跟手拖动，不触发页面滚动 */
	.stage-app-touch,
	.container-touch {
		touch-action: none;
		-webkit-user-select: none;
		user-select: none;
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