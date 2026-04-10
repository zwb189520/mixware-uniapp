const fs = require('fs')
const https = require('https')
const http = require('http')
const path = require('path')

const API_BASE = 'http://app.mixwarebot.cn:8080/api'
const PACKAGE_URL = 'https://app.liuyingyong.cn/build/download/32cc1d80-272e-11f1-b5af-3fa97a11790f'
const TOKEN =
  'YhK1EyKGZwMAwXA5lSKjcCKaUjBsYgNMEhAwo2AtQSHogyGYQCKYMkEiYBQ0kzCiwjEEMTJ5JwUIFRAKEgFENSJCwAB2kDRksxKecTHhMwPcJyE5cyIKoCB/cDOdZDNjJDEEcHZoViGxIzNu8wKOsiHWYUOiUwL4kTLC8zAnwBIO0TT/kwIQ5AChskGbljN1pXVeVhOpIBMewSGPggOskTG0kxKkcjHXMAJCcxWWkwMLYAQcVxGhkkFLNiF+t1fbxjPHMQF3kyGyQVJUoTGuYDJqQwRyABC'

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    const client = url.startsWith('https') ? https : http
    client
      .get(url, res => {
        if (res.statusCode === 302 || res.statusCode === 301) {
          downloadFile(res.headers.location, dest).then(resolve).catch(reject)
          return
        }
        res.pipe(file)
        file.on('finish', () => {
          file.close()
          resolve(dest)
        })
      })
      .on('error', reject)
  })
}

function uploadFile(filePath, type, version, remark) {
  return new Promise((resolve, reject) => {
    const fileData = fs.readFileSync(filePath)
    const boundary = '----FormBoundary' + Date.now()
    const fileName = path.basename(filePath)
    const isApk = fileName.endsWith('.apk')
    const contentType = isApk
      ? 'application/vnd.android.package-archive'
      : 'application/octet-stream'

    // 构建 multipart 表单数据
    let body = ''
    body += `--${boundary}\r\n`
    body += `Content-Disposition: form-data; name="type"\r\n\r\n${type}\r\n`
    body += `--${boundary}\r\n`
    body += `Content-Disposition: form-data; name="version"\r\n\r\n${version}\r\n`
    body += `--${boundary}\r\n`
    body += `Content-Disposition: form-data; name="remark"\r\n\r\n${remark}\r\n`
    body += `--${boundary}\r\n`
    body += `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`
    body += `Content-Type: ${contentType}\r\n\r\n`

    const bodyBuffer = Buffer.concat([
      Buffer.from(body, 'utf8'),
      fileData,
      Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8')
    ])

    const options = {
      hostname: 'app.mixwarebot.cn',
      port: 8080,
      path: '/api/ota/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': bodyBuffer.length,
        Authorization: `Bearer ${TOKEN}`
      }
    }

    const req = http.request(options, res => {
      let data = ''
      res.on('data', chunk => (data += chunk))
      res.on('end', () => {
        console.log('响应状态:', res.statusCode)
        console.log('响应内容:', data)
        try {
          resolve(JSON.parse(data))
        } catch (e) {
          resolve({ code: -1, msg: data })
        }
      })
    })

    req.on('error', err => {
      console.error('请求错误:', err.message)
      reject(err)
    })
    req.write(bodyBuffer)
    req.end()
  })
}

async function main() {
  const tempFile = './temp-package.apk'

  try {
    console.log('下载安装包...')
    await downloadFile(PACKAGE_URL, tempFile)
    const stats = fs.statSync(tempFile)
    console.log(`下载完成: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)

    console.log('上传到后端...')
    const result = await uploadFile(tempFile, 'android', '1.0.1', '修复已知问题')
    console.log('上传结果:', JSON.stringify(result, null, 2))

    fs.unlinkSync(tempFile)
    console.log('临时文件已清理')
  } catch (error) {
    console.error('失败:', error.message)
    console.error('错误详情:', error)
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile)
    }
  }
}

main()
