import * as THREE from 'three'


class Animation {

	mixers = []

	update(t) {
		this.mixers.forEach(mixer => {
			mixer.update(t)
		})
	}

	dispose() {
		this.mixers.forEach(mixer => {
			mixer && mixer.stopAllAction()
		})
		this.mixers = []
	}

	getAction(cube, name) {
		let {
			animations,
			mixer
		} = cube;
		let clip = THREE.AnimationClip.findByName(animations, name);
		let action = mixer.clipAction(clip);
		return action
	}

	async play(cube, name, reverse = false, attr = {}) {
		const {
			animations,
			mixer
		} = cube;

		const clip = THREE.AnimationClip.findByName(animations, name);
		const action = mixer.clipAction(clip);
		const duration = action.getClip().duration;
		const ratio = duration / attr?.duration || 1
		Object.assign(action, {
			loop: THREE.LoopOnce, //播放一次
			clampWhenFinished: true, //停在最后一帧
			timeScale: reverse ? -1 * ratio : 1 * ratio, //倒放  播放速度       
			...attr,
		})

		action.paused = false;
		if (attr.isReset) {
			action.reset()
		}

		return new Promise((resolve) => {
			const onFinished = (event) => {
				mixer.removeEventListener('finished', onFinished);
				resolve(mixer);
			};
			mixer.addEventListener('finished', onFinished);

			action.play()

		})
	}


	getActionAndMixer(cube, name) {
		let {
			animations,
			mixer
		} = cube;
		let clip = THREE.AnimationClip.findByName(animations, name);
		let action = mixer.clipAction(clip);
		return {
			action,
			mixer
		}
	}
}


export const animation = new Animation()
// 初始化动画
export const initAnimation = (cube) => {
	// 只支持gltf
	try {
		let {
			scene,
			animations
		} = cube
		if (!scene || !animations) return
		let mixer = new THREE.AnimationMixer(scene)
		scene.mixer = mixer
		animation.mixers.push(mixer)
		scene.animations = animations
	} catch (e) {
		console.log('initAnimation error:', e)
	}
}