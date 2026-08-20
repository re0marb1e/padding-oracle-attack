# CLAUDE.md

本文件为 Claude Code（claude.ai/code）在本仓库工作时提供指引。

## 项目速览

单包 TypeScript playground：演示 CBC 填充提示攻击。给定只回答「解密成功 / 填充错误」的 oracle，在不知道密钥的前提下恢复 `aes-128-cbc` 明文。

## 项目结构

```text
padding-oracle-attack/
├── src/index.ts                     # 攻击主流程
├── src/crypto.ts                    # 演示用加解密（固定密钥；解密失败当 oracle）
├── src/utils.ts                     # 异或 / 去填充 / 分组
└── test/unit/                       # 单元测试（vitest）
```

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm install` | 装依赖（prepare 装 husky） |
| `npm run dev` | tsx watch 跑源码 |
| `npm run build` | tsc → `dist/` |
| `npm start` | 跑编译产物（需先 build） |
| `npm test` / `npm test -- <name>` | vitest 全量 / 按名过滤 |
| `npm run typecheck` | tsc --noEmit |
| `npm run lint` / `lint:fix` | biome |
| `npm run lint:md` | markdownlint |

## Architecture

单包项目，入口 `src/index.ts`；`tsc` 构建到 `dist/`，`node` 运行产物；开发期用 `tsx watch` 直接跑源码。

- **逻辑与 I/O 分离**：加解密（`crypto.ts`）通过 `decrypt` 回调注入攻击逻辑；攻击本身不碰密钥。
- **测试**：`vitest`，用真实 `node:crypto` 当 oracle，不为测试在源码加分支。

## Code Rules

所有 `src/` 下的 TS 文件必须满足以下注释要求：

**文件头部注释**（每个文件顶部必须包含）：

```ts
/**
 * @file <filename>
 * @description <模块职责描述，说明该模块做什么、关键行为和对外契约>
 */
```

**函数注释**（所有导出函数及非显而易见的内部函数必须包含）：

```ts
/**
 * <一句话说明函数用途>
 * @param {<type>} <name> - <描述>
 * @returns {<type>} <描述>
 */
```

更多约定见 `.claude/rules/coding-standards.md`。

**测试中使用 Mock 的规则：** 引入 Mock 必须先向用户说明必要性并征得同意。禁止为测试在实现里加仅供测试的接口；禁止 mock 被测函数内部实现。

## Gotchas

- **提交规范**：conventional commits；commit-msg 用 commitlint，pre-commit 经 lint-staged 对 `*.{ts,tsx,js,jsx,json}` 跑 biome、对 `*.md` 跑 markdownlint-cli2。
- **无 lockfile**：`.npmrc` 设 `package-lock=false`，装依赖用 `npm install`（不是 `npm ci`）。
- **构建产物**：`dist/` 被 git 忽略；`npm start` 前需先 `npm run build`。
