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

export const getCSVFromData = (jsonData: any, fileName: string = "variables.csv") => {
  let csvContent = "Collection,Variable Name,Type,Mode,Value,Description\n";

  // Process each collection
  for (const [collectionKey, collection] of Object.entries(jsonData)) {
    if (!collection || typeof collection !== 'object' || !collectionKey.startsWith('@')) continue;

    const metadata = collection.$collection_metadata;
    if (!metadata) continue;

    const collectionName = metadata.name;
    const modes = metadata.modes || [];

    // Function to process variables recursively
    const processVariables = (obj: any, parentPath: string = '') => {
      for (const [key, value] of Object.entries(obj)) {
        if (key === '$collection_metadata') continue;
        
        if (value && typeof value === 'object') {
          if (value.$variable_metadata) {
            // This is a variable
            const variableName = value.$variable_metadata.name || (parentPath ? `${parentPath}/${key}` : key);
            const variableType = value.$type || "";
            const description = value.$description || "";
            const modeValues = value.$variable_metadata.modes || {};

            // Process each mode
            const modesList = Array.isArray(modes) 
              ? modes.map(m => typeof m === 'string' ? { name: m, key: m } : m)
              : [{ name: 'Default', key: 'default' }];

            modesList.forEach((mode) => {
              const modeName = mode.name;
              const modeKey = mode.key;
              let modeValue = "";

              if (modeKey in modeValues) {
                const value = modeValues[modeKey];
                // Handle different value types
                if (typeof value === 'object' && value !== null) {
                  if ('r' in value && 'g' in value && 'b' in value) {
                    // Handle color values
                    const alpha = value.a !== undefined ? value.a : 1;
                    const alphaStr = alpha.toFixed(2);
                    modeValue = `rgba(${Math.round(value.r * 255)}, ${Math.round(value.g * 255)}, ${Math.round(value.b * 255)}, ${alphaStr})`;
                  } else {
                    // Handle other object values or references
                    modeValue = value.toString();
                  }
                } else {
                  // Handle primitive values and references
                  modeValue = String(value);
                }
              } else if (value.$value !== undefined) {
                // Handle single value variables
                modeValue = String(value.$value);
              }

              // Escape and format CSV values
              const escapedCollectionName = `"${collectionName.replace(/"/g, '""')}"`;
              const escapedVariableName = `"${variableName.replace(/"/g, '""')}"`;
              const escapedVariableType = `"${variableType.replace(/"/g, '""')}"`;
              const escapedModeName = `"${modeName.replace(/"/g, '""')}"`;
              const escapedValue = modeValue ? `"${modeValue.replace(/"/g, '""')}"` : "";
              const escapedDescription = description ? `"${description.replace(/"/g, '""')}"` : "";

              csvContent += `${escapedCollectionName},${escapedVariableName},${escapedVariableType},${escapedModeName},${escapedValue},${escapedDescription}\n`;
            });
          } else {
            // This is a group, process its children
            processVariables(value, parentPath ? `${parentPath}/${key}` : key);
          }
        }
      }
    };

    // Start processing variables for this collection
    processVariables(collection);
  }

  createFileFromContent(fileName, csvContent);
};

export const getMarkdownFromJSON = (jsonData: any, fileName: string = "variables.md") => {
  let markdownString = "";
  for (const [key, value] of Object.entries(jsonData)) {
    const collectionObj = value;
    const { name: collectionName, modes } =
      collectionObj.$collection_metadata;

    markdownString =
      markdownString + `### Collection: ${collectionName}`;
    const tableHeaders = [
      "Variable Name",
      ...modes.map((m) => m.name),
    ];

    markdownString += `\n| ${tableHeaders.join(
      " | "
    )} |\n| ${tableHeaders.map(() => "---").join(" | ")} |\n`;

    for (const [key, value] of Object.entries(collectionObj)) {
      if (key !== "$collection_metadata") {
        // check if the value has a property "$variable_metadata"
        // if not, it's not a variable, go for the child property (Object.values(value)[0])
        // do it until we find a variable
        if (!value.hasOwnProperty("$variable_metadata")) {
          if (typeof value === "object") {
            const collectionVariables =
              getVariablesFromJSONGroup(value);

            for (const variable of collectionVariables) {
              const variableData = variable;
              const variableMetadata =
                variableData["$variable_metadata"];
              const { name: variableName, modes: modeValues } =
                variableMetadata;

              // create variable markdown table
              markdownString += `| ${variableName} | ${Object.values(
                modeValues
              ).join(" | ")} |\n`;
            }
          }
        } else {
          const variableMetadata = value["$variable_metadata"];
          const { name: variableName, modes: modeValues } =
            variableMetadata;
          // create variable markdown table
          markdownString += `| ${variableName} | ${Object.values(
            modeValues
          ).join(" | ")} |\n`;
        }
      }
    }

    markdownString += "\n";
  }

  createFileFromContent(fileName, markdownString);
};
