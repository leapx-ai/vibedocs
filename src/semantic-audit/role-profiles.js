function escapePattern(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasAscii(value) {
  return /[a-z]/i.test(value);
}

function matchPhrase(text, phrase) {
  const escaped = escapePattern(phrase.toLowerCase());

  if (hasAscii(phrase)) {
    return new RegExp(`(^|[^a-z])${escaped}($|[^a-z])`, "i").test(text);
  }

  return text.includes(escaped);
}

function collectMatches(text, phrases = []) {
  const normalized = text.toLowerCase();
  return phrases.filter((phrase) => matchPhrase(normalized, phrase));
}

export const PRODUCT_SIGNALS = [
  "background",
  "current alternative",
  "user outcome",
  "rules and boundaries",
  "acceptance criteria",
  "target user",
  "target users",
  "user problem",
  "user problems",
  "user scenario",
  "user scenarios",
  "user flow",
  "business rule",
  "business rules",
  "non-goals",
  "用户问题",
  "目标用户",
  "用户场景",
  "用户流程",
  "业务规则",
  "非目标",
  "当前成本",
];

export const ENGINEERING_SIGNALS = [
  "covered modules",
  "out of scope modules",
  "inputs",
  "outputs",
  "key states",
  "invariants",
  "data structures",
  "interfaces",
  "validation",
  "regression",
  "api",
  "api contract",
  "endpoint",
  "endpoints",
  "schema",
  "state machine",
  "data model",
  "request",
  "response",
  "error handling",
  "compatibility",
  "字段",
  "接口",
  "状态机",
  "数据结构",
  "错误处理",
  "兼容性",
  "输入",
  "输出",
  "不变量",
];

export const PRODUCT_HEADING_SIGNALS = [
  "background",
  "user flow",
  "rules and boundaries",
  "acceptance criteria",
  "non-goals",
  "target users",
  "target user",
  "user problem",
  "user scenario",
  "user flow",
  "business rules",
  "non-goals",
  "目标用户",
  "用户问题",
  "用户场景",
  "用户流程",
  "业务规则",
  "非目标",
];

export const ENGINEERING_HEADING_SIGNALS = [
  "inputs / outputs",
  "inputs/outputs",
  "state and constraints",
  "data structures / interfaces",
  "data structures/interfaces",
  "validation and regression points",
  "key states",
  "invariants",
  "api",
  "api contract",
  "schema",
  "state machine",
  "data model",
  "error handling",
  "compatibility",
  "输入 / 输出",
  "输入/输出",
  "状态与约束",
  "数据结构 / 接口",
  "数据结构/接口",
  "错误处理",
  "兼容性",
  "状态机",
  "数据结构",
  "接口",
];

export const STATUS_SIGNALS = [
  "status overview",
  "stage goals",
  "done",
  "in progress",
  "blocked",
  "next up",
  "current progress",
  "next step",
  "milestone status",
  "已完成",
  "进行中",
  "阻塞",
  "阻塞项",
  "下一步",
  "当前进展",
  "本周完成",
  "下周计划",
  "下一阶段",
];

export function resolveDocumentRole(relativePath) {
  const featureMatch = relativePath.match(/^docs\/features\/([^/]+)\/([^/]+)$/);

  if (featureMatch) {
    const fileName = featureMatch[2];
    const roleByFile = {
      "PRD.md": "product",
      "WIREFLOW.md": "design",
      "TECH-SPEC.md": "engineering",
      "ACCEPTANCE.md": "delivery",
      "ANALYTICS.md": "operations",
    };

    return {
      role: roleByFile[fileName] ?? "feature-package",
      family: "feature-package",
      featureSlug: featureMatch[1],
    };
  }

  const segments = relativePath.split("/");
  if (segments[0] !== "docs" || segments.length < 3) {
    return {
      role: "unknown",
      family: "unknown",
      featureSlug: null,
    };
  }

  return {
    role: segments[1],
    family: "global",
    featureSlug: null,
  };
}

export function analyzeSignals(section) {
  const headingText = section.heading.toLowerCase();
  const contentText = section.text.toLowerCase();

  return {
    productHeadingMatches: collectMatches(headingText, PRODUCT_HEADING_SIGNALS),
    productMatches: collectMatches(contentText, PRODUCT_SIGNALS),
    engineeringHeadingMatches: collectMatches(headingText, ENGINEERING_HEADING_SIGNALS),
    engineeringMatches: collectMatches(contentText, ENGINEERING_SIGNALS),
    statusMatches: collectMatches(contentText, STATUS_SIGNALS),
  };
}
