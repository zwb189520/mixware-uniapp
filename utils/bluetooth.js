export function initBluetooth() {
  return new Promise((resolve, reject) => {
    uni.openBluetoothAdapter({
      success: resolve,
      fail: reject
    })
  })
}

export function startBluetoothScan() {
  return new Promise((resolve, reject) => {
    uni.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: false,
      success: resolve,
      fail: reject
    })
  })
}

export function stopBluetoothScan() {
  return new Promise((resolve, reject) => {
    uni.stopBluetoothDevicesDiscovery({
      success: resolve,
      fail: reject
    })
  })
}

export function getBluetoothDevices() {
  return new Promise((resolve, reject) => {
    uni.getBluetoothDevices({
      success: (res) => {
        const devices = res.devices || []
        console.log('所有蓝牙设备:', devices)
        
        // 显示所有设备，包括没有名称的
        const processedDevices = devices.map(device => ({
          ...device,
          displayName: device.name || device.localName || device.deviceId || '未知设备'
        }))
        
        // 过滤WG开头的设备
        const wgDevices = processedDevices.filter(device => {
          const name = device.name || device.localName || ''
          return name.toUpperCase().startsWith('WG')
        })
        
        console.log('WG设备:', wgDevices)
        resolve(wgDevices)
      },
      fail: reject
    })
  })
}

export function connectToDevice(deviceId) {
  return new Promise((resolve, reject) => {
    uni.createBLEConnection({
      deviceId,
      success: resolve,
      fail: reject
    })
  })
}

export function getDeviceServices(deviceId) {
  return new Promise((resolve, reject) => {
    uni.getBLEDeviceServices({
      deviceId,
      success: resolve,
      fail: reject
    })
  })
}

// 数据转换工具函数
function ab2hex(buffer) {
  const hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function(bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('')
}

// UTF-8 编码/解码函数
function str2utf8(str) {
  const utf8 = []
  for (let i = 0; i < str.length; i++) {
    let charcode = str.charCodeAt(i)
    if (charcode < 0x80) {
      utf8.push(charcode)
    } else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6))
      utf8.push(0x80 | (charcode & 0x3f))
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12))
      utf8.push(0x80 | ((charcode >> 6) & 0x3f))
      utf8.push(0x80 | (charcode & 0x3f))
    } else {
      i++
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff))
      utf8.push(0xf0 | (charcode >> 18))
      utf8.push(0x80 | ((charcode >> 12) & 0x3f))
      utf8.push(0x80 | ((charcode >> 6) & 0x3f))
      utf8.push(0x80 | (charcode & 0x3f))
    }
  }
  return new Uint8Array(utf8)
}

function utf82str(utf8) {
  let str = ''
  let i = 0
  while (i < utf8.length) {
    let byte1 = utf8[i]
    if (byte1 < 0x80) {
      str += String.fromCharCode(byte1)
      i++
    } else if ((byte1 & 0xe0) === 0xc0) {
      let byte2 = utf8[i + 1]
      str += String.fromCharCode(((byte1 & 0x1f) << 6) | (byte2 & 0x3f))
      i += 2
    } else if ((byte1 & 0xf0) === 0xe0) {
      let byte2 = utf8[i + 1]
      let byte3 = utf8[i + 2]
      str += String.fromCharCode(((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f))
      i += 3
    } else if ((byte1 & 0xf8) === 0xf0) {
      let byte2 = utf8[i + 1]
      let byte3 = utf8[i + 2]
      let byte4 = utf8[i + 3]
      let codePoint = ((byte1 & 0x07) << 18) | ((byte2 & 0x3f) << 12) | ((byte3 & 0x3f) << 6) | (byte4 & 0x3f)
      if (codePoint > 0xffff) {
        codePoint -= 0x10000
        str += String.fromCharCode(0xd800 + (codePoint >> 10))
        str += String.fromCharCode(0xdc00 + (codePoint & 0x3ff))
      } else {
        str += String.fromCharCode(codePoint)
      }
      i += 4
    } else {
      i++
    }
  }
  return str
}

function ab2str(buffer) {
  return utf82str(new Uint8Array(buffer))
}

// 请求 WiFi 权限
export const requestWifiPermission = () => {
	return new Promise((resolve, reject) => {
		// #ifdef APP-PLUS
		const permissions = getWifiPermissions()
		
		if (permissions.length === 0) {
			// 非 Android 平台或不需要权限
			resolve()
			return
		}
		
		console.log('开始请求 WiFi 权限...')
		console.log('需要请求的权限:', permissions)
		
		// 先检查权限状态
		try {
			const main = plus.android.runtimeMainActivity()
			const pkName = main.getPackageName()
			const Permission = plus.android.importClass('android.content.pm.PackageManager')
			const pm = main.getPackageManager()
			
			let allGranted = true
			const missingPermissions = []
			
			for (let i = 0; i < permissions.length; i++) {
				const perm = permissions[i]
				const hasPermission = pm.checkPermission(perm, pkName) === Permission.PERMISSION_GRANTED
				console.log(`权限 ${perm} 状态: ${hasPermission ? '已授予' : '未授予'}`)
				if (!hasPermission) {
					allGranted = false
					missingPermissions.push(perm)
				}
			}
			
			if (allGranted) {
				console.log('所有 WiFi 权限已授予，无需请求')
				resolve()
				return
			}
			
			console.log('缺少的权限:', missingPermissions)
		} catch (e) {
			console.log('检查权限状态失败，继续请求权限:', e)
		}
		
		// 请求权限
		console.log('调用 requestPermissions...')
		plus.android.requestPermissions(
			permissions,
			(resultObj) => {
				console.log('权限请求回调触发')
				console.log('权限请求结果:', JSON.stringify(resultObj))
				
				// 检查是否所有权限都被授予
				if (resultObj.granted && resultObj.granted.length === permissions.length) {
					// 所有权限都已授予
					console.log('所有 WiFi 权限已授予')
					resolve()
					return
				}
				
				// 检查是否有权限被永久拒绝（不再询问）
				const deniedAlways = resultObj.deniedAlways || []
				const hasPermanentlyDenied = deniedAlways.length > 0
				
				console.log('权限被拒绝，deniedAlways:', deniedAlways)
				
				if (hasPermanentlyDenied) {
					// 权限被永久拒绝，引导用户去设置
					uni.showModal({
						title: '需要 WiFi 权限',
						content: '应用需要 WiFi 和定位权限才能扫描 WiFi 网络。权限已被拒绝，请在系统设置中手动开启权限。',
						confirmText: '去设置',
						cancelText: '取消',
						success: (res) => {
							if (res.confirm) {
								// 打开应用设置页面
								plus.runtime.openURL('app-settings://')
							}
							reject(new Error('WiFi 权限被拒绝，请在设置中开启 WiFi 和定位权限'))
						}
					})
				} else {
					// 如果 granted 为空或长度不足，说明权限被拒绝
					if (!resultObj.granted || resultObj.granted.length === 0) {
						uni.showModal({
							title: '需要 WiFi 权限',
							content: '应用需要 WiFi 和定位权限才能扫描 WiFi 网络，请允许权限请求。',
							confirmText: '确定',
							showCancel: false,
							success: () => {
								// 用户点击确定后，再次尝试请求权限
								setTimeout(() => {
									plus.android.requestPermissions(
										permissions,
										(retryResult) => {
											if (retryResult.granted && retryResult.granted.length === permissions.length) {
												resolve()
											} else {
												const error = new Error('WiFi 权限被拒绝，请在设置中开启 WiFi 和定位权限')
												error.errMsg = error.message
												reject(error)
											}
										},
										(err) => {
											reject(err)
										}
									)
								}, 500)
							}
						})
					} else {
						// 部分权限被授予
						const grantedCount = resultObj.granted ? resultObj.granted.length : 0
						const totalCount = permissions.length
						console.log(`部分权限被授予: ${grantedCount}/${totalCount}`)
						
						uni.showToast({
							title: '需要 WiFi 和定位权限才能扫描 WiFi 网络',
							icon: 'none',
							duration: 2000
						})
						
						// 部分权限也可以继续，但可能会影响功能
						resolve()
					}
				}
			},
			(err) => {
				console.error('请求 WiFi 权限失败:', err)
				reject(new Error('请求 WiFi 权限失败: ' + (err.message || err)))
			}
		)
		// #endif
		
		// #ifndef APP-PLUS
		// 非 APP 环境，直接 resolve
		resolve()
		// #endif
	})
}

// 获取 Android 版本
const getAndroidVersion = () => {
	// #ifdef APP-PLUS
	try {
		const main = plus.android.runtimeMainActivity()
		const Build = plus.android.importClass('android.os.Build')
		return Build.SDK_INT || 0
	} catch (e) {
		console.warn('获取 Android 版本失败:', e)
		return 0
	}
	// #endif
	// #ifndef APP-PLUS
	return 0
	// #endif
}

// 获取需要的 WiFi 权限列表
const getWifiPermissions = () => {
	// #ifdef APP-PLUS
	const sdkVersion = getAndroidVersion()
	const permissions = [
		'android.permission.ACCESS_WIFI_STATE',
		'android.permission.CHANGE_WIFI_STATE'
	]
	
	// Android 6.0+ 需要定位权限才能获取 WiFi 列表
	if (sdkVersion >= 23) {
		permissions.push('android.permission.ACCESS_FINE_LOCATION')
		// 也可以添加粗略定位作为备选
		permissions.push('android.permission.ACCESS_COARSE_LOCATION')
	}
	
	return permissions
	// #endif
	// #ifndef APP-PLUS
	return []
	// #endif
}

// 初始化 WiFi 模块
export const initWifi = () => {
	return new Promise(async (resolve, reject) => {
		
		// #ifdef APP-PLUS
		
		// 检查 API 是否存在
		if (typeof uni.startWifi !== 'function') {
			console.error('uni.startWifi 不可用，可能需要在 APP 环境中运行')
			reject(new Error('WiFi API 不可用，请在 APP 环境中使用'))
			return
		}
		
		// 先请求权限
		try {
			await requestWifiPermission()
		} catch (err) {
			console.error('WiFi 权限请求失败:', err)
			reject(err)
			return
		}
		
		uni.startWifi({
			success: res => {
				console.log("WiFi 模块初始化成功", res);
				resolve(res);
			},
			fail: err => {
				console.error("WiFi 模块初始化失败", err);
				reject(err);
			}
		});
		
		// #endif
		
		
		
		
		// #ifndef APP-PLUS
		console.warn("WiFi 功能仅在 APP 环境中可用");
		reject(new Error('WiFi 功能仅在 APP 环境中可用'))
		// #endif
		
	});
};

// 获取 WiFi 列表
export const getWifiList = () => {
	return new Promise((resolve, reject) => {
		
		// #ifdef APP-PLUS
		
		// 检查 API 是否存在
		if (typeof uni.getWifiList !== 'function') {
			console.error('uni.getWifiList 不可用，可能需要在 APP 环境中运行')
			reject(new Error('WiFi API 不可用，请在 APP 环境中使用'))
			return
		}
		
		// 定义监听器函数（用于后续清理）
		let wifiListListener = null
		let isResolved = false // 防止重复 resolve
		
		// 清理监听器的函数
		// 注意：uni-wifi 插件的 offGetWifiList 不需要传入 callback，会直接清空所有监听器
		const cleanup = () => {
			if (typeof uni.offGetWifiList === 'function') {
				try {
					// 不传入 callback，直接清空所有监听器（插件内部实现会忽略参数）
					uni.offGetWifiList()
				} catch (e) {
					// 如果清理失败，静默处理（插件内部会自动清理）
					console.warn('清理监听器失败（可忽略，插件会自动清理）:', e)
				}
			}
			wifiListListener = null
		}
		
		// 先设置监听器（uni-wifi 插件要求监听器在 getWifiList 之前设置）
		wifiListListener = (res) => {
			if (isResolved) return // 防止重复处理
			isResolved = true
			console.log("扫描到的 WiFi 列表", res.wifiList);
			cleanup() // 立即清理监听器
			resolve(res.wifiList || []);
		}
		
		// 注册监听器（在调用 getWifiList 之前）
		if (typeof uni.onGetWifiList === 'function') {
			try {
				uni.onGetWifiList(wifiListListener)
			} catch (e) {
				console.error('注册 WiFi 列表监听器失败:', e)
				reject(new Error('注册 WiFi 列表监听器失败: ' + (e.message || e)))
				return
			}
		} else {
			reject(new Error('uni.onGetWifiList 不可用'))
			return
		}
		
		// 设置超时，防止监听器一直不触发
		const timeoutTimer = setTimeout(() => {
			if (!isResolved) {
				isResolved = true
				cleanup()
				console.warn("WiFi 列表获取超时，返回空列表")
				resolve([])
			}
		}, 10000) // 10秒超时
		
		// 请求 WiFi 列表
		uni.getWifiList({
			success: () => {
				console.log("请求 WiFi 列表成功，等待扫描结果...");
				// 监听器已在之前设置，这里不需要再设置
				// 如果超时，清理定时器
				if (isResolved) {
					clearTimeout(timeoutTimer)
				}
			},
			fail: err => {
				console.error("获取 WiFi 列表失败", err);
				clearTimeout(timeoutTimer)
				cleanup()
				reject(err);
			}
		});
		
		
		// #endif
		
		
		// #ifndef APP-PLUS
		console.warn("WiFi 功能仅在 APP 环境中可用");
		reject(new Error('WiFi 功能仅在 APP 环境中可用'))
		// #endif
		
		
	});
};

// 连接指定 WiFi
export const connectWifi = ({
	SSID,
	BSSID,
	password
}) => {
	return new Promise((resolve, reject) => {

		console.log({
			SSID,
			BSSID, // 安卓需要
			password, // 如果 WiFi 有密码
		})

		uni.connectWifi({
			SSID,
			BSSID, // 安卓需要
			password, // 如果 WiFi 有密码
			success: res => {
				console.log(`连接 WiFi 成功: ${SSID}`, res);
				resolve(res);
			},
			fail: err => {
				console.error(`连接 WiFi 失败: ${SSID}`, err);
				reject(err);
			}
		});
	});
};

// 关闭 WiFi 模块
export const stopWifi = () => {
	return new Promise((resolve, reject) => {
		// #ifdef APP-PLUS
		
		// 检查 API 是否存在
		if (typeof uni.stopWifi !== 'function') {
			console.warn('uni.stopWifi 不可用')
			resolve() // 不报错，静默处理
			return
		}
		
		uni.stopWifi({
			success: res => {
				console.log("WiFi 模块已关闭", res);
				resolve(res);
			},
			fail: err => {
				console.warn("关闭 WiFi 模块失败", err);
				// 不 reject，静默处理
				resolve();
			}
		});
		
		// #endif
		
		// #ifndef APP-PLUS
		resolve()
		// #endif
	});
};

// 获取当前连接 WiFi 信息
export function getConnectedWifiInfo() {
	return new Promise((resolve, reject) => {
		// 先确保 startWifi 已初始化（你已有 initWifi）
		
		// #ifdef APP-PLUS
		
		uni.startWifi({
			success: () => {
				uni.getConnectedWifi({
					success(res) {
						// res.wifi 是当前连接的 wifi info（不同平台字段略有差异）
						resolve(res.wifi || null)
					},
					fail(err) {
						console.error('getConnectedWifi fail:', err)
						reject(err)
					}
				})
			},
			fail(err) {
				console.error('startWifi fail:', err)
				reject(err)
			}
		})
		
		// #endif
		
		
		// #ifdef H5
		console.log("这是 H5 浏览器环境");
		let wifiList = {
				"frequency": 5785,
				"SSID": "无线名称1",
				"signalStrength": -45,
				"securityType": "WPA",
				"secure": true,
				"BSSID": "ff:b9:70:87:2c:c2"
			}
		resolve(wifiList)
		// #endif
	})
}

// 通过蓝牙获取WiFi列表的函数
export function subscribeToWiFiList(deviceId) {
  return new Promise((resolve, reject) => {
    let accumulatedData = ''
    let lastReceiveTime = Date.now()
    let receiveTimeoutId = null
    let isResolved = false
    
    const onCharacteristicChange = (res) => {
      if (isResolved) return
      try {
        const wifiData = ab2str(res.value)
        console.log('收到WiFi数据:', wifiData)
        if (!wifiData) return
        accumulatedData += wifiData
        console.log('累计数据:', accumulatedData)
        lastReceiveTime = Date.now()
        if (!receiveTimeoutId) {
          receiveTimeoutId = setTimeout(checkReceiveComplete, 2000)
        }
      } catch (error) {
        console.log('解析异常:', error)
      }
    }
    
    const checkReceiveComplete = () => {
      if (isResolved) return
      if (Date.now() - lastReceiveTime >= 5000 && accumulatedData.length > 0) {
        isResolved = true
        try {
          let wifiList = []
          if (accumulatedData.includes('#split#') && accumulatedData.includes('#endsplit')) {
            const startIndex = accumulatedData.indexOf('#split#') + 7
            const endIndex = accumulatedData.indexOf('#endsplit')
            const wifiContent = accumulatedData.substring(startIndex, endIndex)
            const wifiItems = wifiContent.split('||')
            wifiList = wifiItems.filter(item => item).map(item => ({
              ssid: item,
              signal: 0
            }))
          } else if (accumulatedData.includes('#wifi#') && accumulatedData.includes('#end#')) {
            const startIndex = accumulatedData.indexOf('#wifi#') + 6
            const endIndex = accumulatedData.indexOf('#end#')
            const wifiContent = accumulatedData.substring(startIndex, endIndex)
            const wifiItems = wifiContent.split(',')
            wifiList = wifiItems.map(item => {
              const parts = item.split('||')
              return {
                ssid: parts[0] || '',
                signal: parts[1] ? parseInt(parts[1]) : 0
              }
            }).filter(item => item.ssid)
          }
          clearTimeout(receiveTimeoutId)
          resolve(wifiList)
        } catch (error) {
          clearTimeout(receiveTimeoutId)
          resolve([])
        }
      } else {
        receiveTimeoutId = setTimeout(checkReceiveComplete, 500)
      }
    }
    
    const timeoutId = setTimeout(() => {
      isResolved = true
      resolve([])
    }, 30000)

    uni.onBLECharacteristicValueChange(onCharacteristicChange)

    uni.notifyBLECharacteristicValueChange({
      deviceId,
      serviceId: '0000181A-0000-1000-8000-00805F9B34FB',
      characteristicId: '00002AD3-0000-1000-8000-00805F9B34FB',
      state: true,
      success: () => {
        const command = '#scan#'
        const requestBuffer = str2utf8(command)
        uni.writeBLECharacteristicValue({
          deviceId,
          serviceId: '0000181A-0000-1000-8000-00805F9B34FB',
          characteristicId: '00002AD2-0000-1000-8000-00805F9B34FB',
          value: requestBuffer
        })
      },
      fail: (error) => {
        clearTimeout(timeoutId)
        isResolved = true
        reject(error)
      }
    })
  })
}

export function sendWiFiConfig(deviceId, serverUrl, ssid, password) {
  return new Promise((resolve, reject) => {
    uni.getBLEDeviceCharacteristics({
      deviceId,
      serviceId: '0000181A-0000-1000-8000-00805F9B34FB',
      success: (res) => {
        console.log('设备特征值:', res.characteristics)
        
        // 查找可写的特征值
        const writeCharacteristic = res.characteristics.find(c => 
          c.uuid.includes('2AD2') && (c.properties.write || c.properties.writeNoResponse)
        )
        
        if (!writeCharacteristic) {
          reject(new Error('未找到可写的特征值 0x2AD2'))
          return
        }
        console.log('使用写入特征值:', writeCharacteristic.uuid, '属性:', writeCharacteristic.properties)
        
        // 启用通知
        uni.notifyBLECharacteristicValueChange({
          deviceId,
          serviceId: '0000181A-0000-1000-8000-00805F9B34FB',
          characteristicId: '00002AD3-0000-1000-8000-00805F9B34FB',
          state: true,
          success: () => {
            console.log('通知启用成功');
            // 添加500ms延迟确保通知已正确设置
            setTimeout(() => {
              // 尝试设置MTU以确保数据传输稳定
              uni.setBLEMTU({
                deviceId: deviceId,
                mtu: 512, // 尝试设置较大的MTU
                success: (mtuRes) => {
                  console.log('MTU设置成功:', mtuRes);
                },
                fail: (mtuErr) => {
                  console.log('MTU设置失败或不支持:', mtuErr);
                  // MTU设置失败不影响主要功能，继续执行
                }
              });
              
              // 发送服务器URL - 使用UTF-8编码
              const serverData = `#url#-r||${serverUrl}#end`
              const serverBuffer = str2utf8(serverData)
              
              console.log('准备发送服务器URL:', serverData);
              console.log('使用特征值ID:', writeCharacteristic.uuid);
              console.log('服务器URL Buffer长度:', serverBuffer.byteLength);
              
              // 验证数据是否正确转换为buffer
              const tempView = new Uint8Array(serverBuffer);
              console.log('前10字节数据:', Array.from(tempView.slice(0, 10)));
              
              uni.writeBLECharacteristicValue({
                deviceId,
                serviceId: '0000181A-0000-1000-8000-00805F9B34FB',
                characteristicId: writeCharacteristic.uuid,
                value: serverBuffer,
                writeType: 'write',  // 对于服务器URL，使用需要响应的方式
                success: (writeRes) => {
                  console.log('服务器URL发送成功', writeRes);
                  
                  // 确保服务器URL被设备完全处理后再发送WiFi配置
                  setTimeout(() => {
                    // 发送WiFi配置 - 使用UTF-8编码
                    const wifiData = `#start#${ssid}||${password}#end`
                    const wifiBuffer = str2utf8(wifiData)
                    
                    console.log('准备发送WiFi配置:', wifiData);
                    console.log('使用特征值ID:', writeCharacteristic.uuid);
                    console.log('WiFi配置 Buffer长度:', wifiBuffer.byteLength);
                    
                    // 验证数据是否正确转换为buffer
                    const wifiTempView = new Uint8Array(wifiBuffer);
                    console.log('前10字节数据:', Array.from(wifiTempView.slice(0, 10)));
                    
                    uni.writeBLECharacteristicValue({
                      deviceId,
                      serviceId: '0000181A-0000-1000-8000-00805F9B34FB',
                      characteristicId: writeCharacteristic.uuid,
                      value: wifiBuffer,
                      writeType: 'write',  // 统一使用write类型，确保设备能正确接收
                      success: (writeRes2) => {
                        console.log('WiFi配置发送成功', writeRes2);
                        
                        // 延迟一点时间再发送触发命令，确保设备处理完WiFi配置
                        setTimeout(() => {
                          const triggerData = '#config#start#end';
                          const triggerBuffer = str2utf8(triggerData);
                          
                          console.log('发送配网触发命令:', triggerData);
                          uni.writeBLECharacteristicValue({
                            deviceId,
                            serviceId: '0000181A-0000-1000-8000-00805F9B34FB',
                            characteristicId: writeCharacteristic.uuid,
                            value: triggerBuffer,
                            writeType: 'write',
                            success: (triggerRes) => {
                              console.log('配网触发命令发送成功', triggerRes);
                              
                              // 发送完触发命令后，可能还需要发送一个结束命令
                              setTimeout(() => {
                                const endData = '#config#end#end';
                                const endBuffer = str2utf8(endData);
                                
                                console.log('发送配网结束命令:', endData);
                                uni.writeBLECharacteristicValue({
                                  deviceId,
                                  serviceId: '0000181A-0000-1000-8000-00805F9B34FB',
                                  characteristicId: writeCharacteristic.uuid,
                                  value: endBuffer,
                                  writeType: 'write',
                                  success: (endRes) => {
                                    console.log('配网结束命令发送成功', endRes);
                                    resolve();
                                  },
                                  fail: (endErr) => {
                                    console.log('配网结束命令发送失败', endErr);
                                    resolve(); // 仍然继续
                                  }
                                });
                              }, 300); // 给设备时间处理触发命令
                            },
                            fail: (triggerErr) => {
                              console.log('配网触发命令发送失败', triggerErr);
                              // 即使触发命令失败，也认为主要配置已完成
                              resolve();
                            }
                          });
                        }, 500); // 给设备更多时间处理WiFi配置
                      },
                      fail: (err) => {
                        console.error('发送WiFi配置失败:', err);
                        console.error('特征值UUID:', writeCharacteristic.uuid);
                        console.error('特征值属性:', writeCharacteristic.properties);
                        reject(new Error(`发送WiFi配置失败: ${err.errMsg || err.message} (特征值: ${writeCharacteristic.uuid})`));
                      }
                    })
                  }, 500); // 给设备更多时间处理服务器URL
                },
                fail: (err) => {
                  console.error('发送服务器URL失败:', err);
                  console.error('特征值UUID:', writeCharacteristic.uuid);
                  console.error('特征值属性:', writeCharacteristic.properties);
                  reject(new Error(`发送服务器URL失败: ${err.errMsg || err.message} (特征值: ${writeCharacteristic.uuid})`));
                }
              })
            }, 500); // 500ms延迟
          },
          fail: (err) => {
            console.error('启用通知失败:', err);
            reject(new Error(`启用通知失败: ${err.errMsg || err.message}`));
          }
        })
      },
      fail: (err) => {
        console.error('获取特征值失败:', err);
        reject(new Error(`获取特征值失败: ${err.errMsg || err.message}`));
      }
    })
  })
}

export function subscribeToConfigResult(deviceId) {
  return new Promise((resolve, reject) => {
    let timeoutId;
    let isResolved = false;
    
    const resultHandler = (res) => {
      if (isResolved) return;
      try {
        const resultData = ab2str(res.value)
        console.log('收到配网结果数据:', resultData);
        console.log('数据长度:', resultData.length);
        console.log('数据十六进制:', ab2hex(res.value));
        
        // 检查是否是配网结果
        if (resultData.includes('#config#success') || resultData.includes('success') || resultData.includes('true')) {
          clearTimeout(timeoutId); // 清除超时定时器
          isResolved = true;
          resolve({ success: true, message: resultData || '配网成功' })
        } else if (resultData.includes('#config#fail') || resultData.includes('fail') || resultData.includes('false')) {
          clearTimeout(timeoutId); // 清除超时定时器
          isResolved = true;
          resolve({ success: false, message: resultData || '配网失败' })
        } else if (resultData.includes('#config#connecting') || resultData.includes('connecting')) {
          // 设备正在连接WiFi，继续等待结果
          console.log('设备正在连接WiFi...');
        } else if (resultData.includes('#config#connected') || resultData.includes('connected')) {
          // 设备已连接到WiFi，视为成功
          clearTimeout(timeoutId); // 清除超时定时器
          isResolved = true;
          resolve({ success: true, message: resultData || '设备已连接到WiFi' })
        } else if (resultData.includes('#split#') && resultData.includes('#endsplit')) {
          // 收到WiFi列表数据，忽略并继续等待配网结果
          console.log('收到WiFi列表数据，继续等待配网结果');
        } else {
          // 其他数据，可能是设备状态信息，继续等待
          console.log('收到其他数据，继续等待配网结果');
        }
      } catch (error) {
        console.error('解析配网结果失败:', error);
      }
    }
    
    // 设置超时时间，避免无限等待
    timeoutId = setTimeout(() => {
      console.log('配网结果等待超时');
      isResolved = true;
      resolve({ success: false, message: '配网结果等待超时' });
    }, 60000); // 增加到60秒超时，因为设备可能需要更多时间来连接WiFi
    
    // 启用通知 - 尝试使用结果特征值 0x2AD4
    uni.notifyBLECharacteristicValueChange({
      deviceId,
      serviceId: '0000181A-0000-1000-8000-00805F9B34FB',
      characteristicId: '00002AD4-0000-1000-8000-00805F9B34FB', // 使用结果特征值
      state: true,
      success: () => {
        console.log('配网结果通知已启用 (0x2AD4)');
        // 注册监听器
        uni.onBLECharacteristicValueChange(resultHandler);
      },
      fail: (err) => {
        console.error('启用配网结果通知失败 (0x2AD4):', err);
        // 如果0x2AD4失败，尝试使用通知特征值0x2AD3
        uni.notifyBLECharacteristicValueChange({
          deviceId,
          serviceId: '0000181A-0000-1000-8000-00805F9B34FB',
          characteristicId: '00002AD3-0000-1000-8000-00805F9B34FB', // 使用通知特征值
          state: true,
          success: () => {
            console.log('配网结果通知已启用 (0x2AD3)');
            // 注册监听器
            uni.onBLECharacteristicValueChange(resultHandler);
          },
          fail: (err2) => {
            console.error('启用配网结果通知失败 (0x2AD3):', err2);
            clearTimeout(timeoutId); // 清除超时定时器
            reject(new Error(`启用配网结果通知失败: ${err.errMsg || err.message}, 备用: ${err2.errMsg || err2.message}`));
          }
        })
      }
    })
  })
}