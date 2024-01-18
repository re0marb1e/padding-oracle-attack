/**
 * 填充提示攻击破解CBC模式测试
 */

const { createCrypto } = require('./crypto')
const { paddingOracleAttack, blockString, setting } = require('../src')

setting.debug = false

const test = () => {
  const plaintexts = [
    '尔滨中央大街鸽子被游客喂成鸽猪热',
    '风急天高猿啸哀，渚清沙白鸟飞回。无边落木萧萧下，不尽长江滚滚来。万里悲秋常作客，百年多病独登台。艰难苦恨繁霜鬓，潦倒新停浊酒杯。',
    'True genius resides in the capacity for evaluation of uncertain, hazardous, and conflicting information',
    'Only two things are infinite, the universe and human stupidity, and I\'m not sure about the universe.',
    'Parce que c\'était lui, parce que c\'était moi.',
    'La première qualité du style, c\'est la clarté.'
  ]
  const algorithm = 'aes-128-cbc'
  const { encrypt, decrypt } = createCrypto(algorithm, { iv: '2f2b01b529e2b15ae8cd49ae7d3e31f0', ivEncoding: 'hex'})

  for(const plaintext of plaintexts) {
    // UTF-8转HEX
    const plaintextHex = Buffer.from(plaintext).toString('hex')
    // 加密
    const encryptedHex = encrypt(plaintextHex)
    // Padding Oracle Attack解密
    const decrypted = paddingOracleAttack(encryptedHex, decrypt)
    // 判定
    const checkRs = plaintextHex === decrypted ? 'yes': 'no'
    // 结果
    console.log(`Padding Oracle Attack破解后明文与原始明文是否相等: ${checkRs}`)

    if (checkRs === 'no') {
      console.log('明文')
      console.log(blockString(plaintextHex, 32))
    }
  }
}

test()