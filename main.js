/**
 * 填充提示攻击破解CBC模式
 */
const crypto = require('crypto')
const _ = require('lodash')
const { xorBuffer, skipLine } = require('./lib')
const { createCrypto } = require('./crypto')

/**
 * 应该填充的Buffer
 */
const getPaddingBuf = (n, lessOneByte = false) => {
  const loop = lessOneByte & n > 0 ? n - 1 : n
  const buffer = Buffer.alloc(loop)
  for (let i = 0; i < loop; i++) {
    buffer.writeUInt8(n, i)
  }
  return buffer
}

/**
 * 填充提示攻击的IV生成器
 * { byteSize: 16, testNum: 1, testPos: -1 }
 * => <Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 01>
 * { byteSize: 16, testNum: 1, testPos: -2 }
 * => <Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 01 00>
 * { byteSize: 16, testNum: 200, testPos: -1 }
 * => <Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 c8>
 * { byteSize: 16, tailBuffer: Buffer.from('123456', 'hex'), testNum: 1, testPos: -4 }
 * => <Buffer 00 00 00 00 00 00 00 00 00 00 00 00 01 12 34 56>
 */
const getTestIVBuffer = ({ byteSize, tailBuffer, testNum, testPos }) => {
  const buffer = Buffer.alloc(byteSize)
  if (tailBuffer) {
    const offset = byteSize - Buffer.byteLength(tailBuffer)
    buffer.write(tailBuffer.toString('hex'), offset, Buffer.byteLength(tailBuffer), 'hex')
  }
  buffer.writeUInt8(testNum, byteSize + testPos)
  return buffer
}

/**
 * 填充提示攻击代码示例
 * 已知初始化向量, 密文, 可利用解密函数
 */
const paddingOracleAttack = (cipherBlock, ivHex, decrypt) => {
  let tailBuffer, interBuf
  for (let n = 0; n < 16; n++) {
    console.log('')
    console.log('====================')
    console.log(`破解最后第${n}个字节`)
    const paddingBuf = getPaddingBuf(n + 1)
    console.log('本轮明文应该填充的字节:', paddingBuf.toString('hex'))
    for (let i = 0; i < 256; i++) {
      // 生成用于撞击的IV
      const testIVBuffer = getTestIVBuffer({
        byteSize: 16,
        tailBuffer,
        testNum: i,
        testPos: -n - 1
      })
      const ivTestHex = testIVBuffer.toString('hex')
      try {
        // 尝试解密
        decrypt(cipherBlock, ivTestHex)
        const buf = Buffer.from(ivTestHex, 'hex').subarray(16 - n - 1)
        console.log('解密成功的IV:', ivTestHex, buf)

        interBuf = xorBuffer(buf, paddingBuf)
        console.log('中间值:', interBuf)

        const nextPaddingBufLessOneByte = getPaddingBuf(n + 2, true)
        console.log('nextPaddingBufLessOneByte', nextPaddingBufLessOneByte)
        tailBuffer = xorBuffer(interBuf, nextPaddingBufLessOneByte)
        console.log('下一轮起始IV', tailBuffer)
        // console.log()
        // f(53) @ 07 = 01
        break
      } catch (e) {
        // 抛错忽略
      }
    }
  }
  return xorBuffer(interBuf, Buffer.from(ivHex, 'hex')).toString('hex')
}

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
