/**
 * 填充提示攻击破解CBC模式
 */
const crypto = require('crypto')

/**
 * 密码算法
 */
const createCrypto = (algorithm, options) => {
  // 密钥
  const secretKey = Buffer.from('cfb5343ecca624a0f227e711ed4054c0', 'hex')
  let iv
  if (options && options.iv) {
    iv = Buffer.from(options.iv, options.ivEncoding || 'utf-8')
  }

  /**
   * 加密
   * @param {string} plaintextHex Hex编码格式的明文
   * @returns Hex编码格式的初始化向量 + Hex编码格式的密文
   */
  function encrypt (plaintextHex) {
    const ivBuf = iv || crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(algorithm, secretKey, ivBuf)
    let encrypted = cipher.update(plaintextHex, 'hex', 'hex')
    encrypted += cipher.final('hex')
    return ivBuf.toString('hex') + encrypted
  }

  /**
   * 解密
   * 只进行解密，不返回结果，但是解密失败会给出错误提示
   * @param {string} ciphertextHex Hex编码格式的初始化向量 + Hex编码格式的密文
   */
  function decrypt (ciphertextHex) {
    const iv = Buffer.from(ciphertextHex.substring(0, 32), 'hex')
    const leftHex = ciphertextHex.substring(32)
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv)
    let decrypted = decipher.update(leftHex, 'hex', 'hex')
    // eslint-disable-next-line no-unused-vars
    decrypted += decipher.final('hex')
  }

  return { secretKey, encrypt, decrypt }
}

exports.createCrypto = createCrypto
