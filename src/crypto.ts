/**
 * @file crypto.ts
 * @description 演示用 aes-128-cbc 加解密。密钥固定；解密失败抛错，供 oracle 判别填充。
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const DEMO_KEY = Buffer.from('cfb5343ecca624a0f227e711ed4054c0', 'hex');

export type CryptoOptions = {
  iv?: string;
  ivEncoding?: BufferEncoding;
};

export type DemoCrypto = {
  secretKey: Buffer;
  encrypt: (plaintextHex: string) => string;
  decrypt: (ciphertextHex: string) => void;
};

/**
 * 按算法生成加密 / 解密函数。解密只做填充校验，不把明文交回调用方。
 */
export function createCrypto(algorithm: string, options?: CryptoOptions): DemoCrypto {
  const secretKey = DEMO_KEY;
  const fixedIv = options?.iv ? Buffer.from(options.iv, options.ivEncoding ?? 'utf-8') : undefined;

  function encrypt(plaintextHex: string): string {
    const ivBuf = fixedIv ?? randomBytes(16);
    const cipher = createCipheriv(algorithm, secretKey, ivBuf);
    let encrypted = cipher.update(plaintextHex, 'hex', 'hex');
    encrypted += cipher.final('hex');
    return ivBuf.toString('hex') + encrypted;
  }

  function decrypt(ciphertextHex: string): void {
    const iv = Buffer.from(ciphertextHex.substring(0, 32), 'hex');
    const leftHex = ciphertextHex.substring(32);
    const decipher = createDecipheriv(algorithm, secretKey, iv);
    decipher.update(leftHex, 'hex', 'hex');
    decipher.final('hex');
  }

  return { secretKey, encrypt, decrypt };
}
