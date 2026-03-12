function normalizeBase(value, separator) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`^${separator}+|${separator}+$`, "g"), "")
    .replace(new RegExp(`${separator}{2,}`, "g"), separator);
}

export function toSlug(value, style = "kebab") {
  if (style === "snake") {
    return normalizeBase(value, "_");
  }

  return normalizeBase(value, "-");
}

export function toDisplayName(value) {
  return value
    .trim()
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
