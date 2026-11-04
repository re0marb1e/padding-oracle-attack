# 贡献

## 环境

- Node.js ≥ 22
- npm

## 本地开发

```bash
npm install
npm test
```

`npm run dev` 用 tsx watch 跑 `src/index.ts`。

## 提交前

```bash
npm run lint
npm run typecheck
npm test
```

## 提交说明

每次提交：`git status` 看清范围，按文件名 `git add`（不用 `git add -A`）。

```text
<type>: <一句话主旨>

<2-5 行说明：做了什么、为什么、有什么副作用>
```

`type` 用 `feat`、`fix`、`docs`、`chore`、`refactor`、`perf`、`test`。一次提交一个 type、一个主题。说明用中文。

破坏性变更在 `type` 后加 `!`（如 `feat!: 下线 v1 接口`），正文加 `BREAKING CHANGE: <影响与迁移方式>`。

`commit-msg` 钩子跑 commitlint（`@commitlint/config-conventional`）：首行不超过 100 字符，说明句末不加 `.`。
