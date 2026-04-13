# 项目优化清单

## P0 - 紧急（阻塞开发）

### 1. 拆分language.ts ⚠️ 最高优先级
**问题**：单文件2339行，严重影响首屏加载性能和可维护性

**执行步骤**：
- [ ] 创建目录结构 `stores/modules/language/`
- [ ] 按模块拆分：common、login、explore、create、profile、settings、printer
- [ ] 实现动态导入（按需加载）
- [ ] 更新所有引用
- [ ] 测试多语言切换功能

**预期收益**：
- 首屏加载时间减少 60%+
- 代码可维护性大幅提升
- 支持按需加载语言包

---

### 2. 统一API响应码处理 ⚠️ 高优先级
**问题**：后端响应码混乱（0/1/200），业务逻辑分散

**执行步骤**：
- [ ] 创建 `utils/apiResponse.ts` 统一处理函数
- [ ] 定义标准响应码枚举
- [ ] 重构所有API调用处的响应判断
- [ ] 添加统一的错误处理中间件

**涉及文件**：
- `api/request.ts`
- 所有API调用文件（约30+文件）

---

## P1 - 重要（影响代码质量）

### 3. 合并蓝牙重复代码
**问题**：`bluetooth.ts` 和 `bluetooth-ble.ts` 存在大量重复逻辑

**执行步骤**：
- [ ] 分析两个文件的共同逻辑
- [ ] 提取公共方法到 `bluetoothCommon.ts`
- [ ] 重构两个文件使用公共方法
- [ ] 测试蓝牙配网功能

---

### 4. 迁移Options API → Composition API
**问题**：代码风格不统一，影响可维护性

**优先级顺序**：
1. [ ] `pages/explore/explore/explore.vue` - 核心页面
2. [ ] `pages/explore/3Dpreviewdetail/preview3DDetail.vue` - 核心功能
3. [ ] `pagesMember/auth/login/login.vue` - 认证流程
4. [ ] `pagesMember/printer/addDevice/addDevice.vue` - 设备配网
5. [ ] 其他组件逐步迁移

---

### 5. 消除剩余any类型
**问题**：类型安全性不足

**高频文件**：
- [ ] `pages/explore/modelDetail/modelDetail.vue` - 36处
- [ ] `pages/create/createDetail/aiChat/aiChat.vue` - 30处
- [ ] `pagesMember/auth/login/login.vue` - 28处
- [ ] 其他文件按需处理

---

## P2 - 一般（优化体验）

### 6. 请求防抖/节流
- [ ] 创建 `composables/modules/useDebounce.ts`
- [ ] 创建 `composables/modules/useThrottle.ts`
- [ ] 搜索接口添加防抖
- [ ] 点赞/收藏接口添加节流

---

### 7. SSE连接优化
- [ ] `api/iot.ts` connectSSE添加自动重连
- [ ] 添加心跳检测
- [ ] 添加连接状态管理
- [ ] 断线重连机制

---

### 8. Token安全加固
- [ ] APP端使用原生安全存储
  - iOS: Keychain
  - Android: EncryptedSharedPreferences
- [ ] userInfo敏感信息加密
- [ ] Token刷新机制

---

## P3 - 低优先级（长期优化）

### 9. 单元测试
- [ ] API层测试
- [ ] Store测试
- [ ] 工具函数测试
- [ ] 核心业务逻辑测试

---

### 10. 性能优化
- [ ] 图片懒加载
- [ ] 模型加载进度优化
- [ ] 首屏加载优化
- [ ] 代码分割优化

---

## 已完成 ✅

### ✅ P0 - 统一状态管理入口
- 创建 `useStorage` composable
- 重构所有直接Storage调用
- 统一用户认证状态管理

### ✅ P1 - 提取登录处理公共逻辑
- 创建 `handleLoginSuccess` 统一处理
- 统一avatar处理逻辑
- 重构所有登录相关函数

### ✅ P1 - 消除核心文件any类型
- `utils/bluetooth.ts` - 39处 → 0
- `pages/explore/3Dpreviewdetail/preview3DDetail.vue` - 22处 → 0
- `pagesMember/printer/addDevice/addDevice.vue` - 15处 → 0
- 补充完整uni-app类型定义

### ✅ P0 - 修复TypeScript类型错误
- 修复所有编译阻塞错误
- 统一API响应类型定义
- 完善Comment、Model等核心类型

---

## 执行建议

### 本周重点（P0）：
1. **拆分language.ts** - 预计2-3天
   - 这是当前最大的技术债
   - 直接影响用户体验（首屏加载）
   - 为后续优化打基础

2. **统一API响应码** - 预计1-2天
   - 消除潜在bug
   - 提升代码一致性

### 下周重点（P1）：
3. **合并蓝牙重复代码** - 预计1天
4. **开始Options API迁移** - 长期任务，每周迁移1-2个文件

### 长期规划（P2-P3）：
- 按需添加防抖/节流
- 逐步完善测试覆盖
- 持续性能优化

---

## 统计

| 优先级 | 任务数 | 预计工时 | 状态 |
|--------|--------|----------|------|
| P0 | 2 | 3-5天 | 待处理 |
| P1 | 3 | 5-7天 | 进行中 |
| P2 | 3 | 3-4天 | 待处理 |
| P3 | 2 | 长期 | 待处理 |

---

## 更新日志

- 2026-04-11: 初始化TODO列表
- 2026-04-11: 完成统一状态管理入口
- 2026-04-11: 完成提取登录处理公共逻辑
- 2026-04-13: 完成TypeScript类型错误修复
- 2026-04-13: 重新评估优先级，更新TODO列表
