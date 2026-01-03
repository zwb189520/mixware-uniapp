const BASE_URL = 'http://localhost:8080/api'

const request = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

export const modelApi = {
  getModels: (params = {}) => {
    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&')
    
    return request(`/models/page${queryString ? '?' + queryString : ''}`, {
      method: 'GET'
    })
  },

  getMyModels: (params = {}) => {
    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&')
    
    return request(`/models/my${queryString ? '?' + queryString : ''}`, {
      method: 'GET'
    })
  },

  getModelDetail: (id) => {
    return request(`/models/${id}`, {
      method: 'GET'
    })
  }
}