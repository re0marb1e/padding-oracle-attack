# padding-oracle-attack

分组密码 CBC 填充提示攻击演示：在不知道密钥的前提下，只靠「解密成功 / 填充错误」恢复 `aes-128-cbc` 明文。

- [CBC 模式](https://zh.wikipedia.org/wiki/%E5%88%86%E7%BB%84%E5%AF%86%E7%A0%81%E5%B7%A5%E4%BD%9C%E6%A8%A1%E5%BC%8F#%E5%AF%86%E7%A0%81%E5%9D%97%E9%93%BE%E6%8E%A5%EF%BC%88CBC%EF%BC%89)
- [填充提示攻击](https://zh.wikipedia.org/wiki/%E5%AF%86%E6%96%87%E5%A1%AB%E5%A1%9E%E6%94%BB%E5%87%BB)

## 快速开始

```bash
npm install
npm test
```

## 用法

```ts
import { createCrypto, paddingOracleAttack } from './src/index.js';

const algorithm = 'aes-128-cbc';
const { encrypt, decrypt } = createCrypto(algorithm);

const plaintext = '尔滨中央大街鸽子被游客喂成鸽猪热';
const plaintextHex = Buffer.from(plaintext).toString('hex');
const encryptedHex = encrypt(plaintextHex);
const decryptedHex = paddingOracleAttack(encryptedHex, decrypt);
console.log(plaintextHex === decryptedHex);
```

`encrypt` 输入/输出均为 hex；`decrypt` 只做填充校验，失败抛错，作为 oracle。

## 特殊案例

- 加密算法 `aes-128-cbc`
- 密钥 Hex `cfb5343ecca624a0f227e711ed4054c0`
- 初始化向量 Hex `2f2b01b529e2b15ae8cd49ae7d3e31f0`

加密 `La première qualité du style, c'est la clarté.`（UTF-8）得到密文块（Hex）：

```json
[
  "fa4917c4cfc11995df05e8d167de2e0a",
  "ebbca85e4fa0ebf0e4e126d6d0bf9d72",
  "5e95a07beff4426ef386dbe642087a88",
  "1d6c1b7717f3eb6143500d9353491903"
]
```

破解第二个密文块（`C2`）时，两组 C1 都能通过填充校验：

- `<Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 28>`（明文 `9620630766e17de0ff769ca80bbb0202`）
- `<Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 2b>`（明文 `9620630766e17de0ff769ca80bbb0201`）

第一组会干扰后续破译。不知道明文时只能两条分支都走；走不通的分支在倒数第三个字节会没有任何 C1 能让 C2 解密成功，即可丢掉。
