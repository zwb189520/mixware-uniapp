export interface ApiResponse<T = unknown> {
  code: number
  msg?: string
  message?: string
  data?: T
}

export interface PaginatedData<T> {
  records: T[]
  total: number
  current: number
  size: number
  pages?: number
}

export interface Session {
  sessionId: string
  title?: string
  createdAt?: number
  updatedAt?: number
}

export interface SessionMessage {
  id: string
  sessionId: string
  role: 'user' | 'assistant'
  content: string
  timestamp?: number
  createdAt?: number
}

export interface HotExample {
  id: string
  content: string
}

export interface Text2ImgTask {
  taskId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  imageUrl?: string
  error?: string
}

export interface SliceTaskDTO {
  modelUrl: string
  modelId?: string | number
  deviceId?: string
  preset?: string
  material?: string
  layerHeight?: number
  infillDensity?: number
  printSpeed?: number
}

export interface SliceTask {
  taskId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  gcodeUrl?: string
  progress?: number
  error?: string
}

export interface AudioTranscription {
  text: string
  duration?: number
}

export interface Device {
  deviceId: string
  deviceName?: string
  deviceType?: string
  deviceState?: string
  printState?: string
  progress?: number
  printTimeHms?: string
  filamentLengthM?: number
  firmwareVersion?: string
  lastOnline?: string
}

export interface Model {
  id: string | number
  name: string
  description?: string
  category?: string
  previewUrl?: string
  downloadUrl?: string
  modelUrl?: string
  thumb?: string
  userId?: string | number
  userName?: string
  userAvatar?: string
  likes?: number
  views?: number
  isLiked?: boolean
  createdAt?: string
  dimensions?: {
    x: number
    y: number
    z: number
  }
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
  images?: string[]
  authorId?: string | number
  authorName?: string
  authorAvatar?: string
  likes?: number
  comments?: number
  isLiked?: boolean
  createdAt?: string
}

export interface Comment {
  id: string | number
  content: string
  userId?: string | number
  userName?: string
  userAvatar?: string
  likes?: number
  isLiked?: boolean
  createdAt?: string
  replies?: Comment[]
}

export interface Medal {
  id: string | number
  name: string
  description?: string
  icon?: string
  earnedAt?: string
}

export interface User {
  userId?: string | number
  id?: string | number
  userName?: string
  nickname?: string
  avatar?: string
  email?: string
  accountStatus?: number
  birthday?: string
  following?: number
  followers?: number
  likes?: number
  medals?: Medal[]
}