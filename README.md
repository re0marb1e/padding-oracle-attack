# padding-oracle-attack

分组密码CBC填充提示攻击Node.js演示代码

- 点击查看[CBC模式](https://zh.wikipedia.org/wiki/%E5%88%86%E7%BB%84%E5%AF%86%E7%A0%81%E5%B7%A5%E4%BD%9C%E6%A8%A1%E5%BC%8F#%E5%AF%86%E7%A0%81%E5%9D%97%E9%93%BE%E6%8E%A5%EF%BC%88CBC%EF%BC%89)

- 点击查看[填充提示攻击](https://zh.wikipedia.org/wiki/%E5%AF%86%E6%96%87%E5%A1%AB%E5%A1%9E%E6%94%BB%E5%87%BB)

这里以`aes-128-cbc`加密算法做演示，用`node.js`实现了针对密文的填充提示攻击，在无需知道密钥的前提下，解读明文。
