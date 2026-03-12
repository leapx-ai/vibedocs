function applyRuleOverride(result, override) {
  if (!override) {
    return result;
  }

  return {
    ...result,
    severity: override.severity ?? result.severity,
    owner_hint: override.ownerHint ?? result.owner_hint,
    suggestion: override.suggestion ?? result.suggestion,
  };
}

export async function runRules(context, rules, options = {}) {
  const results = [];
  const overrides = options.overrides ?? {};

  for (const rule of rules) {
    if (!rule.contexts.includes(context.mode)) {
      continue;
    }

    const override = overrides[rule.id];

    if (override?.enabled === false) {
      continue;
    }

    const result = await rule.run(context);
    results.push(applyRuleOverride(result, override));
  }

  return results;
}
