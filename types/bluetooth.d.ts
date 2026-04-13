export interface BluetoothDevice {
  deviceId: string
  name?: string
  localName?: string
  RSSI?: number
  advertisData?: ArrayBuffer
  advertisServiceUUIDs?: string[]
  displayName?: string
}

export interface BluetoothSuccessResult {
  errMsg: string
  errCode?: number
}

export interface BluetoothError {
  errMsg: string
  errCode: number
}

export interface GetBluetoothDevicesResult extends BluetoothSuccessResult {
  devices: BluetoothDevice[]
}

export interface BLECharacteristic {
  uuid: string
  properties: {
    read?: boolean
    write?: boolean
    writeNoResponse?: boolean
    notify?: boolean
    indicate?: boolean
  }
}

export interface GetBLEDeviceCharacteristicsResult extends BluetoothSuccessResult {
  characteristics: BLECharacteristic[]
}

export interface BLECharacteristicValueChangeResult {
  deviceId: string
  serviceId: string
  characteristicId: string
  value: ArrayBuffer
}

export interface WiFiInfo {
  SSID: string
  BSSID?: string
  signalStrength?: number
  frequency?: number
  securityType?: string
  secure?: boolean
}

export interface WiFiListItem {
  ssid: string
  signal: number
  BSSID?: string
  frequency?: number
  securityType?: string
}

export interface GetWifiListResult {
  wifiList: WiFiListItem[]
}

export interface SetBLEMTUResult extends BluetoothSuccessResult {
  mtu: number
}

export interface BluetoothOptions {
  success?: (res: BluetoothSuccessResult) => void
  fail?: (err: BluetoothError) => void
  complete?: () => void
}

export interface OpenBluetoothAdapterOptions extends BluetoothOptions {
  success?: (res: BluetoothSuccessResult) => void
}

export interface GetBluetoothDevicesOptions extends BluetoothOptions {
  success?: (res: GetBluetoothDevicesResult) => void
}

export interface CreateBLEConnectionOptions extends BluetoothOptions {
  deviceId: string
  timeout?: number
}

export interface GetBLEDeviceCharacteristicsOptions extends BluetoothOptions {
  deviceId: string
  serviceId: string
  success?: (res: GetBLEDeviceCharacteristicsResult) => void
}

export interface WriteBLECharacteristicValueOptions extends BluetoothOptions {
  deviceId: string
  serviceId: string
  characteristicId: string
  value: ArrayBuffer
  writeType?: 'write' | 'writeNoResponse'
}

export interface NotifyBLECharacteristicValueChangeOptions extends BluetoothOptions {
  deviceId: string
  serviceId: string
  characteristicId: string
  state: boolean
}

export interface SetBLEMTUOptions extends BluetoothOptions {
  deviceId: string
  mtu: number
  success?: (res: SetBLEMTUResult) => void
}

export interface StartWifiOptions extends BluetoothOptions {
  success?: (res: BluetoothSuccessResult) => void
}

export interface GetWifiListOptions extends BluetoothOptions {
  success?: () => void
}

export interface ConnectWifiOptions extends BluetoothOptions {
  SSID: string
  BSSID?: string
  password?: string
}

export interface GetConnectedWifiOptions extends BluetoothOptions {
  success?: (res: { wifi: WiFiInfo }) => void
}
