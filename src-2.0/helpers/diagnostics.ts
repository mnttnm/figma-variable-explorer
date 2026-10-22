/*
  Diagnostics for variable data that the plugin cannot process.
  Runs a read-only scan over every local collection and reports values that do not
  match their variable's resolvedType (e.g. a COLOR variable holding a string), missing
  mode values and aliases pointing to variables that no longer exist.
*/

export interface VariableIssue {
  collection: string;
  variable: string;
  variableId: string;
  resolvedType: string;
  mode: string;
  problem: string;
  rawValue: string;
}

export interface DiagnosticsReport {
  generatedAt: string;
  editorType: string;
  fileName: string;
  collections: {
    name: string;
    id: string;
    modes: string[];
    variableCount: number;
    isExtension?: boolean;
  }[];
  issues: VariableIssue[];
  scanError?: string;
}

export function describeValue(value: unknown): string {
  if (value === undefined) return "undefined";
  try {
    return `${typeof value} ${JSON.stringify(value)}`;
  } catch {
    return `${typeof value} ${String(value)}`;
  }
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isVariableAliasValue(
  value: any
): value is { type: "VARIABLE_ALIAS"; id: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    value.type === "VARIABLE_ALIAS"
  );
}

// Returns a problem description, or null if the value is valid for its type.
function checkValue(value: any, resolvedType: string): string | null {
  if (value === undefined) return "No value for this mode";
  if (value === null) return "Value is null";
  if (isVariableAliasValue(value)) return null;

  switch (resolvedType) {
    case "COLOR": {
      if (typeof value !== "object") {
        return `COLOR variable holds a ${typeof value} instead of an RGBA object`;
      }
      const missing = ["r", "g", "b"].filter((c) => !isFiniteNumber(value[c]));
      if (missing.length > 0) {
        return `COLOR value is missing or has invalid channel(s): ${missing.join(", ")}`;
      }
      if (value.a === undefined) return "COLOR value has no alpha (a) channel";
      if (!isFiniteNumber(value.a)) return "COLOR value has an invalid alpha (a) channel";
      return null;
    }
    case "FLOAT":
      return isFiniteNumber(value)
        ? null
        : `FLOAT variable holds a ${typeof value} instead of a number`;
    case "STRING":
      return typeof value === "string"
        ? null
        : `STRING variable holds a ${typeof value} instead of a string`;
    case "BOOLEAN":
      return typeof value === "boolean"
        ? null
        : `BOOLEAN variable holds a ${typeof value} instead of a boolean`;
    default:
      return `Unknown resolvedType "${resolvedType}"`;
  }
}

export async function scanVariables(): Promise<DiagnosticsReport> {
  const report: DiagnosticsReport = {
    generatedAt: new Date().toISOString(),
    editorType: figma.editorType,
    fileName: figma.root.name,
    collections: [],
    issues: [],
  };

  try {
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    for (const collection of collections) {
      report.collections.push({
        name: collection.name,
        id: collection.id,
        modes: collection.modes.map((m) => `${m.name} (${m.modeId})`),
        variableCount: collection.variableIds.length,
        isExtension: (collection as any).isExtension,
      });

      for (const variableId of collection.variableIds) {
        const issueBase = {
          collection: collection.name,
          variableId,
        };
        let variable: Variable | null = null;
        try {
          variable = await figma.variables.getVariableByIdAsync(variableId);
        } catch (error) {
          report.issues.push({
            ...issueBase,
            variable: "(unknown)",
            resolvedType: "",
            mode: "",
            problem: `getVariableByIdAsync threw: ${String(error)}`,
            rawValue: "",
          });
          continue;
        }
        if (!variable) {
          report.issues.push({
            ...issueBase,
            variable: "(unknown)",
            resolvedType: "",
            mode: "",
            problem: "Collection lists this variable id but it could not be loaded",
            rawValue: "",
          });
          continue;
        }

        const { name, resolvedType, valuesByMode } = variable;
        const modeIds = new Set(collection.modes.map((m) => m.modeId));

        for (const mode of collection.modes) {
          const value = valuesByMode[mode.modeId];
          let problem = checkValue(value, resolvedType);
          if (!problem && isVariableAliasValue(value)) {
            const target = await figma.variables
              .getVariableByIdAsync(value.id)
              .catch(() => null);
            if (!target) problem = "Alias points to a variable that cannot be found";
          }
          if (problem) {
            report.issues.push({
              ...issueBase,
              variable: name,
              resolvedType,
              mode: mode.name,
              problem,
              rawValue: describeValue(value),
            });
          }
        }

        for (const modeId of Object.keys(valuesByMode)) {
          if (!modeIds.has(modeId)) {
            report.issues.push({
              ...issueBase,
              variable: name,
              resolvedType,
              mode: modeId,
              problem: "Value stored for a mode id that is not in the collection",
              rawValue: describeValue(valuesByMode[modeId]),
            });
          }
        }
      }
    }
  } catch (error) {
    report.scanError = error instanceof Error ? error.stack || error.message : String(error);
  }

  return report;
}

export function formatReport(report: DiagnosticsReport): string {
  const lines: string[] = [
    "Figma Variable Explorer - debug report",
    `Generated: ${report.generatedAt}`,
    `Editor: ${report.editorType}`,
    `File: ${report.fileName}`,
    "",
    "Collections:",
    ...report.collections.map(
      (c) =>
        `  - ${c.name} [${c.id}] variables=${c.variableCount}` +
        `${c.isExtension ? " (extended collection)" : ""}` +
        ` modes=${c.modes.join(", ")}`
    ),
    "",
    `Issues found: ${report.issues.length}`,
    ...report.issues.map(
      (i) =>
        `  - [${i.collection}] ${i.variable} (${i.resolvedType}, id ${i.variableId})` +
        ` mode "${i.mode}": ${i.problem}. Raw value: ${i.rawValue}`
    ),
  ];
  if (report.scanError) {
    lines.push("", `Scan error: ${report.scanError}`);
  }
  return lines.join("\n");
}
