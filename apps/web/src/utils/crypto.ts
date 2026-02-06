/**
 * 加密工具类
 * 用于本地存储敏感数据的加密/解密
 */

const STORAGE_KEY = 'sesp_secure_key'

/**
 * 生成或获取存储的密钥
 */
function getOrCreateKey(): string {
  let key = localStorage.getItem(STORAGE_KEY)
  if (!key) {
    // 生成随机密钥
    key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    localStorage.setItem(STORAGE_KEY, key)
  }
  return key
}

/**
 * 使用 Web Crypto API 加密数据
 */
async function encryptData(data: string, key: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  
  // 从十六进制字符串创建密钥
  const keyBuffer = new Uint8Array(key.match(/.{2}/g)!.map(byte => parseInt(byte, 16)))
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  )
  
  // 生成随机 IV
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    dataBuffer
  )
  
  // 组合 IV 和加密数据
  const result = new Uint8Array(iv.length + encryptedBuffer.byteLength)
  result.set(iv)
  result.set(new Uint8Array(encryptedBuffer), iv.length)
  
  // 转换为 Base64
  return btoa(String.fromCharCode(...result))
}

/**
 * 使用 Web Crypto API 解密数据
 */
async function decryptData(encryptedData: string, key: string): Promise<string> {
  try {
    // 从 Base64 解码
    const dataBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0))
    
    // 提取 IV 和加密数据
    const iv = dataBuffer.slice(0, 12)
    const encrypted = dataBuffer.slice(12)
    
    // 从十六进制字符串创建密钥
    const keyBuffer = new Uint8Array(key.match(/.{2}/g)!.map(byte => parseInt(byte, 16)))
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    )
    
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encrypted
    )
    
    const decoder = new TextDecoder()
    return decoder.decode(decryptedBuffer)
  } catch (error) {
    console.error('解密失败:', error)
    return ''
  }
}

/**
 * 加密存储 API Key
 */
export async function storeApiKey(apiKey: string): Promise<void> {
  const key = getOrCreateKey()
  const encrypted = await encryptData(apiKey, key)
  localStorage.setItem('sesp_api_key_encrypted', encrypted)
}

/**
 * 获取解密的 API Key
 */
export async function getApiKey(): Promise<string> {
  const encrypted = localStorage.getItem('sesp_api_key_encrypted')
  if (!encrypted) return ''
  
  const key = getOrCreateKey()
  return await decryptData(encrypted, key)
}

/**
 * 清除存储的 API Key
 */
export function clearApiKey(): void {
  localStorage.removeItem('sesp_api_key_encrypted')
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * 检查是否已存储 API Key
 */
export function hasApiKey(): boolean {
  return !!localStorage.getItem('sesp_api_key_encrypted')
}
