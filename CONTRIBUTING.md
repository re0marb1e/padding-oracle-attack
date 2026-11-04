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

每次提交：`git status` 看清范围，按文件名 `git add`（不用 `git add -A`）。

```text
<type>: <一句话主旨>

<2-5 行说明：做了什么、为什么、有什么副作用>
```

`type` 用 `feat`、`fix`、`docs`、`chore`、`refactor`、`perf`、`test`。一次提交一个 type、一个主题。说明用中文。

破坏性变更在 `type` 后加 `!`（如 `feat!: 下线 v1 接口`），正文加 `BREAKING CHANGE: <影响与迁移方式>`。

`commit-msg` 钩子跑 commitlint（`@commitlint/config-conventional`）：首行不超过 100 字符，说明句末不加 `.`。
