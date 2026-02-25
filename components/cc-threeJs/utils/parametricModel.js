/**
 * 参数化3D模型生成工具
 * 支持动态生成可编辑的3D模型（如钥匙扣、文字雕刻等）
 */

import * as THREE from 'three'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'

/**
 * 方案1: 客户端生成 - 使用 Three.js TextGeometry 生成3D文字
 * 优点：实时预览，无需服务端
 * 缺点：字体文件较大，复杂模型性能有限
 */
export class ParametricModelGenerator {
	constructor(scene) {
		this.scene = scene
		this.fonts = {} // 缓存加载的字体
		this.currentModel = null // 当前生成的模型
	}

	/**
	 * 加载字体文件
	 * @param {string} fontPath - 字体JSON文件路径
	 * @param {string} fontName - 字体名称（用于缓存）
	 * @returns {Promise<THREE.Font>}
	 */
	async loadFont(fontPath, fontName) {
		if (this.fonts[fontName]) {
			return this.fonts[fontName]
		}

		return new Promise((resolve, reject) => {
			const loader = new FontLoader()
			loader.load(
				fontPath,
				(font) => {
					this.fonts[fontName] = font
					resolve(font)
				},
				undefined,
				reject
			)
		})
	}

	/**
	 * 生成钥匙扣模型（基础形状 + 文字）
	 * @param {Object} options - 配置选项
	 * @param {string} options.text - 文字内容
	 * @param {string} options.fontName - 字体名称
	 * @param {Object} options.size - 尺寸 {width, height, depth, thickness}
	 * @param {Object} options.textOptions - 文字选项 {size, depth, bevelEnabled, bevelThickness, bevelSize}
	 * @returns {THREE.Group} 返回模型组
	 */
	async generateKeychain(options = {}) {
		const {
			text = '李',
			fontName = 'SourceHanSans',
			size = {
				width: 30,  // mm
				height: 34, // mm
				depth: 3,   // mm
				thickness: 2 // 厚度
			},
			textOptions = {
				size: 20,
				depth: 1,
				bevelEnabled: true,
				bevelThickness: 0.1,
				bevelSize: 0.1
			}
		} = options

		const group = new THREE.Group()

		// 1. 生成基础钥匙扣形状（圆形）
		const keychainGeometry = this.createKeychainBase(size)
		const keychainMaterial = new THREE.MeshStandardMaterial({
			color: 0xcccccc,
			metalness: 0.3,
			roughness: 0.7
		})
		const keychainMesh = new THREE.Mesh(keychainGeometry, keychainMaterial)
		group.add(keychainMesh)

		// 2. 生成3D文字
		try {
			const font = await this.loadFont(
				this.getFontPath(fontName),
				fontName
			)

			const textGeometry = new TextGeometry(text, {
				font: font,
				size: textOptions.size,
				depth: textOptions.depth,
				curveSegments: 12,
				bevelEnabled: textOptions.bevelEnabled,
				bevelThickness: textOptions.bevelThickness,
				bevelSize: textOptions.bevelSize,
				bevelSegments: 5
			})

			// 居中文字
			textGeometry.computeBoundingBox()
			const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x
			const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y
			textGeometry.translate(-textWidth / 2, -textHeight / 2, size.depth / 2 + textOptions.depth / 2)

			const textMaterial = new THREE.MeshStandardMaterial({
				color: 0x000000,
				metalness: 0.1,
				roughness: 0.9
			})
			const textMesh = new THREE.Mesh(textGeometry, textMaterial)
			group.add(textMesh)

		} catch (error) {
			console.error('生成文字失败:', error)
		}

		// 3. 添加挂环
		const ringGeometry = this.createRing(size)
		const ringMesh = new THREE.Mesh(ringGeometry, keychainMaterial)
		group.add(ringMesh)

		this.currentModel = group
		return group
	}

	/**
	 * 创建钥匙扣基础形状（圆形）
	 */
	createKeychainBase(size) {
		const shape = new THREE.Shape()
		const radius = Math.min(size.width, size.height) / 2 - 1
		
		// 绘制圆形
		shape.absarc(0, 0, radius, 0, Math.PI * 2, false)
		
		// 挤出成3D
		const extrudeSettings = {
			depth: size.depth,
			bevelEnabled: true,
			bevelThickness: 0.2,
			bevelSize: 0.2,
			bevelSegments: 8
		}
		
		return new THREE.ExtrudeGeometry(shape, extrudeSettings)
	}

	/**
	 * 创建挂环
	 */
	createRing(size) {
		const ringGeometry = new THREE.TorusGeometry(2, 0.5, 8, 16)
		const radius = Math.min(size.width, size.height) / 2
		ringGeometry.translate(0, radius + 3, size.depth / 2)
		return ringGeometry
	}

	/**
	 * 获取字体路径
	 */
	getFontPath(fontName) {
		const fontMap = {
			'SourceHanSans': '/static/fonts/SourceHanSans.json',
			'ZCOOLKuaiLe': '/static/fonts/ZCOOLKuaiLe.json',
			// 添加更多字体映射
		}
		return fontMap[fontName] || fontMap['SourceHanSans']
	}

	/**
	 * 更新模型文字
	 * @param {string} newText - 新文字
	 * @param {string} fontName - 字体名称
	 */
	async updateText(newText, fontName) {
		if (!this.currentModel) return

		// 移除旧的文字mesh
		const textMesh = this.currentModel.children.find(child => 
			child.userData.isText === true
		)
		if (textMesh) {
			this.currentModel.remove(textMesh)
			textMesh.geometry.dispose()
			textMesh.material.dispose()
		}

		// 添加新文字
		try {
			const font = await this.loadFont(
				this.getFontPath(fontName),
				fontName
			)

			const textGeometry = new TextGeometry(newText, {
				font: font,
				size: 20,
				depth: 1,
				curveSegments: 12,
				bevelEnabled: true,
				bevelThickness: 0.1,
				bevelSize: 0.1
			})

			textGeometry.computeBoundingBox()
			const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x
			const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y
			textGeometry.translate(-textWidth / 2, -textHeight / 2, 2)

			const textMaterial = new THREE.MeshStandardMaterial({
				color: 0x000000
			})
			const newTextMesh = new THREE.Mesh(textGeometry, textMaterial)
			newTextMesh.userData.isText = true
			this.currentModel.add(newTextMesh)

		} catch (error) {
			console.error('更新文字失败:', error)
		}
	}

	/**
	 * 导出为STL格式（需要 STLExporter）
	 * @returns {string} STL字符串
	 */
	exportToSTL() {
		// 需要引入 STLExporter
		// import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js'
		// const exporter = new STLExporter()
		// return exporter.parse(this.currentModel)
		throw new Error('需要引入 STLExporter')
	}
}

/**
 * 方案2: 服务端生成 - 通过API生成STL文件
 * 优点：支持复杂模型，字体丰富，性能好
 * 缺点：需要服务端，有网络延迟
 */
export class ServerModelGenerator {
	constructor(apiBaseUrl) {
		this.apiBaseUrl = apiBaseUrl || '/api'
	}

	/**
	 * 生成模型并返回STL文件URL
	 * @param {Object} params - 参数
	 * @returns {Promise<string>} STL文件URL
	 */
	async generateModel(params) {
		const {
			text,
			fontName,
			size,
			modelType = 'keychain' // keychain, badge, etc.
		} = params

		const response = await fetch(`${this.apiBaseUrl}/generate-model`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				text,
				fontName,
				size,
				modelType
			})
		})

		if (!response.ok) {
			throw new Error('生成模型失败')
		}

		const data = await response.json()
		return data.stlUrl // 返回STL文件URL
	}

	/**
	 * 获取预览图
	 * @param {Object} params - 参数
	 * @returns {Promise<string>} 预览图URL
	 */
	async getPreview(params) {
		let queryString = ''
		const keys = Object.keys(params)
		if (keys.length > 0) {
			queryString = '?' + keys.map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')
		}
		return `${this.apiBaseUrl}/preview${queryString}`
	}
}

/**
 * 方案3: 使用 OpenJSCAD（参数化建模库）
 * 优点：功能强大，支持复杂参数化建模
 * 缺点：需要学习OpenJSCAD语法，文件较大
 */
export class OpenJSCADGenerator {
	/**
	 * 生成钥匙扣的OpenJSCAD代码
	 */
	generateKeychainCode(params) {
		const { text, fontName, size } = params
		
		return `
			// OpenJSCAD 代码
			const { text, cylinder, union, difference } = require('@jscad/modeling').primitives
			const { translate, rotate } = require('@jscad/modeling').transforms
			
			function main(params) {
				const { text = '${text}', size = ${JSON.stringify(size)} } = params
				
				// 基础圆形
				const base = cylinder({ radius: size.width/2, height: size.depth })
				
				// 文字（需要字体支持）
				const textObj = text({ text, font: '${fontName}', size: 20 })
				
				// 组合
				return union([
					base,
					translate([0, 0, size.depth/2], textObj)
				])
			}
			
			module.exports = { main }
		`
	}
}

