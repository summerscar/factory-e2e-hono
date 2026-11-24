# Plan: 新增 `GET /probe` 端点（QA .57 补验）

**Card**: 0388db61-a529-4263-b131-cce91cca6cdc
**Title**: QA .57 补验: add /probe endpoint
**Branch**: `factory/0388db61-a529-4263-b131-cce91cca6cdc`
**Base commit**: `73f23c2` (feat: initial hono task API with list/get/create endpoints)

## Goal

在本分支上新增一个 `GET /probe` 端点，返回 `200` 与 `{"ok":true}`，并附一个最小 vitest 测试；完成后提交并推送本分支（不开 PR、不合并）。

## 仓库现状（已核实，2026-11-25 工作树）

- `src/index.ts`：`Hono` 应用，现有 `GET /`（健康检查，返回 `{ name, status }`）与 `app.route('/tasks', tasksRoute)`。
- 本分支上**不存在**任何 `*.test.ts` / `*.spec.ts`，也**没有** `vitest.config.*` / `vite.config.*`。`vitest ^2.1.0` 已在 `package.json` devDependencies，`npm test` 即 `vitest run`，`node_modules/.bin/vitest` 已安装。
- 远程同系列其他 QA 分支已有同类探针提交（`664cbe9` 的 `GET /ready` + `src/index.test.ts`），可作为**模式参考**（测试写法照搬其形状，但本分支独立实现，不 cherry-pick）。

## 变更内容

### Phase 1: 实现 `GET /probe`

- 修改 `src/index.ts`，在 `app.get('/', ...)` 之后、`app.route('/tasks', ...)` 之前插入一行（与 `/ready` 的写法对齐）：

  ```ts
  app.get('/probe', (c) => c.json({ ok: true }))
  ```

- 不触碰 `src/routes/tasks.ts`、`src/types.ts`。

### Phase 2: 新增最小 vitest 测试

- 新建 `src/index.test.ts`（沿用同系列分支的命名位置；vitest 默认 glob 即发现），内容：

  ```ts
  import { describe, expect, it } from 'vitest'
  import app from './index'

  describe('GET /probe', () => {
    it('returns 200 with { ok: true }', async () => {
      const res = await app.request('/probe')
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ ok: true })
    })
  })
  ```

### Phase 3: 文档同步（低风险可选）

- `README.md` 的 Endpoints 表格新增一行：

  ```
  | GET | `/probe` | QA probe (returns `{ "ok": true }`) |
  ```

- 若跳过：build 报告里写"README 未更新，不影响功能"。

## Verification

逐条执行并保留真实输出（build 阶段做）：

1. **回归基线**（实现前先跑一次，证明新测试确实"无端点即失败"）：
   - 先只写测试文件、不写端点 → `npx vitest run` 应**失败**（404 或 body 不匹配），证明测试有效。
   - 再补上端点 → 同一命令应**通过**。
2. **类型检查**：`npx tsc --noEmit` 应干净（退出码 0，无输出）。
3. **全量测试**：`npm test`（即 `vitest run`）应通过，输出 `1 passed`。

## 提交与交付（build 阶段）

- 变更文件：`src/index.ts`（+1 行）、`src/index.test.ts`（新，10 行）、`README.md`（+1 行，若执行 Phase 3）。
- 不提交 `package-lock.json`（工作树上未跟踪，仓库 `.gitignore` 惯例不纳管它；build 提交时确认 `git status --porcelain` 只含上述三个路径）。
- 提交信息（conventional commits，与本仓库历史风格一致）：

  ```
  feat: add GET /probe QA endpoint returning {"ok":true}

  - src/index.ts: add `app.get('/probe', ...)` returning 200 + { ok: true }
  - src/index.test.ts: new minimal vitest case asserting /probe returns 200 and {"ok":true}
  - README.md: document the new /probe endpoint in the endpoint table

  Verified: `npx tsc --noEmit` clean; `npm test` (vitest run) passes 1/1.
  ```

- 推送：推本分支到 origin，**不开 PR、不合并、不 force**。

## 风险与假设

- 单行端点 + 单测试，无外部依赖、无运行时行为变化，风险极低。
- 假设：`app.request()` 单测（Hono 原生）即"最小 vitest 测试"的标准形态，不需要真实 HTTP 服务器。
- 假设：本卡只交付本分支的推送；后续 self-review 阶段独立审分支，done/canceled 才由人工收尾。
