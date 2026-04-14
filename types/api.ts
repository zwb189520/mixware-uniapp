export type ApiCode = 0 | 1 | -1 | 200 | 401 | 403 | 404 | 500 | 100508

export interface ApiResponse<T = void> {
  code: ApiCode
  msg: string
  message?: string
  data?: T
}

export interface PaginatedData<T> {
  records: T[]
  total: number
  current: number
  size: number
  pages: number
}

export interface Session {
  sessionId: string
  title: string
  createdAt: number
  updatedAt: number
}

export interface SessionMessage {
  id: string
  sessionId: string
  role: MessageRole
  content: string
  timestamp: number
  createdAt: number
}

export type MessageRole = 'user' | 'assistant' | 'system'

export interface HotExample {
  id: string
  content: string
}

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface Text2ImgTask {
  taskId: string
  status: TaskStatus
  imageUrl: string
  error: string
}

export interface SliceTaskDTO {
  modelUrl: string
  modelId: string | number
  deviceId: string
  preset: string
  material: string
  layerHeight: number
  infillDensity: number
  printSpeed: number
}

export interface SliceTask {
  taskId: string
  status: TaskStatus
  gcodeUrl: string
  progress: number
  error: string
}

export interface AudioTranscription {
  text: string
  duration: number
}

export type DeviceState = 'Online' | 'Offline' | 'Busy'
export type PrintState = 'Idle' | 'Printing' | 'Paused' | 'Completed' | 'Error'

export interface Device {
  id: string
  deviceId: string
  deviceName: string
  name?: string
  deviceType: string
  deviceState: DeviceState | string
  printState: PrintState | string
  progress: number
  printTimeHms: string
  filamentLengthM: number
  firmwareVersion: string
  lastOnline: string
  bindTime: string
  isDefault: boolean
  status: number
  deviceStatus?: number
  message?: string
}

export type ModelCategory = 'daily' | 'hot' | 'toys' | 'education' | 'other'

export interface ModelDimensions {
  x: number
  y: number
  z: number
  width?: number
  height?: number
  depth?: number
}

export interface Model {
  id: string | number
  modelId?: string | number
  name: string
  describe?: string
  title?: string
  description?: string
  category: ModelCategory | string
  previewUrl: string
  downloadUrl: string
  modelUrl: string
  modelFile?: string
  thumb: string
  image?: string
  userId: string | number
  userName: string
  username?: string
  userAvatar: string
  avatarUrl?: string
  authorAvatar?: string
  author?: string
  likes: number
  likeCount?: number
  views: number
  viewCount?: number
  isLiked: boolean
  createdAt: string
  dimensions: ModelDimensions
  editableStatus?: string
  favoriteId?: string | number
  favoriteTime?: string
  collectCount?: number
  groupId?: string | number
}

export interface ExploreModel {
  id: string | number
  name: string
  desc: string
  image: string
  author: string
  authorAvatar: string
  likes: number
  isLiked: boolean
  viewCount: number
  category: string
}

export interface ChatHistory {
  id: string
  question: string
  answer: string
  createdAt: string
}

export interface CommunityPost {
  id: string | number
  title: string
  content: string
  images: string[]
  authorId: string | number
  authorName: string
  authorAvatar: string
  likes: number
  comments: number
  isLiked: boolean
  createdAt: string
}

export interface Comment {
  id: string | number
  content: string
  userId: string | number
  userName: string
  userAvatar: string
  likes: number
  isLiked: boolean
  createdAt: string
  replies: Comment[]
}

export interface Medal {
  id: string | number
  name: string
  description: string
  icon: string
  earnedAt: string
}

export interface User {
  userId: string | number
  id: string | number
  userName: string
  nickname: string
  avatar: string
  email: string
  accountStatus: AccountStatus
  birthday: string
  following: number
  followers: number
  likes: number
  medals: Medal[]
}

export type AccountStatus = 0 | 1 | 2

export interface UserInfo {
  userId: string | number
  id?: string | number
  userName: string
  nickname: string
  avatar: string
  email: string
  accountStatus: AccountStatus
  birthday: string
}

export interface RequestData {
  [key: string]: string | number | boolean | null | undefined | RequestData | RequestData[]
}

export interface RequestOptions {
  url: string
  method: HttpMethod
  data?: RequestData
  header?: Record<string, string>
  showLoading?: boolean
  loadingText?: string
  cache?: boolean
  cacheTime?: number
  timeout?: number
  sslVerify?: boolean
  silent?: boolean
  signal?: AbortSignal
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface ApiError {
  code: number
  msg: string
  message?: string
  errMsg?: string
  errCode?: number
  statusCode?: number
  data?: unknown
}

export interface UploadOptions {
  url: string
  filePath: string
  name: string
  formData?: RequestData
  header?: Record<string, string>
  showLoading?: boolean
  loadingText?: string
  timeout?: number
}

export interface WiFiInfo {
  SSID: string
  BSSID: string
  signalStrength: number
  frequency: number
  securityType: string
  secure: boolean
}

export interface WiFiListItem {
  ssid: string
  signal: number
}
