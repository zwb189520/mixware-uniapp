import {
	MeshRefractionMaterial as MeshRefractionMaterialImpl
} from '../materials/MeshRefractionMaterial.js'
import {
	MeshBVHUniformStruct,
	MeshBVH,
	SAH
} from 'three-mesh-bvh'

import {
	useThreeJs
} from '../../index.js'

const {
	useLoop,
	getInstance,
	useDispose
} = useThreeJs()

// 辅助函数：判断是否为立方体纹理
const isCubeTexture = (def) => def && def.isCubeTexture

class MeshRefractionMaterial {
	constructor({
		aberrationStrength = 0,
		fastChroma = true,
		envMap,
		...props
	} = {}) {
		// 创建材质实例
		this.material = new MeshRefractionMaterialImpl()

		// 存储属性
		this.aberrationStrength = aberrationStrength
		this.fastChroma = fastChroma
		this.envMap = envMap
		this.props = props

		// 初始化
		this._initialized = false


		useLoop(() => this.update())
		useDispose(() => this.dispose())
	}

	// 初始化材质（需要在Three.js场景设置后调用）
	initialize(geometry) {
		if (this._initialized) return

		const {
			renderer,
			camera
		} = getInstance()

		this._renderer = renderer
		this._camera = camera

		// 计算defines
		const defines = this._computeDefines()

		// 设置材质属性
		this.material.defines = {
			// ...this.material.defines,
			...defines
		}
		this.material.aberrationStrength = this.aberrationStrength
		this.material.envMap = this.envMap

		// 设置分辨率
		const size = this._getRendererSize()
		this.material.resolution = [size.width, size.height]
		// 设置其他属性
		Object.assign(this.material, this.props)

		// 初始化BVH
		this._initializeBVH(geometry)

		this._initialized = true
	}

	// 每帧更新（需要在渲染循环中调用）
	update() {
		if (!this._initialized || !this._camera) return
		this.material.viewMatrixInverse = this._camera.matrixWorld
		this.material.projectionMatrixInverse = this._camera.projectionMatrixInverse

		// 更新分辨率（如果窗口大小改变）
		const size = this._getRendererSize()
		this.material.resolution = [size.width, size.height]
	}

	// 获取材质实例
	getMaterial(geometry) {
		if (!this._initialized && geometry) {
			this.initialize(geometry)
		}
		return this.material
	}

	// 更新环境贴图
	setEnvMap(envMap) {
		this.envMap = envMap
		this.material.envMap = envMap

		// 重新计算defines
		const defines = this._computeDefines()
		this.material.defines = {
			...this.material.defines,
			...defines
		}
		this.material.needsUpdate = true
	}

	// 私有方法：计算defines
	_computeDefines() {
		const temp = {}

		// Sampler2D and SamplerCube需要不同的defines
		const isCubeMap = isCubeTexture(this.envMap)
		const w = isCubeMap ? this.envMap.image[0]?.width || 1024 : this.envMap?.image?.width || 1024

		const cubeSize = w / 4
		const _lodMax = Math.floor(Math.log2(cubeSize))
		const _cubeSize = Math.pow(2, _lodMax)
		const width = 3 * Math.max(_cubeSize, 16 * 7)
		const height = 4 * _cubeSize

		if (isCubeMap) temp.ENVMAP_TYPE_CUBEM = ''
		temp.CUBEUV_TEXEL_WIDTH = `${1.0 / width}`
		temp.CUBEUV_TEXEL_HEIGHT = `${1.0 / height}`
		temp.CUBEUV_MAX_MIP = `${_lodMax}.0`

		// 添加色差相关的defines
		if (this.aberrationStrength > 0) temp.CHROMATIC_ABERRATIONS = ''
		if (this.fastChroma) temp.FAST_CHROMA = ''

		return temp
	}

	// 私有方法：获取渲染器尺寸
	_getRendererSize() {
		if (!this._renderer) {
			return {
				width: 800,
				height: 600
			} // 默认尺寸
		}

		return {
			width: this._renderer.domElement.width,
			height: this._renderer.domElement.height
		}
	}

	// 私有方法：初始化BVH
	_initializeBVH(geometry) {
		if (!geometry) {
			console.warn('MeshRefractionMaterial: No geometry provided for BVH initialization')
			return
		}

		try {
			this.material.bvh = new MeshBVHUniformStruct()
			const bvh = new MeshBVH(geometry.clone().toNonIndexed(), {
				strategy: SAH
			})
			this.material.bvh.updateFrom(bvh)
		} catch (error) {
			console.error('MeshRefractionMaterial: Failed to initialize BVH', error)
		}
	}

	// 清理资源
	dispose() {
		if (this.material) {
			this.material.dispose()
		}
	}
}

export {
	MeshRefractionMaterial
}