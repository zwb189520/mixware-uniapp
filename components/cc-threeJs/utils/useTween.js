// 使用示例
/**
const {
	Easing,
	exec
} = useTween()
let obj = {
	x: 0,
	y: 0
}
exec(obj,100,{
	x: 1000,
	y: 50,
	ease: e.Easing.easeInOut,
	onUpdate: () => console.log(obj),
	onComplete: () => console.log('动画完成')
})
**/

// 此代码是使用AI生成的一个简单的Tween动画库，它允许你将一个对象的属性从一个值平滑地过渡到另一个值。
// 你也可以去安装其他的库比如：gsap


import {
	$requestAnimationFrame
} from '../lib.js'



export const useTween = () => {
	// 缓动函数库
	const Easing = {
		linear: t => t,
		easeIn: t => t * t,
		easeOut: t => t * (2 - t),
		easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
	};
	const exec = async (target, duration, vars) => {
		if (duration <= 0) {
			duration = 1
		}


		const startTime = Date.now();
		const startValues = {};
		const changeValues = {};

		if (!vars.ease) {
			vars.ease = Easing.linear;
		}

		for (const prop in vars) {
			if (prop === 'onUpdate' || prop === 'onComplete' || prop === 'ease') continue;

			startValues[prop] = typeof target[prop] === 'number' ?
				target[prop] : parseFloat(target[prop]);
			changeValues[prop] = parseFloat(vars[prop]) - startValues[prop];
		}

		return new Promise((resolve, reject) => {
			const animate = () => {

				const elapsed = Date.now() - startTime;
				const progress = Math.min(elapsed / duration, 1);
				const easedProgress = vars.ease ?
					vars.ease(progress) : progress;
				for (const prop in changeValues) {
					const newValue = startValues[prop] +
						changeValues[prop] * easedProgress;
					target[prop] = newValue;
				}

				if (vars.onUpdate) vars.onUpdate(target);

				if (progress < 1) {
					$requestAnimationFrame()(animate);
				} else {
					if (vars.onComplete) {
						vars.onComplete(target);
					}
					resolve()
				}

			}
			animate()
		})


	}


	return {
		Easing,
		exec
	}
}