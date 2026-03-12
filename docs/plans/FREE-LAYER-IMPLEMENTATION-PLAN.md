# 免费层实施计划

Last Updated: 2026-03-12
Status: Active

## 1. 目标

把免费层从“已有模板和策略文档”推进到“有可执行入口的开源产品”。

免费层的完成标准不是文档更完整，而是用户可以在本地完成下面几件事：

- 初始化一套文档系统
- 为复杂功能生成 feature package
- 运行基础巡检
- 获得稳定、可解释的检查结果

## 2. 计划边界

本计划只覆盖免费层：

- 模板仓库
- scaffold
- 基础 CLI
- 共享规则引擎

本计划不覆盖：

- PR 检查
- 自动巡检托管
- 健康度面板
- 团队规则包
- 迁移助手
- 行业模板包的深度版本

## 3. 当前起点

当前仓库已经具备：

- 方法论文档
- 模板目录
- scaffold 目录
- 开源 / 付费产品边界文档
- 共享规则引擎规格文档
- 可运行 CLI：`init / feature create / audit / glossary check`
- 共享规则引擎最小实现
- 稳定 JSON report envelope
- 本地只读 rule pack 消费
- 对外 package 元数据与发布说明
- 公开使用文档站源码：`website/`
- GitHub Actions：CI / Pages / publish
- 干净安装验收脚本：`npm run smoke:install`
- versioning / changelog 基线
- diff audit 的初始 `suggested_docs` 映射能力

当前缺少：

- GitHub Pages 首次启用与线上回验
- npm trusted publisher 配置与首次正式发布
- 更广覆盖的 affected-doc mapping

## 4. 成功标准

免费层完成后，至少应满足：

1. 用户在一个空仓库里可用一条命令初始化 `Minimal` 文档系统
2. 用户可为一个新功能生成标准 feature package
3. 用户可在本地运行 audit，并得到结构化结果
4. 检查输出能被后续 PR 检查和自动巡检复用
5. 用户不需要依赖云服务即可使用核心能力

## 5. 执行顺序

免费层按 6 个阶段推进：

1. `Foundation`
2. `CLI Skeleton`
3. `Init Command`
4. `Feature Create Command`
5. `Audit Command + Core Rules`
6. `Glossary Check Command`

这个顺序不建议打乱。

原因：

- 没有 CLI 骨架，就没有稳定入口
- 没有规则引擎，就会在 `audit` 和未来 PR 检查里重复实现判断逻辑
- `init` 是 adoption 入口，应早于其它命令
- `audit` 的价值依赖共享规则层，不能先做成一堆一次性脚本

## 6. 阶段计划

### 6.1 Phase 0 · Foundation

目标：

- 确认免费层技术基础与目录结构

本阶段交付物：

- CLI 运行时选择
- 包结构与目录约定
- 命令入口约定
- 规则结果格式草案

建议默认技术路线：

- `Node.js + TypeScript`

原因：

- CLI 生态成熟
- 后续接 GitHub / PR 工作流成本低
- 对开源分发和本地运行都友好

阶段门禁：

- 明确 CLI 主入口
- 明确命令目录结构
- 明确规则引擎与命令层的边界

### 6.2 Phase 1 · CLI Skeleton

目标：

- 建立可运行的 CLI 工程骨架

本阶段交付物：

- `package.json`
- TypeScript 基础配置
- CLI entrypoint
- 命令注册机制
- 基础日志与错误输出约定

阶段门禁：

- `vibedocs --help` 可运行
- 子命令可以注册并显示
- CLI 能稳定读取当前工作目录

### 6.3 Phase 2 · Init Command

目标：

- 让用户一条命令生成 `docs/` 骨架

本阶段交付物：

- `vibedocs init`
- 选择 `Minimal / Standard / Full`
- 从 `scaffold/docs/` 复制文件
- 项目名、owner、阶段等基础占位回填
- 冲突检测与覆盖提示

阶段门禁：

- 在空目录中可成功初始化
- 重复执行时不会无提示覆盖已有文件
- 生成结果与 `scaffold/` 保持一致

### 6.4 Phase 3 · Feature Create Command

目标：

- 让复杂功能具备快速补齐局部文档的能力

本阶段交付物：

- `vibedocs feature create <name>`
- 生成 `docs/features/<feature>/`
- 生成 `PRD / WIREFLOW / TECH-SPEC / ACCEPTANCE / ANALYTICS`
- 输出建议回写的全局文档提示

阶段门禁：

- 能稳定生成 feature package
- feature 名称可被规范化成安全目录名
- 生成结果不污染全局文档

### 6.5 Phase 4 · Audit Command + Core Rules

目标：

- 让免费层具备可信的本地检查能力

本阶段交付物：

- `vibedocs audit`
- 共享规则引擎最小实现
- 标准结果对象格式
- 第一批核心规则
- 文本 / JSON / Markdown 输出

第一批核心规则：

1. `core.structure.minimal_docs_exist`
2. `core.metadata.active_doc_required_fields`
3. `core.ssot.document_map_exists`
4. `core.ssot.single_status_source`
5. `core.structure.feature_package_required_files`
6. `core.terminology.glossary_exists`
7. `core.terminology.glossary_term_drift`
8. `core.freshness.snapshot_not_used_as_active`

阶段门禁：

- audit 可在本地扫描仓库并输出结果
- 输出格式稳定，可被后续付费层复用
- 规则逻辑不写死在命令层

### 6.6 Phase 5 · Glossary Check Command

目标：

- 把术语一致性检查做成单独入口

本阶段交付物：

- `vibedocs glossary check`
- 指定目录扫描能力
- 术语冲突报告
- 建议统一口径输出

阶段门禁：

- 可读取 `GLOSSARY`
- 可在局部路径运行
- 输出与规则引擎结果结构兼容

## 7. 建议的仓库级交付物

当免费层完成第一轮后，仓库里至少应新增：

- CLI 源码目录
- 规则引擎源码目录
- 命令级测试
- 示例输出
- 使用说明

建议最小结构：

```text
src/
  cli/
  commands/
  rule-engine/
  filesystem/
  reporting/

tests/
  commands/
  rule-engine/
```

## 8. 第一批任务清单

建议直接按下面顺序开工：

1. 建 CLI 工程骨架
2. 建规则结果对象与 severity 枚举
3. 实现 `vibedocs init`
4. 实现 feature package 生成器
5. 实现 8 条核心规则
6. 接入 `vibedocs audit`
7. 再实现 `vibedocs glossary check`

## 9. 非目标

免费层第一轮不要扩到这些方向：

- 在线编辑器
- GitHub App
- SaaS 面板
- 自动通知
- 团队规则 DSL
- 复杂迁移编排

这些会明显拖慢 adoption 层落地。

## 10. 风险与控制点

### 10.1 风险：先写命令，后补规则层

问题：

- 后续 PR 检查会重复实现判断逻辑

控制：

- `audit` 之前先落规则结果格式

### 10.2 风险：`init` 做成不可重复执行

问题：

- 用户第二次运行容易覆盖真实文档

控制：

- 默认提示冲突，不直接覆盖

### 10.3 风险：输出结果不稳定

问题：

- 无法被付费层消费

控制：

- 从第一版开始就固定结果对象模型

## 11. 与后续付费层的接口

免费层完成后，应为付费层留下明确接口：

- 规则 ID
- 规则结果格式
- 严重级别模型
- diff-ready 的上下文模型
- Markdown / JSON 报告输出

这样 PR 检查和自动巡检可以直接复用，而不是重写。

## 12. 结论

免费层现在不再缺“方向”，而是缺“执行入口”。

所以最合理的推进方式不是继续补理论，而是按下面顺序实做：

## 13. 当前下一阶段任务

在免费层第一轮核心闭环完成后，下一阶段按下面 6 项推进：

1. 回写免费层实施计划状态
   Status: Completed
2. 建公开使用文档站
   Status: Completed
3. 补 CI / release automation
   Status: Completed
4. 做干净环境安装验收
   Status: Completed
5. 定 versioning / changelog 流程
   Status: Completed
6. 做更准确的 affected-doc mapping
   Status: In Progress

这个顺序的原则是：

- 先把对外入口和当前状态说清楚
- 再把自动化和发布链补齐
- 最后继续增强规则能力

## 14. 延后处理事项

关于“公开仓库与私有仓库如何拆分，以避免暴露内部理念、方法论、计划”的问题，当前先不立即处理。

执行约束如下：

- 先完成上面的 6 项任务
- 在这 6 项任务完成前，不调整仓库拆分策略
- 免费层实现所依赖的执行文档，继续保留在当前仓库
- 待 6 项任务完成后，再统一评估公开 / 私有内容边界、仓库拆分方式和文档站公开范围

1. CLI 骨架
2. 规则引擎最小实现
3. `init`
4. `feature create`
5. `audit`
6. `glossary check`

这份文档的作用，就是把这个顺序固定下来，作为后续实现的执行基线。
