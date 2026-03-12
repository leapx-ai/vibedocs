export { TOOL_NAME, TOOL_VERSION, REPORT_SCHEMA_VERSION } from "./meta.js";
export { loadProjectConfig } from "./config/index.js";
export { runAudit, runGlossaryCheck } from "./api/index.js";
export { createReport, emitReport, formatResults, hasFailures } from "./reporting/index.js";
export { buildRepositoryContext, coreRules, loadRulePacks, runRules } from "./rule-engine/index.js";
