/**
 * 填充提示攻击破解CBC模式
 */

const _ = require('lodash')
const { trimPadding } = require('./lib')
const { createCrypto } = require('./crypto')
const { paddingOracleAttack } = require('./attack')

const test = () => {
  const algorithm = 'aes-128-cbc'
  const { encrypt, decrypt } = createCrypto(algorithm)

  const plaintext = '我决定去苏州工业园区上班'
  console.log('明文:', plaintext)

  const plaintextHex = Buffer.from(plaintext).toString('hex')
  console.log('明文Hex:', plaintextHex)

  const plaintextBlocks = _.map(_.chunk(plaintextHex, '32'), v => _.join(v, ''))
  console.log('明文Hex分组:', plaintextBlocks)
  
  const encryptedHex = encrypt(plaintextHex)
  console.log('密文Hex:', encryptedHex)

  const cipherBlocks = _.map(_.chunk(encryptedHex, '32'), v => _.join(v, ''))
  console.log('密文Hex分组:', cipherBlocks)

  let decrypted = ''
  for (let i = 0; i < cipherBlocks.length - 1; i ++ ){
    const prevBlock = cipherBlocks[i]
    const currentBlock = cipherBlocks[i+1]
    const decipherBlock = paddingOracleAttack(currentBlock, prevBlock, decrypt)
    decrypted += decipherBlock
  }

  console.log(trimPadding(decrypted))
  console.log(plaintextHex === trimPadding(decrypted))
}

test()
