# Triage Report: QA .41 UI 四状态探针

## 分类

| 字段 | 值 |
| --- | --- |
| Type | maintenance |
| Severity | `●○○○` low |
| Confidence | `●●●` high |
| Effort | `●○○` low |
| Impact | `●○○` low |
| Route | Plan fix |

## Summary

这是一张 QA 探针卡（manual 来源，无外部 issue），目标是验证 factory 插件 .41 UI 的四种卡片状态流转（inbox → plan → review → done/canceled）。卡片本身没有指向具体 bug 报告，probe 行为即卡片流转本身。当前 worktree 为干净的 hono-task-api 示例仓库初始提交，没有可复现的 bug，也没有需要修改的代码——probe 的价值在于跑通 UI 状态机，而非实现功能。

## Next step

进入 plan，由 planner 将 probe 行为转成可验证的轻量计划（例如：在 worktree 中提交一个最小可审计的 probe artifact，使 plan/build/review/done 各阶段都有可检查的落点），随后沿 build → review → done 走完四状态验证。

## Details

### 为什么这样评级
- **Type=maintenance**：非 bug、非 feature request、非文档，是流程验证/基础设施性质的 QA 任务。
- **Severity=low**：探针卡不阻塞任何真实用户工作流，无数据风险、无安全影响。
- **Confidence=high**：卡片标题明确（QA .41 UI 四状态探针），source=manual，worktree 干净且只有一个初始提交（`73f23c2`），没有歧义空间。
- **Effort=low**：planner 只需定义一个最小 probe artifact（例如带说明的 `PROBE.md`）和验证标准，不涉及代码修改。
- **Impact=low**：仅影响 factory 插件自身的 UI 验证链路，不影响外部用户。

### 根因（N/A）
无 bug 可定位。`src/index.ts` 和 `src/routes/tasks.ts` 的 Hono 任务 API 实现完整、可读，内存 Map 存储对示例应用合理；`package.json` 脚本齐全（`dev`/`start`/`test`）。未发现任何异常行为需要归因。

### 复现（N/A）
探针卡不存在「复现 bug」的路径；其验证方式是观察 UI 四状态在卡片流转中的呈现，而非在 worktree 中复现缺陷。

### 假设（Assumptions）
1. probe 卡不需要真实代码改动；planner 阶段应产出一个「可审计的最小 artifact」作为各状态的锚点，避免 build/review 阶段空转。
2. 「四状态」= inbox / plan / review / done，与 factory 卡片的 agent-owned 阶段（triage、plan、build、review）及 stop-and-wait 状态（plan-review、done、canceled）对应。

## Open questions

无——所有决定（probe 形式、artifact 内容）都属于 planner 在下一阶段可自行拍板的执行细节，不需要人类介入。
