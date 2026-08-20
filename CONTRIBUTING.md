# 贡献

## 目录

```text
src/     # TypeScript 源码
test/    # vitest
```

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm install` | 首次安装（并装 git hooks） |
| `npm run lint` | biome 检查 |
| `npm run lint:fix` | biome 自动修复 |
| `npm run typecheck` | 类型检查 |
| `npm test` | vitest |

提交前跑 `npm test && npm run lint && npm run typecheck`。

## 提交说明

提交须符合 [Conventional Commits](https://www.conventionalcommits.org/)，`commit-msg` 钩子会校验。

```text
<type>[optional scope]: <description>
```

`type` 用 `feat`、`fix`、`docs`、`chore` 等 conventional 类型。`description` 英文、小写开头、句末不加 `.`；首行不超过 100 字符。

```text
docs: add cbc padding notes
fix(oracle): drop invalid first-round branch
```
