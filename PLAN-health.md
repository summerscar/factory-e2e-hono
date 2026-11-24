# QA-V4 E2E: 加 /health 端点

## Goal
给现有 Hono 应用（src/index.ts）新增 GET /health 端点，返回 JSON `{ ok: true, status: 'ok' }`；同时新增一个最小测试验证该端点返回 200 且 body 正确。"完成"的可验证定义：npm test 通过，测试断言 /health 的 status===200 且 JSON 体精确匹配 `{ ok: true, status: 'ok' }`；现有其他路由行为不变。

## Scope
- In：src/index.ts 加 3 行路由；新增 1 个最小测试文件；（可选）README 端点表补一行 /health。
- Out：不改 GET / 的现有响应体、不动 /tasks 路由、不引入新依赖（vitest 已在 devDependencies 且 node_modules 已安装）。

## Phases

### Phase 1: 实现 GET /health
- 改动：src/index.ts 中，在 `app.route('/tasks', tasksRoute)` 附近加：
  ```ts
  app.get('/health', (c) => c.json({ ok: true, status: 'ok' }))
  ```
  放法：与 `app.get('/')` 同风格（单行 c.json），不抽独立路由模块（最小改动原则；现有 tasks 是独立模块因为逻辑多，health 一行不需要）。
- 备选（已否决）：新建 src/routes/health.ts 模块再挂载——对单行端点过度设计，且与现有 index.ts 里 `GET /` 的写法不一致。
- 验证（人工冒烟，非强制）：`npm start` 后 `curl -s localhost:8787/health`（端口以 src/index.ts 实际为准，当前 index.ts 未见 listen，冒烟以测试为准，可不跑）。
- 测试证明：Phase 2 的测试。

### Phase 2: 最小测试
- 新增 src/health.test.ts（匹配 vitest 默认 include `**/*.{test,spec}.ts`）：
  ```ts
  import { describe, expect, it } from 'vitest'
  import app from './index'

  describe('GET /health', () => {
    it('returns 200 with { ok: true, status: "ok" }', async () => {
      const res = await app.request('/health')
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ ok: true, status: 'ok' })
    })
  })
  ```
  - 用 `app.request()`（Hono 内置 fetch 测试方式），不起真实服务器，保持最小。
  - `toEqual` 断言 body 精确等于目标 JSON（含 key 与 value）。
  - 只测卡片要求的两个点：status 200 + body 正确；不额外覆盖其他路由（卡片明确"不要改动其他路由"，且本卡片只要求最小测试）。
- 验证命令（在本仓库 worktree 内跑）：
  ```
  npm test
  ```
  即 `vitest run`。通过标准：exit 0，health.test.ts 中该用例 green。
  当前基线事实：仓库此前**无任何测试文件**，`npm test` 输出 "No test files found" 且 exit 1；Phase 2 之后该行为消除，这是可观察的"修复前→修复后"差异。

### Phase 3（可选，不阻塞验收）: README 补端点
- README.md 端点表加一行 `| GET | /health | Health check |`，并把原 `GET /` 行描述从 "Health check" 改为 "Service info"（消除与新增端点的命名歧义）。纯文档，改动 2 行。
- 若追求最小 diff 可跳过；不影响 Phase 1/2 验收。

## Risks
- **误伤其他路由**：只在 index.ts 追加新 handler，不改现有行；Phase 2 验证后可再跑一次 `npm test` 确认全绿。若担心，可给现有路由补一条最小回归断言（本卡片未要求，默认不加）。
- **vitest 无 config**：默认 include 模式即覆盖 `src/**/*.test.ts`，无需新建 vitest.config.*；若日后加 config 再核对。
- **端口/启动假设**：`app.request` 不走网络，无端口问题；src/index.ts 未见 `app.listen`，卡片也不要求，不引入。

## Assumptions
1. body 精确为 `{ ok: true, status: 'ok' }`（卡片原文如此，status 取小写 'ok'）。
2. 测试放 `src/health.test.ts`，用 Hono `app.request`，不加新依赖。
3. 不改 `GET /` 的响应体；README 调整属可选 Phase 3。
4. 验收命令就是仓库既有的 `npm test`（package.json scripts.test="vitest run"），不发明新命令。

## Open questions
无。