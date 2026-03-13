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
    nextContent = nextContent.replace(/^- (?:项目名称：|Project Name:)\s*$/m, `- Project Name: ${options.projectName}`);
  }

  if (options.mode) {
    nextContent = nextContent.replace("- Current Mode: `Minimal / Standard / Full`", `- Current Mode: \`${formatModeLabel(options.mode)}\``);
    nextContent = nextContent.replace("- 当前阶段：`Minimal / Standard / Full`", `- Current Mode: \`${formatModeLabel(options.mode)}\``);
  }

  return nextContent;
}

export function hydrateTemplateContent(content, options) {
  let nextContent = content;

  if (options.title) {
    nextContent = nextContent.replace(/^# .+$/m, `# ${options.title}`);
  }

  nextContent = nextContent.replace(/^Last Updated:\s*$/m, `Last Updated: ${options.date}`);
  nextContent = nextContent.replace(/^更新时间：\s*$/m, `Last Updated: ${options.date}`);

  if (options.owner) {
    if (/^Owner:\s*.+$/m.test(nextContent)) {
      nextContent = nextContent.replace(/^Owner:\s*.+$/m, `Owner: ${options.owner}`);
    } else if (/^状态：.*$/m.test(nextContent)) {
      nextContent = nextContent.replace(/^状态：.*$/m, (match) => `${match}\nOwner: ${options.owner}`);
    } else if (/^Status:\s*.+$/m.test(nextContent)) {
      nextContent = nextContent.replace(/^Status:\s*.+$/m, (match) => `${match}\nOwner: ${options.owner}`);
    } else if (/^更新时间：.*$/m.test(nextContent)) {
      nextContent = nextContent.replace(/^更新时间：.*$/m, (match) => `${match}\nOwner: ${options.owner}`);
    }
  }

  return nextContent;
}
