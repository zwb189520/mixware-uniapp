import { uploadFile, get } from './request'

export function uploadModelFile(filePath, options = {}) {
  return uploadFile('/upload/model', filePath, {
    name: 'file',
    ...options
  })
}

export function uploadImages(files, options = {}) {
  return Promise.all(
    files.map(file => 
      uploadFile('/api/upload/images', file, {
        name: 'file',
        ...options
      })
    )
  )
}

export function uploadImage(filePath, type, id, options = {}) {
  return uploadFile('/api/upload/image', filePath, {
    name: 'file',
    formData: {
      type,
      id
    },
    ...options
  })
}

export function getModelDownloadUrl(fileUrl) {
  return get('/api/upload/model/download', { fileUrl })
}