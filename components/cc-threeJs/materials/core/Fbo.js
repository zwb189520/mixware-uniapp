import * as THREE from 'three';
import {
	useThreeJs
} from '../../index.js'; // 你将实现的 useThree
import {
	devicePixelRatio
} from '../../lib.js'

const {
	getContainerSize,
	useDispose
} = useThreeJs()

function useFBO(width, height, settings) {
	const size = getContainerSize() || {
		width: 1,
		height: 1
	}; // 你会替换这个



	const _width = typeof width === 'number' ? width : size.width * devicePixelRatio;
	const _height = typeof height === 'number' ? height : size.height * devicePixelRatio;
	const _settings = (typeof width === 'number' ? settings : width) || {};

	const {
		samples = 0,
			depth,
			...targetSettings
	} = _settings;
	const depthBuffer = depth !== undefined ? depth : _settings.depthBuffer;

	const target = new THREE.WebGLRenderTarget(_width, _height, {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		type: THREE.HalfFloatType,
		...targetSettings
	});

	if (depthBuffer) {
		target.depthTexture = new THREE.DepthTexture(_width, _height, THREE.FloatType);
	}

	target.samples = samples;

	// 尺寸更新函数
	target.updateSize = (newWidth, newHeight) => {
		const w = newWidth || _width;
		const h = newHeight || _height;
		target.setSize(w, h);
		if (samples) target.samples = samples;
	};

	// 清理函数
	target.dispose = () => {
		THREE.WebGLRenderTarget.prototype.dispose.call(target);
	};

	useDispose(() => target.dispose())

	return target;
}

export {
	useFBO
}