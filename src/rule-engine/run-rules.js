export async function runRules(context, rules) {
  const results = [];

  for (const rule of rules) {
    if (!rule.contexts.includes(context.mode)) {
      continue;
    }

    results.push(await rule.run(context));
  }

  return results;
}
