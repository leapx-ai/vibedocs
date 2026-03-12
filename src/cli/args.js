export function parseArgs(argv) {
  const positionals = [];
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      positionals.push(token);
      continue;
    }

    const trimmed = token.slice(2);
    const [rawKey, inlineValue] = trimmed.split("=", 2);
    const nextToken = argv[index + 1];
    const hasNextValue = inlineValue === undefined && nextToken && !nextToken.startsWith("--");
    const value = inlineValue ?? (hasNextValue ? nextToken : true);

    if (hasNextValue) {
      index += 1;
    }

    if (Object.hasOwn(options, rawKey)) {
      const existing = options[rawKey];
      options[rawKey] = Array.isArray(existing) ? [...existing, value] : [existing, value];
      continue;
    }

    options[rawKey] = value;
  }

  return { positionals, options };
}

export function getStringOption(options, key, fallback = undefined) {
  const value = options[key];

  if (value === undefined) {
    return fallback;
  }

  return Array.isArray(value) ? String(value.at(-1)) : String(value);
}

export function getBooleanOption(options, key) {
  const value = options[key];

  if (value === undefined) {
    return false;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value).toLowerCase();
  return normalized !== "false";
}

export function getListOption(options, key) {
  const value = options[key];

  if (value === undefined) {
    return [];
  }

  const values = Array.isArray(value) ? value : [value];

  return values
    .flatMap((entry) => String(entry).split(","))
    .map((entry) => entry.trim())
    .filter(Boolean);
}
