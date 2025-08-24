import {
  InternalVariable,
  VariableValueInfo,
  AliasValue,
  ColorValue,
  VariableModeValues,
  CollectionsData,
  CSSData,
  ColorResolutionMode,
} from "../types";

function isVariableAlias(
  value: any
): value is { type: "VARIABLE_ALIAS"; id: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "VARIABLE_ALIAS"
  );
}

function getAliasValue(value: { type: "VARIABLE_ALIAS"; id: string }): AliasValue {
  const variable = figma.variables.getVariableById(value.id);
  const collection = variable
    ? figma.variables.getVariableCollectionById(
        variable.variableCollectionId
      )
    : null;

  return {
    aliasID: value.id,
    aliasLabel: variable?.name ?? "Unknown",
    collection: collection?.name ?? "Unknown",
  };
}

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

function convertRgbToHsl({ r, g, b, a = 1 }: RGBA): string {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  // Clamp alpha value between 0 and 1
  a = Math.max(0, Math.min(1, a));
  return `hsla(${Math.round(h * 360)},${Math.round(
    s * 100
  )}%,${Math.round(l * 100)}%,${a.toFixed(2)})`;
}

function rgbToHex({
  r,
  g,
  b,
  a,
}: {
  r: number;
  g: number;
  b: number;
  a: number;
}) {
  const toHex = (value: number) => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  const hex = [toHex(r), toHex(g), toHex(b)];
  if (a !== 1) {
    hex.push(toHex(a));
  }
  return `#${hex.join("")}`;
}

export function getColorValue(color: RGBA): ColorValue {
  const { r, g, b, a } = color;
  return {
    hexValue: rgbToHex({ r, g, b, a }),
    rgbaValue: `rgba(${Math.round(r * 255)},${Math.round(
      g * 255
    )},${Math.round(b * 255)},${a.toFixed(2)})`,
    hslaValue: convertRgbToHsl({ r, g, b, a }),
  };
}

function isColor(value: any): value is RGBA {
  return (
    typeof value === "object" &&
    value !== null &&
    ("r" in value || "g" in value || "b" in value)
  );
}

function roundNumberToFigmaPrecision(value: any): string {
  if (typeof value === 'number') {
    // Round to 2 decimal places to match Figma's precision (0.01)
    const rounded = Math.round(value * 100) / 100;
    // Remove unnecessary trailing zeros
    return rounded.toString();
  }
  return value.toString();
}

export function resolveVariableValue(
  value: any
): AliasValue | ColorValue | string {
  // Handle all Figma variable types: COLOR, FLOAT, STRING, BOOLEAN, and VARIABLE_ALIAS
  if (isColor(value)) {
    return getColorValue(value as RGBA);
  } else if (isVariableAlias(value)) {
    return getAliasValue(value);
  } else if (typeof value === 'number') {
    // FLOAT type - apply precision rounding
    return roundNumberToFigmaPrecision(value);
  } else if (typeof value === 'boolean') {
    // BOOLEAN type - convert to string
    return value.toString();
  } else {
    // STRING type or any other type - convert to string
    return value.toString();
  }
}

export const getResolvedValuesForAliasVariable = (
  variableValue: { type: "VARIABLE_ALIAS"; id: string },
  activeMode: string
): InternalVariable[] => {
  const aliasConnectedVariables: InternalVariable[] = [];

  const { id: aliasID } = variableValue;
  let currentVariable = figma.variables.getVariableById(aliasID);
  let processNextVariable = true;

  function createInternalVariableObject(
    mode: string,
    currentResolvedValue: any,
    currentVariable: any,
    isAlias = false
  ): InternalVariable {
    return {
      type: currentVariable.resolvedType,
      values: {
        [mode]: {
          isAlias: isAlias,
          value: resolveVariableValue(currentResolvedValue),
          collection:
            figma.variables.getVariableCollectionById(
              currentVariable.variableCollectionId
            )?.name ?? "Unknown",
        },
      },
      name: currentVariable.name,
    };
  }

  while (processNextVariable && currentVariable) {
    const {
      valuesByMode: aliasModeValues,
      variableCollectionId: variableCollectionID,
    } = currentVariable;
    const collection = figma.variables.getVariableCollectionById(
      variableCollectionID
    )!;

    // we need to get the list of mode names as activeMode is not a modeID but a mode name
    const collectionModes = collection.modes.map((mode) => mode.name);
    const activeModeIndex = collectionModes.indexOf(activeMode);

    /* If we are able to find the variable for active mode, we just capture the value and
     *  perform an early return if it is not an alias */
    if (activeModeIndex !== -1) {
      const variables = Object.values(aliasModeValues);
      const currentResolvedValue = variables[activeModeIndex];
      let isAlias = isVariableAlias(currentResolvedValue);

      aliasConnectedVariables.push(
        createInternalVariableObject(
          activeMode,
          currentResolvedValue,
          currentVariable,
          isAlias
        )
      );

      if (!isAlias) {
        processNextVariable = false;
      } else {
        currentVariable = figma.variables.getVariableById(
          (currentResolvedValue as { type: "VARIABLE_ALIAS"; id: string }).id
        )!;
        processNextVariable = true;
      }
    } else {
      processNextVariable = false;

      for (const mode of Object.keys(aliasModeValues)) {
        let currentModeName = mode;
        const currentMode = collection.modes.find(
          (collectionMode) => collectionMode.modeId === mode
        );

        if (currentMode) {
          currentModeName = currentMode.name;
        }

        const currentResolvedValue = aliasModeValues[mode];
        let isAlias = isVariableAlias(currentResolvedValue);
        if (isAlias) {
          processNextVariable = true;
          currentVariable = figma.variables.getVariableById(
            (currentResolvedValue as { type: "VARIABLE_ALIAS"; id: string }).id
          )!;
        }

        // todo: there is a bug that we are pushing the same variable in multiple modes \
        // rather we should push these as the the valuesByMode for variables.
        aliasConnectedVariables.push(
          createInternalVariableObject(
            currentModeName,
            currentResolvedValue,
            currentVariable,
            isAlias
          )
        );
      }
    }
  }

  return aliasConnectedVariables;
};

export function enrichVariableModeValues(
  variableValues: { [modeId: string]: any },
  collection: any
): VariableModeValues {
  let resolvedValues: VariableModeValues = {};

  for (const modeId in variableValues) {
    const varValue = variableValues[modeId];
    const modeName =
      collection.modes.find((mode) => mode.modeId === modeId)?.name ??
      modeId;

    const varInfo: VariableValueInfo = {
      isAlias: isVariableAlias(varValue),
      value: resolveVariableValue(varValue),
      aliasResolvedValues: isVariableAlias(varValue)
        ? getResolvedValuesForAliasVariable(varValue, modeName)
        : undefined,
      collection: collection.name,
    };

    resolvedValues[modeName] = varInfo;
  }

  return resolvedValues;
}

// Function to convert InternalVariable to design tokens
export function convertToTokens(data: CollectionsData): any {
  const tokens: any = {};

  for (const collectionName in data) {
    const collection = data[collectionName];
    tokens[collectionName] = {};

    for (const variableId in collection.variables) {
      const variable = collection.variables[variableId];
      const variableTokens = convertVariableToToken(variable);
      tokens[collectionName][variable.name] = variableTokens;
    }
  }

  return tokens;
}

function convertVariableToToken(variable: InternalVariable): any {
  const token: any = {};

  for (const mode in variable.values) {
    const valueInfo = variable.values[mode];
    let value;

    if (valueInfo.isAlias && valueInfo.aliasResolvedValues) {
      value = valueInfo.aliasResolvedValues.map((resolved) =>
        convertVariableToToken(resolved)
      );
    } else if (
      !valueInfo.isAlias &&
      typeof valueInfo.value === "object"
    ) {
      value = convertColorValueToToken(valueInfo.value as ColorValue);
    } else {
      value = valueInfo.value;
    }

    token[mode] = { value };
  }

  return token;
}

function convertColorValueToToken(colorValue: ColorValue): any {
  return {
    hex: colorValue.hexValue,
    rgba: colorValue.rgbaValue,
    hsla: colorValue.hslaValue,
  };
}

function replaceSpacesAndSlashesWithHyphen(str: string) {
  return str.replace(/\s+/g, "-").replace(/\//g, "-");
}

function getSimplifiedCollectionData(
  collectionData: CollectionsData,
  colorResolutionMode: ColorResolutionMode
) {
  let simplifiedCSSJson: any = {};

  const getColorValueForResolutionMode = (colorValue: ColorValue) => {
    switch (colorResolutionMode) {
      case "hex":
        return colorValue.hexValue;
      case "rgba":
        return colorValue.rgbaValue;
      case "hsla":
        return colorValue.hslaValue;
    }
  };

  Object.keys(collectionData).map((collectionName) => {
    const collectionObject: any = {};
    Object.keys(collectionData[collectionName].variables).map(
      (variableName) => {
        const varInfo =
          collectionData[collectionName].variables[variableName];
        const varName = replaceSpacesAndSlashesWithHyphen(
          varInfo.name
        );
        // iterate variables and create mapping b/w modes and variables for the current collection
        Object.keys(varInfo.values).forEach((mode) => {
          const isAlias = varInfo.values[mode].isAlias;
          const varValue = isAlias
            ? replaceSpacesAndSlashesWithHyphen(
                (varInfo.values[mode].value as AliasValue).aliasLabel
              )
            : varInfo.type === "COLOR"
            ? getColorValueForResolutionMode(
                varInfo.values[mode].value as ColorValue
              )
            : varInfo.values[mode].value;
          collectionObject[mode] = {
            ...collectionObject[mode],
            [varName]: { varValue, isAlias },
          };
        });
      }
    );
    simplifiedCSSJson[collectionName] = collectionObject;
  });

  return simplifiedCSSJson;
}

function getUniqueModes(filteredVarCollectionData: CollectionsData) {
  const allModes: string[] = Object.values(
    filteredVarCollectionData
  ).flatMap((collection) => collection.modes);

  return Array.from(new Set(allModes));
}

function getCollectionsByMode(
  filteredVarCollectionData: CollectionsData,
  colorResolutionMode: ColorResolutionMode
) {
  const simplifiedCollectionData = getSimplifiedCollectionData(
    filteredVarCollectionData,
    colorResolutionMode
  );

  // consolidate variables on a mode basis
  const modeVariables: Record<string, Record<string, any>> = {};
  const uniqueModes = getUniqueModes(filteredVarCollectionData);
  uniqueModes.forEach((mode) => {
    Object.keys(simplifiedCollectionData).forEach((collection) => {
      if (
        collection in simplifiedCollectionData &&
        mode in simplifiedCollectionData[collection]
      ) {
        modeVariables[mode] = {
          ...(modeVariables[mode] || {}),
          [collection]: simplifiedCollectionData[collection][mode],
        };
      }
    });
  });
  return modeVariables;
}

const ROOT_SELECTOR = ":root";

const encloseContentInRoot = (
  content: string,
  rootSelector: string
) => {
  return `${rootSelector}{\n${content}}`;
};

export function getCSSResponseByMode(
  collectionsData: CollectionsData,
  colorResolutionMode: ColorResolutionMode
) {
  const modeVariables = getCollectionsByMode(
    collectionsData,
    colorResolutionMode
  );

  let cssString = "";
  const timestamp = new Date().toISOString().split('T')[0];
  const allModes = Object.keys(modeVariables);
  const allCollections = Array.from(new Set(
    Object.values(modeVariables).flatMap(mode => Object.keys(mode))
  ));

  let modeCSSObject: CSSData = {};
  Object.keys(modeVariables).forEach((mode, i) => {
    // Add enhanced header for first mode only
    if (i === 0) {
      cssString = `/* ===========================================
   Figma Variables Export
   Generated: ${timestamp}
   Modes: ${allModes.join(', ')}
   Collections: ${allCollections.join(', ')}
   Color Mode: ${colorResolutionMode}
   =========================================== */

`;
    } else {
      cssString = "";
    }
    
    cssString += `/* Mode: ${mode} */\n`;

    Object.keys(modeVariables[mode]).forEach((collection) => {
      cssString += `\n  /* Collection: ${collection} */\n`;
      
      // Group variables by type for better organization
      const colorVars: string[] = [];
      const otherVars: string[] = [];

      Object.keys(modeVariables[mode][collection]).forEach(
        (variable) => {
          const variableData = modeVariables[mode][collection][variable];
          const cssProperty = `  --${variable}: ${
            variableData.isAlias
              ? `var(--${variableData.varValue})`
              : variableData.varValue
          };`;
          
          // Check if it's a color variable
          const isColor = typeof variableData.varValue === 'string' && 
            (variableData.varValue.includes('#') || 
             variableData.varValue.includes('rgb') || 
             variableData.varValue.includes('hsl'));
             
          if (isColor) {
            colorVars.push(cssProperty);
          } else {
            otherVars.push(cssProperty);
          }
        }
      );
      
      // Add color variables first
      if (colorVars.length > 0) {
        cssString += `  
  /* Colors */\n`;
        colorVars.forEach(varLine => cssString += varLine + '\n');
      }
      
      // Add other variables
      if (otherVars.length > 0) {
        if (colorVars.length > 0) {
          cssString += `  
  /* Other Variables */\n`;
        }
        otherVars.forEach(varLine => cssString += varLine + '\n');
      }
    });

    modeCSSObject[mode] = encloseContentInRoot(
      cssString,
      ROOT_SELECTOR
    );
  });

  return modeCSSObject;
}

export function getCSSResponseFromData(
  collectionsData: CollectionsData,
  colorResolutionMode: ColorResolutionMode
) {
  const simplifiedData = getSimplifiedCollectionData(
    collectionsData,
    colorResolutionMode
  );
  let cssString = "";
  let collectionCSSObject: CSSData = {};

  // Get all collection names for header
  const collectionNames = Object.keys(simplifiedData);
  const timestamp = new Date().toISOString().split('T')[0];

  Object.keys(simplifiedData).forEach((collection, i) => {
    // Add enhanced header for first collection only
    if (i === 0) {
      cssString = `/* ===========================================
   Figma Variables Export
   Generated: ${timestamp}
   Collections: ${collectionNames.join(', ')}
   Color Mode: ${colorResolutionMode}
   =========================================== */

`;
    } else {
      cssString = "";
    }
    
    cssString += `/* Collection: ${collection} */\n`;

    // Group variables by type for better organization
    const modeVariables = simplifiedData[collection];
    const modes = Object.keys(modeVariables);
    
    modes.forEach((mode, modeIndex) => {
      cssString += `\n/* Mode: ${mode} */\n`;
      
      // Separate color variables from other types
      const colorVars: string[] = [];
      const otherVars: string[] = [];
      
      Object.keys(modeVariables[mode]).forEach((variable) => {
        const variableData = modeVariables[mode][variable];
        const cssProperty = `  --${variable}: ${
          variableData.isAlias
            ? `var(--${variableData.varValue})`
            : variableData.varValue
        };`;
        
        // Check if it's a color variable (contains # or rgb/hsl)
        const isColor = typeof variableData.varValue === 'string' && 
          (variableData.varValue.includes('#') || 
           variableData.varValue.includes('rgb') || 
           variableData.varValue.includes('hsl'));
           
        if (isColor) {
          colorVars.push(cssProperty);
        } else {
          otherVars.push(cssProperty);
        }
      });
      
      // Add color variables first with section header
      if (colorVars.length > 0) {
        cssString += `  
  /* Colors */\n`;
        colorVars.forEach(varLine => cssString += varLine + '\n');
      }
      
      // Add other variables
      if (otherVars.length > 0) {
        if (colorVars.length > 0) {
          cssString += `  
  /* Other Variables */\n`;
        }
        otherVars.forEach(varLine => cssString += varLine + '\n');
      }
    });

    collectionCSSObject[collection] = encloseContentInRoot(
      cssString,
      ROOT_SELECTOR
    );
  });

  return collectionCSSObject;
}
