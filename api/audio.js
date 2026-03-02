import { uploadFile } from './request'

export const audioOffline = (filePath) => {
	return uploadFile('/audio/offline', filePath, {
		name: 'file'
	})
}

export default {
	audioOffline
}