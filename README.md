# padding-oracle-attack

分组密码CBC填充提示攻击Node.js演示代码

- 点击查看[CBC模式](https://zh.wikipedia.org/wiki/%E5%88%86%E7%BB%84%E5%AF%86%E7%A0%81%E5%B7%A5%E4%BD%9C%E6%A8%A1%E5%BC%8F#%E5%AF%86%E7%A0%81%E5%9D%97%E9%93%BE%E6%8E%A5%EF%BC%88CBC%EF%BC%89)

- 点击查看[填充提示攻击](https://zh.wikipedia.org/wiki/%E5%AF%86%E6%96%87%E5%A1%AB%E5%A1%9E%E6%94%BB%E5%87%BB)

这里以`aes-128-cbc`加密算法做演示，用`node.js`实现了针对密文的填充提示攻击，在无需知道密钥的前提下，解读明文。

## 测试

```javascript
const { createCrypto } = require('./crypto')

/**
 * 根据选择的算法，生成加密函数与解密函数
 * 
 * 加密函数:
 * 输入: Hex编码格式的明文
 * 输出: Hex编码格式的初始化向量 + Hex编码格式的密文
 * 
 * 解密函数:
 * 输入: Hex编码格式的初始化向量 + Hex编码格式的密文
 * 只进行解密，不返回结果，但是解密失败会给出错误提示
 */
const algorithm = 'aes-128-cbc'
const { encrypt, decrypt } = createCrypto(algorithm)

/**
 * 进行加密
 */
const plaintext = '尔滨中央大街鸽子被游客喂成鸽猪热'
// UTF-8转HEX
const plaintextHex = Buffer.from(plaintext).toString('hex')
// 加密
const encryptedHex = encrypt(plaintextHex)
// Padding Oracle Attack解密
const decryptedHex = paddingOracleAttack(encryptedHex, decrypt)
// 结果
console.log(`Padding Oracle Attack破解后明文与原始明文是否相等: ${plaintextHex === decrypted ? 'yes': 'no'}`)
```
