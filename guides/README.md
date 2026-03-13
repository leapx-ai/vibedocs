# Guides

These guides are shipped with the npm package.

它们不是仓库内部计划文档，而是给使用 VibeDocs 的开发者和 AI 协作流程直接参考的操作指南。

## Included Guides

- `AI-OPERATING-PROTOCOL.md`
- `AI-EXECUTION-MODES.md`
- `MODEL-BOOTSTRAP-CONTRACT.md`

## Recommended Reading Order

1. `AI-OPERATING-PROTOCOL.md`
2. `MODEL-BOOTSTRAP-CONTRACT.md`
3. `AI-EXECUTION-MODES.md`

## How To Use

- Use `AI-OPERATING-PROTOCOL.md` to define how the model should read, trust, and update project docs.
- Use `MODEL-BOOTSTRAP-CONTRACT.md` to define the minimum context a model should load before acting.
- Use `AI-EXECUTION-MODES.md` to choose the right working mode for the current task.

如果你要把这套指南直接给 AI 使用，最稳的做法是：

1. 先让模型加载 `MODEL-BOOTSTRAP-CONTRACT.md`
2. 再让模型遵守 `AI-OPERATING-PROTOCOL.md`
3. 最后按当前任务选择 `AI-EXECUTION-MODES.md` 中的模式
