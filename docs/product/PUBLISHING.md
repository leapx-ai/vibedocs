# Publishing

这份说明定义免费开源核心的发布边界和 npm 发布动作。

## Final Decisions

- 包名：`@leapx-ai/vibedocs`
- CLI 命令：`vibedocs`
- license：`Apache-2.0`
- 发布 registry：`https://registry.npmjs.org/`
- 包访问级别：`public`

这组决定的目标不是追求最短名字，而是保证品牌、仓库归属、未来多包扩展和付费层产品线都还能继续生长。

## Why This Name

优先使用 scoped 包，而不是直接发布无 scope 的 `vibedocs`，原因有四个：

- 与 GitHub 组织 `leapx-ai` 对齐，归属关系清楚
- 未来可以继续扩展 `@leapx-ai/vibedocs-*` 生态
- CLI 命令仍然可以保持短名 `vibedocs`
- 比过渡名 `vibecoding-template` 更接近用户认知和产品品牌

## Why Apache-2.0

免费层的目标是被外部项目依赖、集成和二次扩展，所以 license 需要优先服务 adoption，而不是优先卡住使用。

选择 `Apache-2.0` 的原因：

- 比 `MIT` 多一层明确的 patent grant，更适合面向团队和企业使用
- 仍然保持低接入摩擦，适合 open-core 分发
- 不会像强 copyleft license 一样拖慢生态采用
- 付费层仍然可以通过托管工作流、规则包和团队能力收费，而不是依赖 license 限制

如果未来战略转向“更强保护核心修改回流”，再评估 `MPL-2.0`。现阶段不建议直接走强 copyleft。

## Package Metadata

`package.json` 应保持以下发布元数据：

- `name: "@leapx-ai/vibedocs"`
- `license: "Apache-2.0"`
- `publishConfig.access: "public"`
- `publishConfig.registry: "https://registry.npmjs.org/"`
- `publishConfig.provenance: true`
- `repository / bugs / homepage` 指向 GitHub 仓库

## Release Checklist

每次发版前，至少完成以下动作：

1. 更新版本号。
2. 确认 README、examples、schema 与当前 CLI 行为一致。
3. 运行 `npm test`。
4. 运行 `npm run pack:check`。
5. 检查 `npm pack --dry-run` 产物是否只包含应发布文件。
6. 确认 `LICENSE` 已包含在包内。
7. 确认没有把付费工作流代码、私有规则或内部凭据打进包。

## Publish Flow

推荐发布顺序：

1. 在主分支完成版本变更。
2. 创建对应 git tag。
3. 从 CI 或受控环境执行 `npm publish --provenance`。
4. 发布后拉取 npm 页面，确认 README、license、bin 和版本元数据正确。

如果使用 GitHub Actions Trusted Publishing，仍保持 `publishConfig.registry` 和 `publishConfig.access` 在仓库内显式声明，不把这些约束只放在 CI 配置里。

## Non-Goals

这份文档不定义：

- 付费层单独包的命名规范
- GitHub App 发布流程
- 团队私有 rule pack 的交付方式
