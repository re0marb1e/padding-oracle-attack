/**
 * @file attack.test.ts
 * @description 用固定 IV 的 aes-128-cbc oracle 验证填充提示攻击能还原明文。
 */

import { describe, expect, it } from 'vitest';
import { createCrypto } from '../../src/crypto.js';
import { paddingOracleAttack } from '../../src/index.js';

const PLAINTEXTS = [
  '尔滨中央大街鸽子被游客喂成鸽猪热',
  '风急天高猿啸哀，渚清沙白鸟飞回。无边落木萧萧下，不尽长江滚滚来。万里悲秋常作客，百年多病独登台。艰难苦恨繁霜鬓，潦倒新停浊酒杯。',
  'True genius resides in the capacity for evaluation of uncertain, hazardous, and conflicting information',
  "Only two things are infinite, the universe and human stupidity, and I'm not sure about the universe.",
  "Parce que c'était lui, parce que c'était moi.",
  "La première qualité du style, c'est la clarté.",
];

describe('paddingOracleAttack', () => {
  const { encrypt, decrypt } = createCrypto('aes-128-cbc', {
    iv: '2f2b01b529e2b15ae8cd49ae7d3e31f0',
    ivEncoding: 'hex',
  });

  it.each(PLAINTEXTS)('restores plaintext %#', (plaintext) => {
    const plaintextHex = Buffer.from(plaintext).toString('hex');
    const encryptedHex = encrypt(plaintextHex);
    const decrypted = paddingOracleAttack(encryptedHex, decrypt);
    expect(decrypted).toBe(plaintextHex);
  });
});
