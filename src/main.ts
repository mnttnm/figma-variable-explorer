import { convertRgbColorToHexColor, emit, on, once, showUI } from "@create-figma-plugin/utilities";

import { CloseHandler, GetVariableHandler } from "./types";

export function isVariableAlias(value: VariableValue | undefined): value is VariableAlias {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "VARIABLE_ALIAS"
  );
}

export interface AliasValue {
  aliasID: string;
  aliasLabel: string;
  collection: string;
}

export interface ColorValue {
  hexValue: string;
  rgbaValue: string;
}

export interface VariableValueInfo {
  isAlias: boolean;
  value: string | AliasValue | ColorValue;
}


export interface VariableModeValues {
  [mode: string]: VariableValueInfo;
}

export interface InternalVariable {
  type: VariableResolvedDataType;
  values: VariableModeValues;
  id: string;
}

export interface VariableData {
  modes: string[];
  variables: { [variableName: string]: InternalVariable };
}

export interface CollectionsData {
  [collectionName: string]: VariableData;
}

function alphaToHex(alpha: number): string {
  const alphaDecimal = Math.round(alpha * 255);

  const alphaHex = alphaDecimal.toString(16);

  // Ensure the alpha value is at least two characters long
  const paddedAlphaHex = alphaHex.padStart(2, "0");

  return paddedAlphaHex;
}

function getResolvedVariableValue(value: VariableValue, isColor: boolean) {
  let varValue;
  if (isVariableAlias(value)) {
    varValue = {
      aliasID: value.id,
      aliasLabel: figma.variables.getVariableById(value.id)?.name,
      collection: figma.variables.getVariableCollectionById(figma.variables.getVariableById(value.id)!.variableCollectionId)?.name
    } as AliasValue;
  } else {
    if (isColor) {
      const { r, g, b, a } = value as RGBA;
      varValue = {
        hexValue: `#${convertRgbColorToHexColor({ r, g, b }) ?? ""}, ${
          Number(a.toFixed(2)) * 100
        }%`,
        rgbaValue: `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(
          b * 255
        )},${a.toFixed(2)})`,
      } as ColorValue;
    } else {
      // Round numbers to match Figma's precision (0.01) to avoid floating-point precision issues
      if (typeof value === 'number') {
        const rounded = Math.round(value * 100) / 100;
        varValue = rounded.toString();
      } else {
        varValue = value.toString();
      }
    }
  }
  return varValue;
}

function resolveVariableValuesByMode(variableValues: any, collection:VariableCollection, isColor: boolean): VariableModeValues {
  let resolvedValues: VariableModeValues = {};
  for (const key in variableValues) {
    let varInfo: VariableValueInfo = {
      isAlias: false,
      value: "",
    };
    const varValue = variableValues[key];
    if (isVariableAlias(varValue)) {
      varInfo.isAlias = true;
    }
    varInfo.value = getResolvedVariableValue(varValue, isColor);
    const modeName = collection.modes.find((mode) => mode.modeId === key)?.name ?? key;
    resolvedValues[modeName] = varInfo;
  }
  return resolvedValues;
}

export default function () {
  on("RESIZE_WINDOW", function (windowSize: { width: number; height: number }) {
    const { width, height } = windowSize;
    figma.ui.resize(width, height);
  });

  once<CloseHandler>("CLOSE", function () {
    figma.closePlugin();
  });

  on<GetVariableHandler>("GET_VARIABLES", function () {
    const collections = figma.variables.getLocalVariableCollections();
    const collectionsData: CollectionsData = {};
    collections.forEach((collection) => {
      const collectionVariables: VariableData = {
        modes: collection.modes.map((mode) => mode.name),
        variables: {},
      };
      const collVariables = collection.variableIds;

      collVariables.forEach((variableId) => {
        const figmaVar = figma.variables.getVariableById(variableId);
        if (figmaVar) {
          const varInfo: InternalVariable = {
            type: figmaVar.resolvedType,
            values: resolveVariableValuesByMode(
              figmaVar.valuesByMode,
              collection,
              figmaVar.resolvedType === "COLOR"
            ),
            id: figmaVar.id,
          };
          collectionVariables.variables[figmaVar.name] = varInfo;
        }
      });

      collectionsData[collection.name] = collectionVariables;
    });
    emit("DONE", collectionsData);
  });

  showUI({
    width: 500,
    height: 800,
  });
}
