import { resolveDocumentRole, analyzeSignals } from "./role-profiles.js";
import { parseSections } from "./section-parser.js";

export function buildSemanticIndex(context) {
  const documents = [];
  const sections = [];

  for (const file of context.files.values()) {
    const assignment = resolveDocumentRole(file.relativePath);
    const parsedSections = parseSections(file.content).map((section) => ({
      ...section,
      filePath: file.relativePath,
      docRole: assignment.role,
      docFamily: assignment.family,
      featureSlug: assignment.featureSlug,
      status: file.status,
      signalAnalysis: analyzeSignals(section),
    }));

    documents.push({
      relativePath: file.relativePath,
      status: file.status,
      docRole: assignment.role,
      docFamily: assignment.family,
      featureSlug: assignment.featureSlug,
      sections: parsedSections,
    });

    sections.push(...parsedSections);
  }

  return {
    documents,
    sections,
  };
}
