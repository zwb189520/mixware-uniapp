# 可编辑3D模型实现方案指南

## 概述

针对可编辑3D模型（如钥匙扣、徽章等），提供三种实现方案：

## 方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **客户端生成** | 实时预览、无需服务端、响应快 | 字体文件大、复杂模型性能有限 | 简单模型、实时预览 |
| **服务端生成** | 支持复杂模型、字体丰富、性能好 | 需要服务端、有网络延迟 | 复杂模型、生产环境 |
| **OpenJSCAD** | 功能强大、参数化建模 | 学习成本、文件较大 | 复杂参数化设计 |

---

## 方案1: 客户端生成（推荐用于实时预览）

### 实现步骤

#### 1. 准备字体文件

将字体转换为 Three.js 格式（JSON）：
- 使用 [facetype.js](http://gero3.github.io/facetype.js/) 在线转换
- 或使用 `typeface.js` 工具

字体文件放置位置：
```
/static/fonts/
  ├── SourceHanSans.json
  ├── ZCOOLKuaiLe.json
  └── ...
```

#### 2. 在组件中使用

```vue
<template>
  <view>
    <cc-threeJs 
      ref="threeView"
      :modelurl="modelUrl"
      modelType="stl"
    />
    <view class="controls">
      <input v-model="surname" placeholder="输入姓氏" />
      <picker :value="fontIndex" :range="fonts" @change="onFontChange">
        <view>{{ fonts[fontIndex] }}</view>
      </picker>
    </view>
  </view>
</template>

<script>
import { ParametricModelGenerator } from '@/components/cc-threeJs/utils/parametricModel.js'

export default {
  data() {
    return {
      surname: '李',
      fonts: ['SourceHanSans', 'ZCOOLKuaiLe'],
      fontIndex: 0,
      generator: null,
      modelUrl: null
    }
  },
  mounted() {
    this.initGenerator()
  },
  methods: {
    async initGenerator() {
      // 获取 Three.js 场景实例
      const { scene } = this.$refs.threeView.getInstance()
      
      // 创建生成器
      this.generator = new ParametricModelGenerator(scene)
      
      // 生成初始模型
      await this.generateModel()
    },
    
    async generateModel() {
      const group = await this.generator.generateKeychain({
        text: this.surname,
        fontName: this.fonts[this.fontIndex],
        size: {
          width: 30,
          height: 34,
          depth: 3,
          thickness: 2
        }
      })
      
      // 添加到场景
      const { group: sceneGroup } = this.$refs.threeView.getInstance()
      sceneGroup.add(group)
    },
    
    async onSurnameChange() {
      await this.generator.updateText(
        this.surname,
        this.fonts[this.fontIndex]
      )
    },
    
    async onFontChange(e) {
      this.fontIndex = e.detail.value
      await this.onSurnameChange()
    }
  }
}
</script>
```

#### 3. 导出STL文件

```javascript
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js'

// 导出为STL
const exporter = new STLExporter()
const stlString = exporter.parse(generator.currentModel)

// 下载文件
const blob = new Blob([stlString], { type: 'text/plain' })
const url = URL.createObjectURL(blob)
const link = document.createElement('a')
link.href = url
link.download = 'keychain.stl'
link.click()
```

---

## 方案2: 服务端生成（推荐用于生产环境）

### 服务端实现（Node.js + OpenSCAD/Python）

#### 1. Python + OpenSCAD 方案

```python
# server/generate_model.py
from flask import Flask, request, send_file
import subprocess
import tempfile
import os

app = Flask(__name__)

@app.route('/api/generate-model', methods=['POST'])
def generate_model():
    data = request.json
    text = data.get('text', '')
    font_name = data.get('fontName', 'SourceHanSans')
    size = data.get('size', {})
    
    # 生成 OpenSCAD 代码
    scad_code = f"""
    text = "{text}";
    font = "{font_name}";
    width = {size.get('width', 30)};
    height = {size.get('height', 34)};
    depth = {size.get('depth', 3)};
    
    // 基础圆形
    difference() {{
        cylinder(h=depth, r=width/2);
        translate([0, 0, depth/2])
            linear_extrude(height=depth)
                text(text, font=font, size=20, halign="center", valign="center");
    }}
    """
    
    # 创建临时文件
    with tempfile.NamedTemporaryFile(mode='w', suffix='.scad', delete=False) as f:
        f.write(scad_code)
        scad_file = f.name
    
    stl_file = scad_file.replace('.scad', '.stl')
    
    # 调用 OpenSCAD 生成 STL
    subprocess.run(['openscad', '-o', stl_file, scad_file])
    
    # 返回文件
    return send_file(stl_file, as_attachment=True, download_name='model.stl')
```

#### 2. 客户端调用

```javascript
import { ServerModelGenerator } from '@/components/cc-threeJs/utils/parametricModel.js'

const generator = new ServerModelGenerator('/api')

// 生成模型
const stlUrl = await generator.generateModel({
  text: '李',
  fontName: 'SourceHanSans',
  size: { width: 30, height: 34, depth: 3 }
})

// 加载到 Three.js
loader.load(stlUrl, (geometry) => {
  const material = new THREE.MeshStandardMaterial({ color: 0xcccccc })
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)
})
```

---

## 方案3: 混合方案（推荐）

### 实时预览 + 服务端生成

```javascript
// 实时预览使用客户端生成
const previewGenerator = new ParametricModelGenerator(scene)
await previewGenerator.generateKeychain({ text, fontName, size })

// 用户确认后，使用服务端生成高质量STL
const serverGenerator = new ServerModelGenerator('/api')
const stlUrl = await serverGenerator.generateModel({ text, fontName, size })
```

---

## 字体文件准备

### 1. 下载字体文件
- 思源黑体：https://github.com/adobe-fonts/source-han-sans
- 站酷快乐体：https://www.zcool.com.cn/special/zcoolfonts/

### 2. 转换为 Three.js 格式

使用在线工具：
- http://gero3.github.io/facetype.js/
- 上传 TTF/OTF 文件
- 下载 JSON 格式

或使用命令行：
```bash
npm install -g typeface.js
typeface.js --font "SourceHanSans-Regular.ttf" --output "SourceHanSans.json"
```

### 3. 放置字体文件
```
/static/fonts/
  ├── SourceHanSans.json
  └── ZCOOLKuaiLe.json
```

---

## 性能优化建议

1. **字体缓存**：首次加载后缓存字体对象
2. **几何体合并**：合并多个几何体减少draw call
3. **LOD（细节层次）**：预览时使用低精度，导出时使用高精度
4. **Web Worker**：复杂计算放到 Worker 中
5. **增量更新**：只更新变化的文字部分，不重建整个模型

---

## 完整示例

参考 `kedongAPP/pages/model/design.vue` 的实现，结合上述方案进行集成。

