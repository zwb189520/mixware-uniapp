import * as THREE from 'three';
import {
BlurPass, EffectComposer, KernelSize
} from 'postprocessing';
import {
	MeshReflectorMaterial as MeshReflectorMaterialImpl
} from '../materials/MeshReflectorMaterial.js';
import {
	useThreeJs
} from '../../'

const {
	useLoop,
	useDispose,
	getInstance
} = useThreeJs()


// 扩展 postprocessing 的 BlurPass，适配深度参数
class ReflectorBlurPass extends BlurPass {
  constructor(options = {}) {
    const {
      gl,
      resolution = 256,
      width = 0,
      height = 0,
      minDepthThreshold = 0.9,
      maxDepthThreshold = 1,
      depthScale = 0,
      depthToBlurRatioBias = 0.25,
      ...blurOptions
    } = options;

    // 修正：使用 postprocessing 库的 KernelSize，确保枚举存在
    super({
      ...blurOptions,
      kernelSize: blurOptions.kernelSize || KernelSize.MEDIUM, // 替换 THREE.KernelSize 为 postprocessing 的 KernelSize
      direction: new THREE.Vector2(width > 0 ? 1 : 0, height > 0 ? 1 : 0)
    });

    // 新增深度相关 uniform
    this.setUniforms({
      minDepthThreshold: { value: minDepthThreshold },
      maxDepthThreshold: { value: maxDepthThreshold },
      depthScale: { value: depthScale },
      depthToBlurRatioBias: { value: depthToBlurRatioBias },
      tDepth: { value: null }
    });

    this.resolution = new THREE.Vector2(resolution, resolution);
    this.depthEnabled = depthScale > 0;
  }

  updateDepthTexture(depthTexture) {
    this.setUniform('tDepth', depthTexture);
  }
}

class MeshReflectorMaterial {
  constructor(options = {}) {
    this.config = {
      mixBlur: 0,
      mixStrength: 1,
      resolution: 256,
      blur: [0, 0],
      minDepthThreshold: 0.9,
      maxDepthThreshold: 1,
      depthScale: 0,
      depthToBlurRatioBias: 0.25,
      mirror: 0,
      distortion: 1,
      mixContrast: 1,
      distortionMap: null,
      reflectorOffset: 0,
      props: {},
      ...options
    };

    const { renderer, camera, scene } = getInstance();
    this.renderer = renderer;
    this.camera = camera;
    this.scene = scene;

    this._initFBO();
    this._initVirtualCamera();
    this._initBlurComposer(); // 替换 _initBlurPass 为初始化 composer
    this._initMaterial();
    this._bindRenderLoop();
  }

  _initFBO() {
    const { resolution } = this.config;
    const fboParams = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      type: THREE.HalfFloatType,
      generateMipmaps: false
    };

    this.fbo1 = new THREE.WebGLRenderTarget(resolution, resolution, fboParams);
    this.fbo1.depthBuffer = true;
    this.fbo1.depthTexture = new THREE.DepthTexture(resolution, resolution);
    this.fbo1.depthTexture.format = THREE.DepthFormat;
    this.fbo1.depthTexture.type = THREE.UnsignedShortType;

    this.fbo2 = new THREE.WebGLRenderTarget(resolution, resolution, fboParams);
  }

  _initVirtualCamera() {
    this.virtualCamera = new THREE.PerspectiveCamera(
      this.camera.fov,
      this.camera.aspect,
      this.camera.near,
      this.camera.far
    );

    this.reflectorPlane = new THREE.Plane();
    this.normal = new THREE.Vector3();
    this.reflectorWorldPosition = new THREE.Vector3();
    this.cameraWorldPosition = new THREE.Vector3();
    this.rotationMatrix = new THREE.Matrix4();
    this.lookAtPosition = new THREE.Vector3(0, 0, -1);
    this.clipPlane = new THREE.Vector4();
    this.view = new THREE.Vector3();
    this.target = new THREE.Vector3();
    this.q = new THREE.Vector4();
    this.textureMatrix = new THREE.Matrix4();
  }

  /**
   * 初始化模糊处理的 composer 和 pass（核心修正：使用 EffectComposer 管理 BlurPass）
   */
  _initBlurComposer() {
    const { blur, resolution, minDepthThreshold, maxDepthThreshold, depthScale, depthToBlurRatioBias } = this.config;
    const [blurX, blurY] = blur;
    this.hasBlur = blurX + blurY > 0;

    if (this.hasBlur) {
      // 1. 创建模糊 Pass（使用扩展的 ReflectorBlurPass）
      this.blurPass = new ReflectorBlurPass({
        gl: this.renderer,
        resolution,
        width: blurX,
        height: blurY,
        minDepthThreshold,
        maxDepthThreshold,
        depthScale,
        depthToBlurRatioBias,
        kernelSize: KernelSize.LARGE // 此处使用 postprocessing 的 KernelSize，确保存在
      });
      this.blurPass.updateDepthTexture(this.fbo1.depthTexture);

      // 2. 创建 EffectComposer 管理模糊 Pass
      this.blurComposer = new EffectComposer(this.renderer, this.fbo2); // 输出到 fbo2
      this.blurComposer.addPass(this.blurPass);
    }
  }

  _initMaterial() {
    const { hasBlur } = this;
    const { mirror, mixBlur, mixStrength, minDepthThreshold, maxDepthThreshold, depthScale, depthToBlurRatioBias, distortion, distortionMap, mixContrast } = this.config;

    this.materialParams = {
      mirror,
      textureMatrix: this.textureMatrix,
      mixBlur,
      tDiffuse: this.fbo1.texture,
      tDepth: this.fbo1.depthTexture,
      tDiffuseBlur: this.fbo2.texture,
      hasBlur,
      mixStrength,
      minDepthThreshold,
      maxDepthThreshold,
      depthScale,
      depthToBlurRatioBias,
      distortion,
      distortionMap,
      mixContrast,
      defines: {
        USE_BLUR: hasBlur ? 1 : undefined,
        USE_DEPTH: depthScale > 0 ? 1 : undefined,
        USE_DISTORTION: distortionMap ? 1 : undefined
      }
    };

    this.material = new MeshReflectorMaterialImpl({
      ...this.materialParams,
      ...this.config.props
    });
  }

  _beforeRender(parent) {
    // 保持原逻辑不变...
    if (!parent) return;

    this.reflectorWorldPosition.setFromMatrixPosition(parent.matrixWorld);
    this.cameraWorldPosition.setFromMatrixPosition(this.camera.matrixWorld);
    this.rotationMatrix.extractRotation(parent.matrixWorld);
    this.normal.set(0, 0, 1).applyMatrix4(this.rotationMatrix);
    this.reflectorWorldPosition.addScaledVector(this.normal, this.config.reflectorOffset);

    this.view.subVectors(this.reflectorWorldPosition, this.cameraWorldPosition);
    if (this.view.dot(this.normal) > 0) return false;

    this.view.reflect(this.normal).negate();
    this.view.add(this.reflectorWorldPosition);
    this.virtualCamera.position.copy(this.view);

    this.rotationMatrix.extractRotation(this.camera.matrixWorld);
    this.lookAtPosition.set(0, 0, -1).applyMatrix4(this.rotationMatrix).add(this.cameraWorldPosition);
    this.target.subVectors(this.reflectorWorldPosition, this.lookAtPosition).reflect(this.normal).negate().add(this.reflectorWorldPosition);
    this.virtualCamera.up.set(0, 1, 0).applyMatrix4(this.rotationMatrix).reflect(this.normal);
    this.virtualCamera.lookAt(this.target);
    this.virtualCamera.updateMatrixWorld();

    this.textureMatrix.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1.0);
    this.textureMatrix.multiply(this.virtualCamera.projectionMatrix);
    this.textureMatrix.multiply(this.virtualCamera.matrixWorldInverse);
    this.textureMatrix.multiply(parent.matrixWorld);

    this.reflectorPlane.setFromNormalAndCoplanarPoint(this.normal, this.reflectorWorldPosition);
    this.reflectorPlane.applyMatrix4(this.virtualCamera.matrixWorldInverse);
    this.clipPlane.set(this.reflectorPlane.normal.x, this.reflectorPlane.normal.y, this.reflectorPlane.normal.z, this.reflectorPlane.constant);

    const projMatrix = this.virtualCamera.projectionMatrix;
    this.q.x = (Math.sign(this.clipPlane.x) + projMatrix.elements[8]) / projMatrix.elements[0];
    this.q.y = (Math.sign(this.clipPlane.y) + projMatrix.elements[9]) / projMatrix.elements[5];
    this.q.z = -1.0;
    this.q.w = (1.0 + projMatrix.elements[10]) / projMatrix.elements[14];

    this.clipPlane.multiplyScalar(2.0 / this.clipPlane.dot(this.q));
    projMatrix.elements[2] = this.clipPlane.x;
    projMatrix.elements[6] = this.clipPlane.y;
    projMatrix.elements[10] = this.clipPlane.z + 1.0;
    projMatrix.elements[14] = this.clipPlane.w;

    return true;
  }

  _bindRenderLoop() {
    const { renderer, scene, virtualCamera, fbo1, fbo2, hasBlur, blurComposer } = this;
    let parent = null;

    useLoop((delta) => {
      if (!parent || !this.material) return;

      const originalXRState = renderer.xr.enabled;
      const originalShadowAutoUpdate = renderer.shadowMap.autoUpdate;
      const originalAutoClear = renderer.autoClear;
      const parentVisible = parent.visible;

      const shouldRender = this._beforeRender(parent);
      if (!shouldRender) {
        parent.visible = parentVisible;
        return;
      }

      parent.visible = false;
      renderer.xr.enabled = false;
      renderer.shadowMap.autoUpdate = false;
      renderer.autoClear = false;

      // 1. 渲染场景到 fbo1（原始反射纹理）
      renderer.setRenderTarget(fbo1);
      renderer.clear();
      renderer.render(scene, virtualCamera);

      // 2. 修正：通过 composer 执行模糊处理（替代直接调用 blurPass.render）
      if (hasBlur && blurComposer) {
        // 设置 composer 的输入为 fbo1，输出到 fbo2
        blurComposer.setSize(fbo1.width, fbo1.height);
        blurComposer.render(delta); // 由 composer 管理模糊 Pass 渲染
      }

      // 3. 恢复状态
      renderer.setRenderTarget(null);
      renderer.xr.enabled = originalXRState;
      renderer.shadowMap.autoUpdate = originalShadowAutoUpdate;
      renderer.autoClear = originalAutoClear;
      parent.visible = parentVisible;

      // 4. 更新材质
      this.material.textureMatrix = this.textureMatrix;
      this.material.tDiffuse = fbo1.texture;
      this.material.tDiffuseBlur = fbo2.texture;
      this.material.needsUpdate = true;
    });
  }

  // 其他方法（setParent、getMaterial、dispose）保持不变...
  setParent(mesh) {
    if (!(mesh instanceof THREE.Mesh)) {
      console.error('MeshReflectorMaterial: setParent 需传入 THREE.Mesh 实例');
      return;
    }
    this.parent = mesh;
    mesh.material = this.material;
  }

  getMaterial() {
    return this.material;
  }

  dispose() {
    this.fbo1.dispose();
    this.fbo2.dispose();
    if (this.fbo1.depthTexture) this.fbo1.depthTexture.dispose();

    if (this.blurComposer) {
      this.blurComposer.dispose(); // 释放 composer
    }
    if (this.blurPass) {
      this.blurPass.dispose();
    }

    if (this.material) this.material.dispose();

    this.parent = null;
    this.material = null;
    this.virtualCamera = null;
  }
}

export { MeshReflectorMaterial };