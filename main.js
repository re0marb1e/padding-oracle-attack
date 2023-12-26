/**
 * 填充提示攻击破解CBC模式
 */

const _ = require('lodash')
const { skipLine } = require('./lib')
const { createCrypto } = require('./crypto')
const { paddingOracleAttack } = require('./attack')

const test = () => {
  const algorithm = 'aes-128-cbc'
  const ivHex = '068da28f5cc6921e6a9e39535431dde0'
  const { encrypt, decrypt } = createCrypto(algorithm)

  const plaintext = '我决定去企查查上班'
  const plaintextHex = Buffer.from(plaintext).toString('hex')
  const plaintextBlocks = _.map(_.chunk(plaintextHex, '32'), v => _.join(v, ''))
  console.log('明文', plaintextBlocks)

  const encryptedHex = encrypt(plaintextHex, ivHex)
  const cipherBlocks = _.map(_.chunk(encryptedHex, '32'), v => _.join(v, ''))
  console.log('密文', cipherBlocks)

  console.log('根据解密提示，开始破解第一块数据: ', cipherBlocks[0])
  const decipherBlock = paddingOracleAttack(cipherBlocks[0], ivHex, decrypt)

  skipLine(true)
  console.log('破解后的第一块明文: ', decipherBlock)
  console.log('第一块明文: ', plaintextBlocks[0])
  console.log('匹配是否成功', decipherBlock === plaintextBlocks[0])
}

test()
