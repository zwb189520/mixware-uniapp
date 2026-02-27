import * as THREE from '../lib.js'
import {
	GLTFLoader,
	RGBELoader,
	OBJLoader,
	FBXLoader,
	STLLoader
} from '../lib.js'
// EXT_meshopt_compression模型压缩相关
// https://blog.csdn.net/whl0071/article/details/127864929
// npm i -g gltfpack
// gltfpack -i model.glb -o out.glb -cc
// use
// https://github.com/deepkolos/platformize/blob/main/examples/tests-three/MeshOpt.ts
// js版本
import {
	MeshoptDecoder
} from './meshopt/meshopt_decoder.asm.module.js'
// wasm版本,仅支持微小程序
// 需要手动将decoder_base.wasm复制到打包之后的/pages/index目录下，或者vite指定文件不参与构建，或者实现一个plugin自动复制
// import { MeshoptDecoder } from './meshopt/meshopt_decoder.wasm.module.js'

import {
	animation,
	initAnimation
} from './animation'




// const gltfLoader = new GLTFLoader()
// gltfLoader.setMeshoptDecoder(MeshoptDecoder);
// 这两行需要在PLATFORM.set 设置后执行
export const initLoader = () => {

	const gltfLoader = new GLTFLoader()
	// MeshoptDecoder.setWasmPath('/pages/index/decoder_base.wasm');  // wasm版本,仅支持微小程序
	gltfLoader.setMeshoptDecoder(MeshoptDecoder);



	// 加载glb模型,url 是资源在线地址或者buffer
	const loadGlb = (url, callback = () => {}) => {
		// 如果传入的url不是string会被当成buffer看待
		const isArrayBuffer = typeof url !== 'string'
		return new Promise(async (resolve, reject) => {
			try {
				if (isArrayBuffer) {
					gltfLoader.parse(url, "", (gltf) => {
						initAnimation(gltf)
						callback && callback(gltf)
						resolve(gltf)
					}, (err) => {
						reject(err)
					})
				} else {
					const gltf = await gltfLoader.loadAsync(url)
					initAnimation(gltf)
					callback && callback(gltf)
					resolve(gltf)
				}

			} catch (error) {
				reject(error)
			}

		})
	}


	// 加载其他格式的模型
	const loadOtherModel = (url, callback = () => {}, type) => {
		let loader;
		return new Promise((resolve, reject) => {
			try {
				switch (type) {
					case 'obj':
						loader = new OBJLoader()
						break;
					case 'fbx':
						loader = new FBXLoader()
						break;
					case 'stl':
						loader = new STLLoader()
						break;
					default:
						reject(new Error(`暂不支持${type}格式`))
						return;
				}
				
				if (!loader) {
					reject(new Error(`无法创建 ${type} 加载器`))
					return;
				}
				
				console.log(`开始加载 ${type} 模型:`, url)
				
				// 记录加载开始时间
				const loadStartTime = performance.now()
				
				loader.load(url, (result) => {
					console.log(`${type} 模型加载成功，结果类型:`, result.constructor.name, 'isBufferGeometry:', result.isBufferGeometry)
					
					// 计算加载耗时
					const loadEndTime = performance.now()
					const loadDuration = loadEndTime - loadStartTime
					console.log(`${type} 模型加载完成，耗时: ${loadDuration.toFixed(2)}ms (${(loadDuration / 1000).toFixed(2)}秒)`)
					
					// STL 文件返回的是 Geometry，需要包装成 Mesh
					if (type === 'stl' && result.isBufferGeometry) {
						// 优化：使用平面着色以加快渲染
						const material = new THREE.MeshStandardMaterial({
							color: 0xffffff,
							metalness: 0.1,
							roughness: 0.8,
							flatShading: true // 平面着色，稍微快一点
						})
						const mesh = new THREE.Mesh(result, material)
						console.log('STL Geometry 已包装成 Mesh（已优化）')
						callback && callback(mesh)
						resolve(mesh)
					} else {
						callback && callback(result)
						resolve(result)
					}
				}, null, (err) => {
					// 计算加载耗时（失败时）
					const loadEndTime = performance.now()
					const loadDuration = loadEndTime - loadStartTime
					console.error(`${type} 模型加载失败，耗时: ${loadDuration.toFixed(2)}ms (${(loadDuration / 1000).toFixed(2)}秒)`)
					console.error(`${type} 模型加载失败:`, err)
					console.error('错误详情:', {
						message: err.message,
						stack: err.stack,
						url,
						type
					})
					reject(err)
				})
			} catch (error) {
				console.error(`创建 ${type} 加载器失败:`, error)
				reject(error)
			}
		})
	}

	// 加载hdr
	const loadHdr = async (url, callback) => {
		return new Promise((resolve, reject) => {
			new RGBELoader().load(url, texture => {
				texture.mapping = THREE.EquirectangularReflectionMapping;
				callback && callback(texture)
				resolve(texture)
			}, null, err => reject(err))
		})
	}
	// 加载普通图片
	const loadTexture = async (url, callback) => {
		return new Promise((resolve, reject) => {
			new THREE.TextureLoader().load(url, texture => {
				texture.minFilter = THREE.LinearFilter
				texture.mapping = THREE.EquirectangularReflectionMapping;
				// 小程序和h5色差问题
				// #ifdef MP
				texture.encoding = THREE.sRGBEncoding;
				// #endif

				// #ifndef MP
				texture.colorSpace = THREE.SRGBColorSpace
				// #endif

				callback && callback(texture)
				resolve(texture)
			}, null, err => reject(err))
		})
	}

	const load = async (url, callback = () => {}, resType = '') => {

		if (resType == '') {
			// 获取url后缀
			const suffix = url.split('.').pop()
			resType = suffix || 'glb'
			// 判断是不是图片，如果是图片重置为texture
			if (suffix == 'jpg' || suffix == 'png') {
				resType = 'texture'
			}
		}

		resType = resType.toLocaleLowerCase()

		switch (resType) {
			case 'glb':
				return loadGlb(url, callback)
				break;
			case 'gltf':
				return loadGlb(url, callback)
				break;
			case 'hdr':
				return loadHdr(url, callback)
				break;
			case 'texture':
				return loadTexture(url, callback)
				break
			default:
				return loadOtherModel(url, callback, resType)
				// throw new Error(`暂不支持${resType}格式`)
				break;
		}
	}

	const setPath = (path) => {
		gltfLoader.setPath(path)
	}

	return {
		load,
		setPath
	}
}