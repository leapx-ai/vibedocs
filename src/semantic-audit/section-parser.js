function createSection(rawHeading, depth, lines, lineStart, lineEnd) {
  const heading = rawHeading?.trim() ?? "";
  const body = lines.join("\n").trim();
  const text = `${heading}\n${body}`.trim();

  return {
    heading,
    depth,
    body,
    text,
    lineStart,
    lineEnd,
  };
}

export function parseSections(content) {
  const lines = content.split("\n");
  const headings = [];

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^(#{1,6})\s+(.+?)\s*$/);
    if (match) {
      headings.push({
        depth: match[1].length,
        heading: match[2],
        line: index + 1,
      });
    }
  }

  if (headings.length === 0) {
    return [createSection("", 0, lines, 1, lines.length)];
  }

  const sections = [];
  const firstHeading = headings[0];

  if (firstHeading.line > 1) {
    sections.push(createSection("", 0, lines.slice(0, firstHeading.line - 1), 1, firstHeading.line - 1));
  }

  for (let index = 0; index < headings.length; index += 1) {
    const current = headings[index];
    const next = headings[index + 1];
    const startLine = current.line;
    const endLine = next ? next.line - 1 : lines.length;
    sections.push(createSection(current.heading, current.depth, lines.slice(startLine, endLine), startLine, endLine));
  }

  return sections.filter((section) => section.heading || section.body);
}
