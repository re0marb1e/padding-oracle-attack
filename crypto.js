/**
 * 填充提示攻击破解CBC模式
 */
const crypto = require('crypto')
const _ = require('lodash')

/**
 * 密码算法
 */
const createCrypto = (algorithm) => {
  // 密钥
  const key = Buffer.from('cfb5343ecca624a0f227e711ed4054c0', 'hex')

  /**
   * 加密
   * 输入: Hex格式的明文
   * 输出: Hex格式的初始化向量 + Hex格式的密文
   */
  function encrypt (plaintextHex) {
    const ivBuf = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(algorithm, key, ivBuf)
    let encrypted = cipher.update(plaintextHex, 'hex', 'hex')
    encrypted += cipher.final('hex')
    return ivBuf.toString('hex') + encrypted
  }

  /**
   * 解密
   * 只进行解密，不返回结果
   * 解密失败 会 报错
   * 输入: Hex格式的初始化向量 + Hex格式的密文
   * 输出: Hex格式的明文
   */
  function decrypt (ciphertextHex) {
    const ivHex = ciphertextHex.substring(0, 32)
    const leftHex = ciphertextHex.substring(32)
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(ivHex, 'hex'))
    let decrypted = decipher.update(leftHex, 'hex', 'hex')
    decrypted += decipher.final('hex')
  }

  return { encrypt, decrypt }
}

exports.createCrypto = createCrypto
