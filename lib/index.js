const _ = require('lodash')

/**
 * 两个Buffer按位异或
 */
const xorBuffer = (buf1, buf2) => {
  return buf1.map((b, i) => b ^ buf2[i])
}

exports.xorBuffer = xorBuffer

const skipLine = (withSplitLine = false) => {
  console.log('')
  if (withSplitLine) {
    console.log('====================')
  }
}

exports.skipLine = skipLine

const trimPadding = (stringHex) => {
  const paddingByte = stringHex.substring(stringHex.length - 2, stringHex.length)
  const paddingLoop = parseInt(paddingByte, 16)
  if (paddingLoop > 16) return stringHex
  const paddingString = _.repeat(paddingByte, paddingLoop)
  const tailString = stringHex.substring(stringHex.length - paddingString.length, stringHex.length)
  if (tailString !== paddingString) return stringHex
  return stringHex.substring(0, stringHex.length - paddingString.length)
}

exports.trimPadding = trimPadding
