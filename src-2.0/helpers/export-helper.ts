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
