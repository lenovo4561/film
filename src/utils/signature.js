import CryptoJS from 'crypto-js'

/**
 * 签名配置
 */
const SIGNATURE_CONFIG = {
  channel: 'CS001', // 产品唯一标识
  key: '804c73bec6c891128b7059b22da5f2a9faf4b93e056ff33db26fd527161d2512' // 产品密钥
}

/**
 * 生成MD5签名
 * @param {string} str - 待签名字符串
 * @returns {string} MD5签名结果
 */
function md5(str) {
  return CryptoJS.MD5(str).toString()
}

/**
 * 生成签名字符串
 * 将参数按字典序排列（除了sign字段）
 * @param {Object} params - 参数对象
 * @returns {string} 签名字符串
 */
function generateSignString(params) {
  const keys = Object.keys(params)
    .filter(key => key !== 'sign') // 排除sign字段
    .sort() // 字典序排序

  const signString = keys
    .map(key => `${key}=${params[key]}`)
    .join('&')

  return signString
}

/**
 * 生成请求签名
 * @param {Object} params - 请求参数（包含channel和time）
 * @returns {string} 签名值
 */
export function generateSignature(params) {
  // 生成签名字符串
  const signString = generateSignString(params)

  // 计算签名：md5(签名字符串 + 产品密钥)
  const sign = md5(signString + SIGNATURE_CONFIG.key)

  console.log('签名生成详情:')
  console.log('- 签名参数:', params)
  console.log('- 签名字符串:', signString)
  console.log('- 产品密钥:', SIGNATURE_CONFIG.key)
  console.log('- 签名结果:', sign)

  return sign
}

/**
 * 为请求添加签名参数
 * @param {Object} params - 原始请求参数
 * @returns {Object} 包含签名的完整参数
 */
export function addSignature(params = {}) {
  // 构建完整的签名参数（包含channel、time和业务参数）
  const signParams = {
    channel: SIGNATURE_CONFIG.channel,
    time: Date.now(),
    ...params
  }

  // 使用完整参数生成签名
  const sign = generateSignature(signParams)

  // 返回包含签名的完整参数
  return {
    ...signParams,
    sign
  }
}

/**
 * 获取配置信息
 */
export function getSignatureConfig() {
  return {
    channel: SIGNATURE_CONFIG.channel
  }
}

export default {
  generateSignature,
  addSignature,
  getSignatureConfig
}
