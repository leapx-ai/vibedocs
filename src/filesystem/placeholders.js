const OWNER_PLACEHOLDER = /<[^>\n]*(owner|Owner|lead|Lead|pm|PM|qa|QA|analytics|design|incident|release|execution|frontend|implementer)[^>\n]*>/g;

export function formatModeLabel(mode) {
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}

export function hydrateScaffoldContent(content, options) {
  let nextContent = content;

  nextContent = nextContent.replaceAll("<YYYY-MM-DD>", options.date);

  if (options.owner) {
    nextContent = nextContent.replace(OWNER_PLACEHOLDER, options.owner);
  }

  if (options.projectName) {
    nextContent = nextContent.replace(/^- 项目名称：\s*$/m, `- 项目名称：${options.projectName}`);
  }

  if (options.mode) {
    nextContent = nextContent.replace("`Minimal / Standard / Full`", `\`${formatModeLabel(options.mode)}\``);
  }

  return nextContent;
}

export function hydrateTemplateContent(content, options) {
  let nextContent = content;

  if (options.title) {
    nextContent = nextContent.replace(/^# .+$/m, `# ${options.title}`);
  }

  nextContent = nextContent.replace(/^更新时间：\s*$/m, `更新时间：${options.date}`);

  if (options.owner) {
    nextContent = nextContent.replace(/^Owner:\s*.+$/m, `Owner: ${options.owner}`);
  }

  return nextContent;
}
