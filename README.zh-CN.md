<div align="center">

# Agent Handoff Packet

**面向多 Agent 系统的任务交接契约。**

[English README](README.md) · [可行性调研](docs/feasibility.md) · [评估结果](docs/evaluation.md) · [未来格式路线图](docs/roadmap-new-format.md)

</div>

---

Agent Handoff Packet，简称 **AHP**，是一个很小的 v0.1 研究原型：它尝试把 agent 与 agent 之间的任务交接，从“模糊的自然语言聊天”变成“可验证、可审计、可翻译的结构化契约”。

它在 v0.1 阶段并不要求大家放弃 Markdown、JSON、YAML、issue、comment 或现有 agent 协议。相反，它建议在这些已有表面之上增加一层 handoff contract：

```text
人类意图 -> 调度/翻译 Agent -> Agent Packet -> 执行 Agent -> 验证 Packet -> 人类摘要
```

核心判断：

```text
Markdown 适合人类阅读。
Schema 适合工具验证。
Packet 适合 agent 交接。
```

## 为什么需要它

多 Agent 工作流失败时，原因经常不是模型“不聪明”，而是交接不清楚：

- 下游 agent 漏掉了关键约束；
- 验收标准只被暗示，没有被明确写出；
- review agent 不知道该如何判断完成；
- 执行 agent 收到一整段聊天历史，而不是边界清晰的上下文；
- 最终回复缺少修改路径、验证证据、阻塞点或假设。

AHP 的目标是把这些隐含期待变成显式字段。

## 项目状态

| 维度 | 当前状态 |
| --- | --- |
| 公开成熟度 | v0.1 draft / research prototype |
| 当前价值 | 提升任务交接完整性、可验证性、human brief 渲染 |
| 尚未证明 | 真实 agent 任务完成率提升 |
| 不宣称 | 短任务 token 成本下降、正式标准地位 |
| 调研建议 | GO_WITH_SPIKE |

当前 mini evaluation 显示：结构化 packet 的字段完整性更好，但短任务里不比自然语言更省 token。详见 [docs/evaluation.md](docs/evaluation.md) 和 [docs/feasibility.md](docs/feasibility.md)。

## 三个核心角色

### Human View

给人看的 Markdown 摘要。适合用户、维护者、reviewer 和项目负责人阅读。

### Agent Packet

给 agent 和工具看的结构化任务交接包，包含：

- `goal`
- `constraints`
- `inputs`
- `expected_outputs`
- `acceptance`
- `failure_boundary`
- `return_required`

### Scheduler/Translator Agent

调度/翻译 agent 负责在人类语言和 agent packet 之间转换。  
在 Multica 风格工作流中，它类似项目 lead 或 M-Pro 调度官；在 planner/executor/reviewer 工作流中，它可以是 planner 或 orchestrator。

## Packet 示例

```yaml
packet_type: handoff
goal: Implement validator examples
target_agent: executor
constraints:
  - Do not modify protected runtime data
inputs:
  - schemas/packet.schema.json
  - examples/
expected_outputs:
  - validator result
  - changed paths
acceptance:
  - Examples validate successfully
failure_boundary:
  - Stop before publishing external resources
return_required:
  - status
  - changed_paths
  - verification
  - blockers
  - handoff_summary
human_brief: >
  Please implement the validator examples and report verification evidence.
```

## 使用场景

### 多 Agent 编程

把一个实现任务交给执行 agent，并明确文件范围、约束、验收条件和必须返回的字段。

### Review 与验收

要求 review agent 返回证据、阻塞点、假设和 pass/fail 结论，而不是只写一段泛泛总结。

### 调研委派

把一个研究问题交给 research agent，并明确来源要求、不确定性边界和交付物。

### 项目管理 Agent

让调度 agent 把 issue、comment 或用户请求翻译成结构化 packet，同时把 agent 的结果重新渲染成人类可读的评论。

### Agent 协议 Payload

AHP 可以作为 payload convention 放进现有系统里，例如 issue tracker、A2A-style task object、MCP tool output 或自研 workflow engine。

## 与现有系统的关系

AHP 不想替代现有协议。

| 系统 | AHP 的关系 |
| --- | --- |
| Markdown / issue / comment | 人类可读表面 |
| JSON / YAML | v0.1 的输入格式 |
| JSON Schema | 校验层 |
| MCP | 工具、上下文、资源协议；AHP-like packet 可以作为 structured output |
| A2A | agent 互操作协议；AHP 可以作为 task payload convention |
| Multica-style workflow | 调度/翻译 agent + issue 派发 |
| DeerFlow-style workflow | planner -> executor -> reviewer -> reporter 的 packet 链 |

## 快速开始

运行本地检查：

```powershell
npm test
npm run eval
```

验证指定示例：

```powershell
node tools/validate.js examples/markdown-packet.md examples/yaml-packet.yaml examples/json-packet.json
```

渲染 human brief：

```powershell
node tools/render-brief.js examples/markdown-packet.md
```

## 仓库结构

```text
docs/
  principles.md             设计原则
  feasibility.md            可行性判断与风险
  evaluation.md             mini evaluation 与边界
  roadmap-new-format.md     未来 AI-native 语法方向
examples/
  markdown-packet.md
  yaml-packet.yaml
  json-packet.json
  multica-style.yaml
  deerflow-style.yaml
schemas/
  packet.schema.json
tools/
  validate.js
  render-brief.js
  test.js
  evaluate.js
```

## 当前评估结论

本地 mini evaluation：

```text
Cases: 5
Prose required-field accuracy average: 0.70
Packet required-field accuracy average: 1.00
Example pass rate: 5/5
Average token delta, readable packet minus prose: +88.6
Average token delta, compact wire minus prose: +64.4
```

解释：

- AHP 在这个 proxy eval 中提升了确定性的字段完整性。
- AHP 当前不能证明短任务 token 成本更低。
- 下一步真正有价值的是 paired real-agent runs。

## 个人观点

我个人认为，这个方向最后可能会演变成一种专门给 AI 系统读、写、修改、验证的新格式。

v0.1 故意不直接发明最终格式。它只是一个简短的实践草图：先用大家熟悉的格式，积累真实例子，测量哪些字段真的有用，然后让更好的 packet 形状从真实多 Agent 工作流中长出来。

长期看，模型可以通过 prompting、fine-tuning 或 instruction-tuning 来适配这种格式，从而比临时自然语言 handoff 更稳定地处理任务交接。但这是路线图和假设，不是这个仓库已经证明的结论。

## 路线图

近期：

- 收集更多真实 packet 示例；
- 把 AHP 字段映射到 A2A Task/Artifact 和 MCP structured tool output；
- 跑 20 个 prose-vs-packet paired tasks；
- 记录缺字段率、澄清次数、返工次数、完成时间和验证通过率。

长期：

- 实验 compact wire format；
- 等真实示例足够后，再设计可能的 `.ahp` 语法；
- 测试 prompting、instruction tuning 或 fine-tuning 对 packet 格式的适配效果。

## 参与完善

这是一个简短初始想法，不是完成的协议。欢迎在这些方向上继续扩展：

- 真实 agent handoff 示例；
- 更严格或更宽松的 schema；
- 与现有 agent 系统的映射；
- compact syntax 实验；
- tokenizer-aware wire format；
- 与普通自然语言 handoff 的 paired benchmark。

## License

MIT
