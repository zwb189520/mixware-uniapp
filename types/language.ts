export interface CreateTexts {
  title: string
  allFunction: string
  allDesc: string
  photography: string
  photographyDesc: string
  chat: string
  chatDesc: string
  textToModel: string
  promptPlaceholder: string
  pleaseInputPrompt: string
  aiChat: string
  aiChatDesc: string
  aiChatPlaceholder: string
  draw: string
  drawDesc: string
  uploadModel: string
  transform: string
  transformDesc: string
  featureInDev: string
  selected: string
  [key: string]: string | CreateTextsDraw1 | CreateTextsSessionList
}

export interface CreateTextsDraw1 {
  placeholder: string
  saveEdit: string
  nextStep: string
  shareModel: string
  goPrint: string
  saveSuccess: string
  exitConfirm: string
  dontSave: string
  save: string
  shareFailed: string
  saveFailed: string
  parseImageFailed: string
  saveFileFailed: string
  notSupportShareSTL: string
  [key: string]: string
}

export interface CreateTextsSessionList {
  title: string
  newSession: string
  noSessions: string
  createFirstSession: string
  unnamedSession: string
  deleteConfirm: string
  deleteSuccess: string
  deleteFailed: string
  loadFailed: string
  createSessionFailed: string
  tip: string
  deleteSession: string
  justNow: string
  minutesAgo: string
  hoursAgo: string
  daysAgo: string
  contentdown: string
  contentrefresh: string
  contentnomore: string
  [key: string]: string
}

export interface LanguageTexts {
  create: CreateTexts
  [key: string]: unknown
}