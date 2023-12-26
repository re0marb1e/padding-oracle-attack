/**
 * 填充提示攻击破解CBC模式
 */
const crypto = require('crypto')

/**
 * 密码算法
 */
const createCrypto = (algorithm) => {
  // 密钥
  const key = Buffer.from('cfb5343ecca624a0f227e711ed4054c0', 'hex')

  /**
   * 加密
   */
  function encrypt (plaintextHex, ivHex) {
    const cipher = crypto.createCipheriv(algorithm, key, Buffer.from(ivHex, 'hex'))
    let encrypted = cipher.update(plaintextHex, 'hex', 'hex')
    encrypted += cipher.final('hex')

    return encrypted
  }

  /**
   * 解密
   * 只进行解密，不返回结果
   * 解密失败 会 报错
   */
  function decrypt (ciphertextHex, ivHex) {
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(ivHex, 'hex'))
    let decrypted = decipher.update(ciphertextHex, 'hex', 'hex')
    // eslint-disable-next-line no-unused-vars
    decrypted += decipher.final('hex')
  }

  return { encrypt, decrypt }
}

exports.createCrypto = createCrypto
