# 基础 CLI 产品需求文档

Last Updated: 2026-03-12
Status: Active

## 1. 目标

定义开源基础 CLI 的第一版产品边界，确保它：

- 能让用户快速启用文档系统
- 能把模板与 scaffold 变成真正可执行动作
- 不与未来付费工作流能力混淆

CLI 不是新的文档编辑器，而是文档操作系统的本地执行入口。

为了避免后续和付费工作流重复实现，CLI 必须建立在共享规则引擎之上，而不是在命令层硬编码判断逻辑。

## 2. 目标用户

### 2.1 核心用户

- AI-native 独立开发者
- 小团队技术负责人
- 想把文档系统接入现有仓库的工程师

### 2.2 典型场景

- 新项目从 0 初始化 docs 骨架
- 现有项目补第一套最小起步文档
- 为新功能创建 feature package
- 本地扫描文档系统是否失真

## 3. 核心问题

当前用户即便认同方法论，也仍然会卡在：

- 不知道第一步该生成哪些文件
- 生成了文件，但不知道怎样组织
- 功能新增后，不知道该补哪些文档
- 文档越来越多，但本地没有快速巡检入口

CLI 的任务是把这些动作变成命令，而不是再提供一份阅读材料。

## 4. 产品定位

基础 CLI 是开源免费层的一部分，负责：

- 初始化
- 生成功能包
- 本地巡检
- 输出修改建议
- 消费共享规则引擎结果

它不负责：

- PR 平台集成
- 团队级持续监控
- 云端历史看板

## 5. 第一版命令范围

### 5.1 `vibedocs init`

目标：

- 初始化一套可运行文档系统

第一版能力：

- 选择 `Minimal / Standard / Full`
- 复制 `scaffold/docs/`
- 生成基础入口说明
- 可选择项目名、owner、阶段

输出：

- 项目里的 `docs/` 目录
- 一份初始化摘要

### 5.2 `vibedocs feature create <name>`

目标：

- 为复杂功能建立 feature package

第一版能力：

- 生成 `docs/features/<feature>/`
- 创建 `PRD / WIREFLOW / TECH-SPEC / ACCEPTANCE / ANALYTICS`
- 生成最小目录内说明

输出：

- feature package 文件组
- 建议回写的全局文档提示

### 5.3 `vibedocs audit`

目标：

- 在本地快速检查文档系统的结构问题

第一版能力：

- 检查是否存在最小起步文档
- 检查 Active 文档是否缺少基本元信息
- 检查基础命名与目录角色是否异常
- 检查常见 SSOT 冲突
- 输出缺失文档建议

输出：

- 终端摘要
- 可选 Markdown 报告

### 5.4 `vibedocs glossary check`

目标：

- 检查核心术语是否存在明显漂移

第一版能力：

- 读取 `GLOSSARY`
- 扫描指定目录中的术语冲突
- 标出疑似混用词

输出：

- 冲突术语列表
- 建议统一口径

## 6. 第一版不做什么

- 不做 PR 自动评论
- 不做 GitHub App
- 不做健康度网页面板
- 不做定时自动巡检
- 不做跨仓库聚合
- 不做复杂迁移重构
- 不做在线协作文档编辑

## 7. 交互要求

### 7.1 Local First

第一版必须支持纯本地运行，不依赖网络服务。

### 7.2 Plain Files First

第一版只生成普通 Markdown 和普通目录，不引入私有格式。

### 7.3 Predictable

生成结果必须稳定、可重复、可预期，不要每次输出不同目录风格。

### 7.4 Idempotent

重复执行时应尽量避免覆盖用户已有内容，优先提示冲突。

### 7.5 Rule Engine Backed

所有检查类命令都应调用共享规则引擎。

CLI 负责展示和格式化结果，不负责维护另一套规则语义。

## 8. 配置边界

第一版可以支持一个极简配置文件，例如：

- 项目名称
- 默认 owner
- 默认阶段
- 默认 feature package 命名规则

但不应在第一版就引入复杂规则 DSL。

当前配置文件命名约定：

- `vibedocs.config.json`
- `.vibedocsrc.json`

推荐的 Phase 3 配置扩展：

- `glossaryPaths`
- `rulePacks`

## 9. 成功标准

基础 CLI 第一版上线后，至少应满足：

1. 一个新项目可在 5 分钟内初始化 `Minimal` 文档系统
2. 一个新功能可在 1 分钟内生成 feature package
3. 一次本地 audit 能在 30 秒内指出主要结构问题
4. 用户不需要阅读全部方法论文档，也能完成第一次落地

## 10. 与付费层的边界

CLI 第一版负责“本地执行”和“本地建议”。

付费层才负责：

- 在 PR 中自动执行规则
- 长期追踪仓库健康度
- 为团队配置专属规则包
- 托管定时巡检和通知

如果 CLI 已经能够完成这些事，付费层就没有清晰边界。

## 11. 版本路线

具体执行顺序和阶段门禁，见 `../plans/FREE-LAYER-IMPLEMENTATION-PLAN.md`。

### Phase 1

- `init`
- `feature create`
- `audit`
- `glossary check`
- 接入共享规则引擎

### Phase 2

- 更好的 audit 分类
- 更明确的修复建议
- 更灵活的初始化参数
- 引入 diff-ready 的规则上下文

### Phase 3

- 为付费工作流提供标准化本地输出接口
- 与 PR 检查共享规则定义，但不共享托管能力
- 支持团队规则包的本地只读消费

当前 Phase 3 对应的本地接口包括：

- 稳定 JSON envelope：`schemaVersion / tool / run / summary / results`
- `--rule-pack` 本地只读规则包加载
- `rulePacks` 配置项
- diff audit 的 `suggested_docs` 结果字段

## 12. 结论

基础 CLI 的成功标准不是“命令更多”，而是：

- 第一次使用成功率高
- 生成结果稳定
- 和付费工作流边界清楚

它要成为整个产品线的 adoption engine。
