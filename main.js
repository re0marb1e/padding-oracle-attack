/**
 * 填充提示攻击破解CBC模式
 */

const _ = require('lodash')
const { createCrypto } = require('./crypto')
const { paddingOracleAttack } = require('./src/attack')

const test = () => {
  const algorithm = 'aes-128-cbc'
  const { encrypt, decrypt } = createCrypto(algorithm)

  const plaintext = '尔滨中央大街鸽子被游客喂成鸽猪热'
  console.log('明文:', plaintext)

  const plaintextHex = Buffer.from(plaintext).toString('hex')
  console.log('明文Hex:', plaintextHex)

  const plaintextBlocks = _.map(_.chunk(plaintextHex, '32'), v => _.join(v, ''))
  console.log('明文Hex分组:', plaintextBlocks)
  
  const encryptedHex = encrypt(plaintextHex)
  console.log('密文Hex:', encryptedHex)

  const cipherBlocks = _.map(_.chunk(encryptedHex, '32'), v => _.join(v, ''))
  console.log('密文Hex分组:', cipherBlocks)

  const decryptedHex = paddingOracleAttack(encryptedHex, decrypt)

  console.log(plaintextHex === decryptedHex)
}

test()
