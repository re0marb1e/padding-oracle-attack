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
