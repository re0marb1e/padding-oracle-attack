/**
 * 填充提示攻击破解CBC模式
 */

const _ = require('lodash')
const { xorBuffer, trimPadding, skipLine } = require('./utils')

const setting = { debug: false }

exports.setting = setting

/**
 * 应该填充的Buffer
 */
const getPaddingBuf = (byteSize, n, lessOneByte = false) => {
  const loop = lessOneByte & n > 0 ? n - 1 : n
  const buffer = Buffer.alloc(byteSize)
  for (let i = 0; i < loop; i++) {
    buffer.writeUInt8(n, byteSize - i - 1)
  }
  return buffer
}

exports.getPaddingBuf = getPaddingBuf

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
const getTestInitializationVector = ({ byteSize, decipheredBytes, testNum, testPos }) => {
  const buffer = Buffer.alloc(byteSize)
  if (decipheredBytes) {
    const offset = byteSize - Buffer.byteLength(decipheredBytes)
    buffer.write(decipheredBytes.toString('hex'), offset, Buffer.byteLength(decipheredBytes), 'hex')
  }
  buffer.writeUInt8(testNum, byteSize + testPos)
  return buffer
}

/**
 * 破译出中间值
 * @param {string} currentBlockHex 
 * @param {Function} decrypt 
 * @returns 
 */
const crackCipherBlock = (cipherBlock, decrypt) => {
  const blockSize = 16
  const stacks = []
  if (setting.debug) {
    skipLine(true)
    console.log(`开始破译${cipherBlock}的中间值`)
  }

  for (let n = 0; n < blockSize; n++) {
    const position = n+1
    if (position > 1) {
      for(const stack of stacks) {
        // 破解最后第position个字节
        for (let i = 0; i < 256; i++) {
          // 生成用于撞击的IV
          const thisTestIV = getTestInitializationVector({
            byteSize: blockSize,
            testNum: i,
            testPos: -position,
            decipheredBytes: _.last(stack).nextBaseIV
          })
          try {
            // 尝试解密
            decrypt(thisTestIV.toString('hex') + cipherBlock)

            // 解密正确，代表填充正确

            // 最后position字节均为填充字节
            const paddingBuf = getPaddingBuf(blockSize, position)

            const intermediateBlock = xorBuffer(thisTestIV, paddingBuf)

            const nextPaddingBufLessOneByte = getPaddingBuf(blockSize, position + 1, true)

            stack.push({
              thisTestIV,
              // 下一轮将在这个基础上开始生成测试IV
              nextBaseIV: xorBuffer(intermediateBlock, nextPaddingBufLessOneByte),
              // 中间值
              intermedia: intermediateBlock
            })
            break
          } catch (e) {
            // 抛错忽略
          }
        }
      }
    } else {
      // 破解最后第position个字节
      for (let i = 0; i < 256; i++) {
        // 生成用于撞击的IV
        const thisTestIV = getTestInitializationVector({
          byteSize: blockSize,
          testNum: i,
          testPos: -position
        })
        try {
          // 尝试解密
          decrypt(thisTestIV.toString('hex') + cipherBlock)

          // 解密正确，代表填充正确

          // 第一轮
          // 能够解密正确的InitializationVector并不一定只有一个
          // 可能不同的两个初始化向量
          // 000000000000000000000000000000AB
          // 一个解密出 XXXXXXXXXXXXXXXXXXXXXXXXXXXX0202
          // 一个解密出 XXXXXXXXXXXXXXXXXXXXXXXXXXXX0201

          // 最后position字节均为填充字节
          const paddingBuf = getPaddingBuf(blockSize, position)

          const intermediateBlock = xorBuffer(thisTestIV, paddingBuf)

          const nextPaddingBufLessOneByte = getPaddingBuf(blockSize, position + 1, true)

          stacks.push([{
            thisTestIV,
            // 下一轮将在这个基础上开始生成测试IV
            nextBaseIV: xorBuffer(intermediateBlock, nextPaddingBufLessOneByte),
            // 中间值
            intermedia: intermediateBlock
          }])
        } catch (e) {
          // 抛错忽略
        }
      }
    }
  }

  const successStack = _.find(stacks, stack => stack.length === blockSize)
  const intermedia = _.last(successStack).intermedia
  
  if (setting.debug) {
    console.log(stacks)
    console.log(`破译出的中间值: ${intermedia.toString('hex')}`)
  }

  return intermedia
}

const blockString = (str, blockSize) => {
  return _.map(_.chunk(str, blockSize), v => _.join(v, ''))
}

exports.blockString = blockString

/**
 * 破译密文
 *
 * @param {string} encryptedHex Hex编码格式的初始化向量 + Hex编码格式的密文
 * @param {Function} decrypt 解密函数
 * @returns
 */
const paddingOracleAttack = (encryptedHex, decrypt) => {
  // 将密文分组，其中第一组为IV，剩余组为密文
  const blockSize = 16 // TODO: 不应该写死
  const cipherBlocks = blockString(encryptedHex, blockSize * 2)
  if (setting.debug) {
    console.log('初始化向量')
    console.log(cipherBlocks[0])
    console.log('密文分组')
    console.log(_.drop(cipherBlocks, 1))
  }

  // 依次破译第2组开始的密文
  let decrypted = ''
  for (let i = 0; i < cipherBlocks.length - 1; i ++ ){
    // 破译出中间值
    const currentBlock = cipherBlocks[i+1]
    const intermediateBlock = crackCipherBlock(currentBlock, decrypt)
    
    // 中间值与上一个Block异或，结果即为明文Block
    const prevBlock = cipherBlocks[i]
    const plaintextBlock = xorBuffer(intermediateBlock, Buffer.from(prevBlock, 'hex')).toString('hex')
    decrypted += plaintextBlock
  }
  if (setting.debug) {
    console.log('破译后明文')
    console.log(blockString(decrypted, 32))
  }
  return trimPadding(decrypted)
}

exports.paddingOracleAttack = paddingOracleAttack
