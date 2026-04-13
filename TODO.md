# 项目优化清单

## P0 - 紧急

### 1. 统一状态管理入口 ✅ 已完成
- [x] 创建`useStorage` composable统一管理本地存储
- [x] 重构`api/users.ts`中的`_syncLoginToStore`，只操作Store
- [x] 修改`useUser.ts`，使用useUserStore替代直接Storage调用
- [x] 消除`api/devices.ts`中的直接Storage调用
- [x] 修改核心页面：`PrinterPartner.vue`、`explore.vue`
- [x] 修改所有用户认证相关页面，使用userStore替代直接Storage调用

**已修改文件：**
- `pages/explore/3Dpreviewdetail/preview3DDetail.vue` ✅
- `pages/create/createDetail/draw1/draw1.vue` ✅
- `pages/create/create/create.vue` ✅
- `pagesMember/user/profileEdit/profileEdit.vue` ✅
- `pagesMember/auth/emailBinding/emailBinding.vue` ✅
- `pages/explore/modelDetail/modelDetail.vue` ✅
- `pages/explore/commentList/commentList.vue` ✅
- `pagesMember/user/accountSecurity/accountSecurity.vue` ✅
- `pagesMember/content/modelTasks/modelTasks.vue` ✅
- `pagesMember/content/myWorks/myWorks.vue` ✅
- `pagesMember/user/followList/followList.vue` ✅
- `pagesMember/user/settings/components/settingsMenu.vue` ✅
- `pages/explore/printComplete/printComplete.vue` ✅
- `pages/profile/components/ProfileMedals.vue` ✅
- `pages/explore/showcaseWorksDetail/showcaseWorksDetail.vue` ✅
- `pages/explore/search/search.vue` ✅
- `pages/profile/components/ShowcaseButton.vue` ✅
- `pages/profile/components/ProfileStats.vue` ✅
- `pages/profile/components/ProfileUserInfo.vue` ✅

**保留本地缓存的文件（非用户认证相关）：**
- `pages/create/createDetail/aiChat/aiChat.vue` - AI会话缓存
- `pagesMember/auth/login/login.vue` - 注册用户缓存、Apple登录缓存
- `pagesMember/message/components/list.vue` - 消息缓存
- `pagesMember/content/myLikes/myLikes.vue` - 点赞缓存

---

### 2. 拆分language.ts
- [ ] 按模块拆分成独立文件
- [ ] 使用动态导入减少首屏加载

**目标结构：**
```
stores/modules/language/
├── index.ts          # 入口
├── zh/
│   ├── common.ts
│   ├── login.ts
│   ├── explore.ts
│   ├── create.ts
│   ├── profile.ts
│   └── settings.ts
└── en/
    └── ...同上
```

---

## P1 - 重要

### 3. 迁移Options API → Composition API
- [ ] 核心页面优先：
  - [ ] `pages/explore/explore/explore.vue`
  - [ ] `pages/explore/3Dpreviewdetail/preview3DDetail.vue`
  - [ ] `pagesMember/auth/login/login.vue`
  - [ ] `pagesMember/printer/addDevice/addDevice.vue`
- [ ] 组件逐步迁移

**已完成：**
- [x] `pages/create/create/create.vue`

---

### 4. 消除any类型 ✅ 已完成
- [x] `utils/bluetooth.ts` - 39处 → 0
- [x] `pages/explore/3Dpreviewdetail/preview3DDetail.vue` - 22处 → 0
- [x] `pagesMember/printer/addDevice/addDevice.vue` - 15处 → 0
- [x] `types/uni.d.ts` - 补充完整uni-app类型定义
- [ ] 其他高频any文件

---

### 5. 提取登录处理公共逻辑 ✅ 已完成
- [x] 创建`handleLoginSuccess(userInfo, token)`函数
- [x] 统一avatar处理逻辑（移至Store.login方法）
- [x] 统一Store同步逻辑
- [x] 重构以下函数：
  - `loginWithPassword`
  - `loginByCodeWithHandler`
  - `registerWithHandler`
  - `thirdPartyLoginWithHandler`

---

## P2 - 一般

### 6. Token安全加固
- [ ] APP端使用原生安全存储：
  - iOS: Keychain
  - Android: EncryptedSharedPreferences / Keystore
- [ ] userInfo敏感信息加密存储
- [ ] 考虑Token刷新机制

---

### 7. SSE连接优化
- [ ] `api/iot.ts` connectSSE添加自动重连
- [ ] 添加心跳检测
- [ ] 添加连接状态管理

---

### 8. 请求防抖/节流
- [ ] 搜索接口添加防抖
- [ ] 点赞/收藏接口添加节流
- [ ] 创建`useDebounce`、`useThrottle` composables

---

### 9. 代码去重
- [ ] 合并`bluetooth.ts`和`bluetooth-ble.ts`重复逻辑
- [ ] 提取蓝牙配网公共方法
- [ ] 统一错误处理模式

---

### 10. API层规范
- [ ] `printTasks.ts`改用泛型
- [ ] `modelTasks.ts`改用泛型
- [ ] 统一后端响应码处理（0/1/200）

---

## P3 - 低优先级

### 11. 单元测试
- [ ] API层测试
- [ ] Store测试
- [ ] 工具函数测试

---

### 12. 性能优化
- [ ] 图片懒加载
- [ ] 模型加载进度优化
- [ ] 首屏加载优化

---

## 统计

| 优先级 | 数量 | 状态 |
|--------|------|------|
| P0 | 2 | 1完成，1待处理 |
| P1 | 3 | 1完成，2待处理 |
| P2 | 5 | 待处理 |
| P3 | 2 | 待处理 |

---

## 更新日志

- 2026-04-11: 初始化TODO列表
- 2026-04-11: 完成P0-1核心部分（统一状态管理入口）
- 2026-04-11: 完成P1-5（提取登录处理公共逻辑）
