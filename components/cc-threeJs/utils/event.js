import * as THREE from 'three'

//声明raycaster和mouse变量
const raycaster = new THREE.Raycaster()
// 屏幕坐标转成threejs坐标
const mouse = new THREE.Vector2()


class Events extends THREE.EventDispatcher {
	static events = {
		CLICK_MESH: 'CLICK_MESH'
	}

	static functions = []

	constructor() {
		super()
		this.enabled = true
		this.rect = null; // 可以手动去设置
		this.camera = null;
		this.onEvent()

	}
	// 手动设置rect，用于android
	setOptions({
		rect,
		camera
	}) {
		this.rect = rect
		this.camera = camera
	}

	// 初始化监听
	onEvent(event) {
		if (!this.enabled) return
		this.dispatchEvent({
			type: Events.events.CLICK_MESH,
			data: {
				event
			}
		})
	}

	// 清空的单个监听
	removeEvent(name, fn) {
		this.removeEventListener(name, fn)
		let index = Events.functions.findIndex((item) => item.fn === fn)
		if (index !== -1) Events.functions.slice(index, 1)
	}

	// 销毁清空
	removeEvents() {
		Events.functions.forEach((item) => {
			this.removeEvent(item.name, item.fn)
		})
		Events.functions = []
	}


	// 绑定监听
	onClickMesh(meshList = [], callback = (intersects, remove) => {}, once = false) {
		const camera = this.camera
		const rect = this.rect
		if (!camera || !rect) {
			console.log('camera 或 rect不存在')
			return
		}
		const fn = ({
			data
		}) => {
			const {
				event
			} = data
			const [touchEvent] = event.touches


			const offsetX = rect.left
			const offsetY = rect.top
			mouse.x = ((touchEvent.clientX - offsetX) / (rect.right - offsetX)) * 2 - 1
			mouse.y = -((touchEvent.clientY - offsetY) / (rect.bottom - offsetY)) * 2 + 1


			raycaster.setFromCamera(mouse, camera)
			const intersects = raycaster.intersectObjects(meshList)
			callback(intersects, this.removeEvent.bind(this, Events.events.CLICK_MESH, fn))
			if (intersects.length > 0 && once) {
				this.removeEvent(Events.events.CLICK_MESH, fn)
			}
		}

		Events.functions.push({
			name: Events.events.CLICK_MESH,
			fn
		})
		this.addEventListener(Events.events.CLICK_MESH, fn)
		return this.removeEvent.bind(this, Events.events.CLICK_MESH, fn)
	}






}

export const events = new Events()