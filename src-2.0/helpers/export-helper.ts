import { createFileFromContent } from "../utils";

const SAMPLE_JSON_DATA = {
  "@primitives": {
    $collection_metadata: {
      name: "Primitives",
      figmaId: "VariableCollectionId:222:323",
      modes: [
        {
          name: "Mode 1",
          key: "mode_1",
        },
      ],
    },
    "scale-01": {
      $type: "number",
      $value: 12,
      $description: "",
      $variable_metadata: {
        name: "scale-01",
        figmaId: "VariableID:222:324",
        modes: {
          mode_1: 12,
        },
      },
    },
  },
};

const SAMPLE_JSON_DATA_2 = {
  "@test_collection": {
    $collection_metadata: {
      name: "Test Collection",
      figmaId: "VariableCollectionId:222:321",
      modes: ["first_mode", "second_mode"],
    },
    extra_small_radius: {
      $type: "number",
      $value: "{@components.size-variable}",
      $description: "",
      $variable_metadata: {
        name: "extra small radius",
        figmaId: "VariableID:222:322",
        modes: {
          first_mode: "{@components.size-variable}",
          second_mode: "{@typography_custom.body_extra_small}",
        },
      },
    },
  },
};

const getVariablesFromJSONGroup = (jsonData: any) => {
  const keys = Object.keys(jsonData);
  const variables = [];

  for (const key of keys) {
    const value = jsonData[key];
    if (value.hasOwnProperty("$variable_metadata")) {
      const variable = value;
      variables.push(variable);
    } else if (typeof value === "object") {
      const nestedVariables = getVariablesFromJSONGroup(value);
      variables.push(...nestedVariables);
    }
  }

  return variables;
};

const getColorPreview = (value: any): string => {
  if (typeof value === 'string') {
    // Check if it's a hex color
    if (value.match(/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/)) {
      return `<span style="display:inline-block;width:16px;height:16px;background-color:${value};border:1px solid #ccc;border-radius:2px;vertical-align:middle;margin-right:4px;"></span>`;
    }
    // Check if it's rgb/rgba
    if (value.match(/^rgba?\(/)) {
      return `<span style="display:inline-block;width:16px;height:16px;background-color:${value};border:1px solid #ccc;border-radius:2px;vertical-align:middle;margin-right:4px;"></span>`;
    }
    // Check if it's hsl/hsla
    if (value.match(/^hsla?\(/)) {
      return `<span style="display:inline-block;width:16px;height:16px;background-color:${value};border:1px solid #ccc;border-radius:2px;vertical-align:middle;margin-right:4px;"></span>`;
    }
  }
  return '';
};

const getVariableUsage = (variableName: string, variableType: string): string => {
  const cssVarName = variableName.replace(/\s+/g, '-').replace(/\//g, '-').toLowerCase();
  
  switch (variableType) {
    case 'COLOR':
      return `\`var(--${cssVarName})\``;
    case 'FLOAT':
    case 'number':
      return `\`var(--${cssVarName})\``;
    case 'STRING':
      return `\`var(--${cssVarName})\``;
    case 'BOOLEAN':
      return `\`var(--${cssVarName})\``;
    default:
      return `\`var(--${cssVarName})\``;
  }
};

export const getMarkdownFromJSON = (jsonData: any, fileName: string = "variables.md") => {
  const timestamp = new Date().toLocaleDateString();
  const collectionNames = Object.values(jsonData).map((collection: any) => 
    collection.$collection_metadata?.name || 'Unknown'
  );
  
  let markdownString = `# Design System Variables
*Generated from Figma on ${timestamp}*

## 📋 Table of Contents
${collectionNames.map((name: string) => `- [${name}](#${name.toLowerCase().replace(/\s+/g, '-')})`).join('\n')}

---

`;

  for (const [key, value] of Object.entries(jsonData)) {
    const collectionObj = value;
    const { name: collectionName, modes } = collectionObj.$collection_metadata;

    // Add collection header with emoji and anchor
    markdownString += `## 🎨 ${collectionName} {#${collectionName.toLowerCase().replace(/\s+/g, '-')}}

`;

    // Enhanced table headers with usage column
    const tableHeaders = [
      "Variable",
      "Preview",
      ...modes.map((m) => m.name),
      "Usage"
    ];

    markdownString += `| ${tableHeaders.join(" | ")} |\n`;
    markdownString += `|${tableHeaders.map(() => "---").join("|")}|\n`;

    // Process variables
    for (const [key, value] of Object.entries(collectionObj)) {
      if (key !== "$collection_metadata") {
        if (!value.hasOwnProperty("$variable_metadata")) {
          if (typeof value === "object") {
            const collectionVariables = getVariablesFromJSONGroup(value);

            for (const variable of collectionVariables) {
              const variableData = variable;
              const variableMetadata = variableData["$variable_metadata"];
              const { name: variableName, modes: modeValues } = variableMetadata;
              const variableType = variableData.$type;

              // Get first mode value for preview
              const firstModeValue = Object.values(modeValues)[0];
              const colorPreview = getColorPreview(firstModeValue);
              const usage = getVariableUsage(variableName, variableType);
              
              // Enhanced table row with preview and usage
              const modeValuesFormatted = Object.values(modeValues).map((val: any) => {
                if (typeof val === 'string' && val.startsWith('{')) {
                  // It's an alias - format it nicely
                  return `*→ ${val.replace(/[{}@]/g, '')}*`;
                }
                return `\`${val}\``;
              });

              markdownString += `| **${variableName}** | ${colorPreview} | ${modeValuesFormatted.join(" | ")} | ${usage} |\n`;
            }
          }
        } else {
          const variableMetadata = value["$variable_metadata"];
          const { name: variableName, modes: modeValues } = variableMetadata;
          const variableType = value.$type;

          // Get first mode value for preview
          const firstModeValue = Object.values(modeValues)[0];
          const colorPreview = getColorPreview(firstModeValue);
          const usage = getVariableUsage(variableName, variableType);

          // Enhanced table row with preview and usage
          const modeValuesFormatted = Object.values(modeValues).map((val: any) => {
            if (typeof val === 'string' && val.startsWith('{')) {
              // It's an alias - format it nicely
              return `*→ ${val.replace(/[{}@]/g, '')}*`;
            }
            return `\`${val}\``;
          });

          markdownString += `| **${variableName}** | ${colorPreview} | ${modeValuesFormatted.join(" | ")} | ${usage} |\n`;
        }
      }
    }

    markdownString += "\n### Aliases in this Collection\n";
    markdownString += "Variables marked with *→* are aliases that reference other variables.\n\n";
    markdownString += "---\n\n";
  }

  // Add footer
  markdownString += `## 🔗 Links
- [View in Figma](figma://open)
- [Design System Documentation](#)

---
*This documentation was automatically generated from Figma variables. Last updated: ${timestamp}*
`;

  createFileFromContent(fileName, markdownString);
};
