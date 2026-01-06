/********** 小程序端 *************/
// #ifdef MP
export * from 'three-platformize'
// import {
// 	OrbitControls
// } from 'three-platformize/examples/jsm/controls/OrbitControls'
import {
	OrbitControls, // 使用three-platformize的OrbitControls会卡顿
} from './utils/OrbitControls.js'
// GLTFLoader
export * from 'three-platformize/examples/jsm/loaders/GLTFLoader.js'
// RGBELoader
export * from 'three-platformize/examples/jsm/loaders/RGBELoader.js'
// other
export * from 'three-platformize/examples/jsm/loaders/OBJLoader.js'
export * from 'three-platformize/examples/jsm/loaders/FBXLoader.js'
export * from 'three-platformize/examples/jsm/loaders/STLLoader.js'
// GLTFExporter
export * from 'three-platformize/examples/jsm/exporters/GLTFExporter.js'
import * as THREE from 'three-platformize'
// $requestAnimationFrame是异步挂载的，所以需要这样获取
const $requestAnimationFrame = () => THREE.$requestAnimationFrame
const $cancelAnimationFrame = () => THREE.$cancelAnimationFrame
// #endif


/********** APP、H5 *************/
// #ifndef MP
export * from 'three'
import {
	OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js'
// GLTFLoader
export * from 'three/examples/jsm/loaders/GLTFLoader.js'
// RGBELoader
export * from 'three/examples/jsm/loaders/RGBELoader.js'
// other
export * from 'three/examples/jsm/loaders/OBJLoader'
export * from 'three/examples/jsm/loaders/FBXLoader'
export * from 'three/examples/jsm/loaders/STLLoader'
// GLTFExporter
export * from 'three/examples/jsm/exporters/GLTFExporter.js'
const Platform = null
const $requestAnimationFrame = () => window.requestAnimationFrame
const $cancelAnimationFrame = () => window.cancelAnimationFrame
// #endif



/********** 微信小程序 *************/
// #ifdef MP-WEIXIN
import {
	WechatPlatform as Platform
} from 'three-platformize/src/WechatPlatform'
// #endif



/********** 抖音小程序 *************/
// #ifdef MP-TOUTIAO
import {
	BytePlatform as Platform
} from 'three-platformize/src/BytePlatform'
// #endif


/********** 淘宝小程序 *************/
// #ifdef MP-TOUTIAO
import {
	TaobaoPlatform as Platform
} from 'three-platformize/src/TaobaoPlatform'
// #endif





const deviceInfo = uni.getDeviceInfo()
const devicePixelRatio = Math.max(deviceInfo.devicePixelRatio || 1, 2)
export {
	OrbitControls,
	Platform,
	$requestAnimationFrame,
	$cancelAnimationFrame,
	devicePixelRatio
}