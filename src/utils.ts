/**
 * @file utils.ts
 * @description 填充提示攻击用的字节运算与调试输出。
 */

/**
 * 两个 Buffer 按位异或。调用方保证长度一致。
 */
export function xorBuffer(buf1: Buffer, buf2: Buffer): Buffer {
  return Buffer.from(buf1.map((b, i) => b ^ buf2[i]));
}

/**
 * 调试用空行；`withSplitLine` 时再打一条分隔线。
 */
export function skipLine(withSplitLine = false): void {
  console.log('');
  if (withSplitLine) {
    console.log('====================');
  }
}

/**
 * 按 PKCS#7 语义去掉 hex 明文尾部填充；填充不合法则原样返回。
 */
export function trimPadding(stringHex: string): string {
  const paddingByte = stringHex.substring(stringHex.length - 2, stringHex.length);
  const paddingLoop = Number.parseInt(paddingByte, 16);
  if (paddingLoop > 16) return stringHex;
  const paddingString = paddingByte.repeat(paddingLoop);
  const tailString = stringHex.substring(stringHex.length - paddingString.length, stringHex.length);
  if (tailString !== paddingString) return stringHex;
  return stringHex.substring(0, stringHex.length - paddingString.length);
}

/**
 * 把字符串按 `blockSize` 切成块（最后一块可以短）。
 */
export function blockString(str: string, blockSize: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < str.length; i += blockSize) {
    out.push(str.slice(i, i + blockSize));
  }
  return out;
}
