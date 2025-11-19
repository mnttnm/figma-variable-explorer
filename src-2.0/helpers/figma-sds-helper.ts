/*
  Majority of this code is from the file https://github.com/figma/sds/blob/main/scripts/tokens/figma-plugin-token-json/code.js
  original repo: https://github.com/figma/sds
*/

import { ColorResolutionMode, JSONData } from "../types";
import { getColorValue } from "./variableResolverHelper";

const KEY_PREFIX_COLLECTION = `@`;

interface Variable {
  id: string;
  name: string;
  variableCollectionId: string;
  resolvedType: string;
  valuesByMode: { [key: string]: any };
  description: string;
}

interface Collection {
  id: string;
  name: string;
  modes: Mode[];
  variableIds: string[];
}

interface Mode {
  modeId: string;
  name: string;
}

interface EffectStyle {
  type: string;
  name: string;
  effects: any[];
}

interface PaintStyle {
  type: string;
  name: string;
  paints: any[];
}

interface TextStyle {
  type: string;
  name: string;
  fontSize: number;
  textDecoration: string;
  fontName: any;
  letterSpacing: any;
  lineHeight: any;
  leadingTrim: any;
  paragraphIndent: number;
  paragraphSpacing: number;
  listSpacing: number;
  handingPunctiation: any;
  handlingList: any;
  textCase: string;
  boundVariables: { [key: string]: any };
}

/*
* Not in Use
function recurseVariables(variable: Variable, list: any) {
  const variables = Array.isArray(variable) ? variable : [variable];
  variables.forEach((variable) => {
    if (!variable || !variable.id) return;
    const { name, variableCollectionId, resolvedType, valuesByMode } =
      figma.variables.getVariableById(variable.id) as Variable;
    const collection = figma.variables.getVariableCollectionById(
      variableCollectionId
    ) as Collection;
    const modes = collection.modes;
    const isSingleMode = modes.length === 1;
    const item: any = {
      token: [
        `${KEY_PREFIX_COLLECTION}${sanitizeName(collection.name)}`,
        name,
      ].join("/"),
      collection: collection.name,
      name,
      type: resolvedType,
    };
    if (!isSingleMode) {
      item.modes = {};
    }
    const modeIds = Object.keys(valuesByMode);
    modeIds.forEach((modeId) => {
      const mode = isSingleMode
        ? "Default"
        : modes.find((mode) => mode.modeId === modeId)?.name!;
      let value = valuesByMode[modeId];
      if (value.type === "VARIABLE_ALIAS") {
        const variable = figma.variables.getVariableById(
          value.id
        ) as Variable;
        const v: any = {};
        recurseVariables(variable, v);
        if (isSingleMode) {
          item.value = v;
        } else {
          item.modes[mode] = v;
        }
      } else {
        if (resolvedType === "COLOR") {
          value = rgbToHex(value);
        }
        if (isSingleMode) {
          item.value = value;
        } else {
          item.modes[mode] = value;
        }
      }
    });
    if (Array.isArray(list)) {
      list.push(item);
    } else {
      for (let key in item) {
        list[key] = item[key];
      }
    }
  });
} */

export async function exportToJSON(
  colorResolutionMode: ColorResolutionMode
) {
  const collections =
    await figma.variables.getLocalVariableCollectionsAsync() as Collection[];
  const object: JSONData = {};
  const { idToKey } = uniqueKeyIdMaps(
    collections,
    "id",
    KEY_PREFIX_COLLECTION
  );

  for (const collection of collections) {
    object[idToKey[collection.id]] = await collectionAsJSON(
      idToKey,
      collection,
      colorResolutionMode
    );
  }

  return object;
}

async function collectionAsJSON(
  collectionIdToKeyMap: { [key: string]: string },
  { name, modes, variableIds, id: figmaId }: Collection,
  colorResolutionMode: ColorResolutionMode
) {
  const collection: any = {};
  const { idToKey, keyToId } = uniqueKeyIdMaps(modes, "modeId");
  const modeKeys = Object.values(idToKey).map((key) => {
    return {
      key,
      name: modes.find((mode) => mode.modeId === keyToId[key])?.name!,
    };
  });
  collection.$collection_metadata = {
    name,
    figmaId,
    modes: modeKeys,
  };

  for (const variableId of variableIds) {
    const { name, resolvedType, valuesByMode, description } =
      await figma.variables.getVariableByIdAsync(variableId) as Variable;
    const value = valuesByMode[keyToId[modeKeys[0].key]];
    const fontWeight =
      resolvedType === "FLOAT" &&
      Boolean(name.match(/\/?weight/i)) &&
      "fontWeight";
    const fontFamily =
      resolvedType === "STRING" &&
      Boolean(name.match(/\/?family/i)) &&
      "fontFamily";
    if (
      (value !== undefined &&
        ["COLOR", "FLOAT", "STRING"].includes(resolvedType)) ||
      fontFamily
    ) {
      let obj: any = collection;
      const groupArray = name.split("/");
      groupArray.forEach((groupName, i) => {
        const safeName = groupName
          .split(/[^\da-zA-Z-]+/)
          .join("_")
          .toLowerCase();
        const groupID =
          i === groupArray.length - 1 ? safeName : `$${safeName}`;
        obj[`${groupID}`] = obj[`${groupID}`] || {};
        obj = obj[`${groupID}`];
      });
      obj.$type =
        resolvedType === "COLOR"
          ? "color"
          : resolvedType === "FLOAT"
          ? fontWeight || "number"
          : resolvedType === "STRING"
          ? fontFamily || "string"
          : resolvedType === "BOOLEAN"
          ? "boolean"
          : "unknown";
      obj.$value = await valueToJSON(
        value,
        resolvedType,
        collectionIdToKeyMap
      );
      obj.$description = description || "";
      obj.$variable_metadata = {
        name: name,
        figmaId: variableId,
        modes: {},
      };
      for (const { key: modeKey } of modeKeys) {
        obj.$variable_metadata.modes[modeKey] = await valueToJSON(
          valuesByMode[keyToId[modeKey]],
          resolvedType,
          collectionIdToKeyMap,
          colorResolutionMode
        );
      }
    }
  }
  return collection;
}

export const getColorValueForMode = (
  color: RGBA,
  colorResolutionMode: ColorResolutionMode
) => {
  const colorValue = getColorValue(color);
  switch (colorResolutionMode) {
    case "rgba":
      return colorValue.rgbaValue;
    case "hsla":
      return colorValue.hslaValue;
    case "hex":
      return colorValue.hexValue;
    default:
      return colorValue.hexValue;
  }
};

function roundNumberToFigmaPrecision(value: any): any {
  if (typeof value === 'number') {
    // Round to 2 decimal places to match Figma's precision (0.01)
    return Math.round(value * 100) / 100;
  }
  return value;
}

async function valueToJSON(
  value: any,
  resolvedType: string,
  collectionIdToKeyMap: { [key: string]: string },
  colorResolutionMode: ColorResolutionMode = "hex"
) {
  if (value.type === "VARIABLE_ALIAS") {
    const variable = await figma.variables.getVariableByIdAsync(
      value.id
    ) as Variable;
    const collectionNamePrefix =
      collectionIdToKeyMap[variable.variableCollectionId];

    const newVariableName = variable.name
      .split("/")
      .map((groupName, i, groupArray) => {
        const safeName = sanitizeName(groupName);
        return i === groupArray.length - 1
          ? safeName
          : `$${safeName}`;
      })
      .join(".");
    return `{${collectionNamePrefix}.${newVariableName}}`;
  }

  let resolvedValue = value;
  if (resolvedType === "COLOR") {
    resolvedValue = getColorValueForMode(value, colorResolutionMode);
  } else if (resolvedType === "FLOAT") {
    resolvedValue = roundNumberToFigmaPrecision(value);
  }

  return resolvedValue;
}

function uniqueKeyIdMaps(
  nodesWithNames: { name: string; [key: string]: any }[],
  idKey: string,
  prefix = ""
) {
  const idToKey: { [key: string]: string } = {};
  const keyToId: { [key: string]: string } = {};
  nodesWithNames.forEach((node) => {
    const key = sanitizeName(node.name);
    let int = 2;
    let uniqueKey = `${prefix}${key}`;
    while (keyToId[uniqueKey]) {
      uniqueKey = `${prefix}${key}_${int}`;
      int++;
    }
    keyToId[uniqueKey] = node[idKey];
    idToKey[node[idKey]] = uniqueKey;
  });
  return { idToKey, keyToId };
}

function sanitizeName(name: string) {
  return name
    .replace(/[^a-zA-Z0-9- $.]/g, "")
    .replace(/^ +/, "")
    .replace(/ +$/, "")
    .replace(/[ +]/g, "_")
    .toLowerCase();
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

function RGBAToHexA(rgba: string, forceRemoveAlpha = false) {
  return (
    "#" +
    rgba
      .replace(/^rgba?\(|\s+|\)$/g, "") // Get rgba / rgb string values
      .split(",") // splits them at ","
      .filter((string, index) => !forceRemoveAlpha || index !== 3)
      .map((string) => parseFloat(string)) // Converts them to numbers
      .map((number, index) =>
        index === 3 ? Math.round(number * 255) : number
      ) // Converts alpha to 255 number
      .map((number) => number.toString(16)) // Converts numbers to hex
      .map((string) => (string.length === 1 ? "0" + string : string)) // Adds 0 when length of one number is 1
      .join("")
  ); // Puts the array together to a string
}

function colorToHex({
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
  return RGBAToHexA(
    `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(
      b * 255
    )}, ${a})`
  );
}

// async function getEffects() {
//   const payload: string[] = [];
//   (await figma.getLocalEffectStylesAsync()).forEach(
//     ({ type, name, effects }: EffectStyle) => {
//       const newEffects = effects
//         .filter((a) => a.visible)
//         .map((effect: any) => {
//           const variables: { [key: string]: string } = {};
//           for (let property in effect.boundVariables) {
//             variables[property] = figma.variables.getVariableById(
//               effect.boundVariables[property].id
//             ).name;
//           }
//           const hex = colorToHex(effect.color);
//           return { effect, hex, variables };
//         });
//       payload.push(
//         JSON.stringify({ type, name, effects: newEffects })
//       );
//     }
//   );
//   (await figma.getLocalPaintStylesAsync()).forEach(
//     ({ type, name, paints }: PaintStyle) => {
//       const newPaints = paints
//         .filter((a) => a.visible)
//         .map((paint: any) => {
//           const variables: { [key: string]: string } = {};
//           for (let property in paint.boundVariables) {
//             variables[property] = figma.variables.getVariableById(
//               paint.boundVariables[property].id
//             ).name;
//           }
//           return { paint, variables };
//         });
//       payload.push(JSON.stringify({ type, name, paints: newPaints }));
//     }
//   );
//   (await figma.getLocalTextStylesAsync()).forEach(
//     ({
//       type,
//       name,
//       fontSize,
//       textDecoration,
//       fontName,
//       letterSpacing,
//       lineHeight,
//       leadingTrim,
//       paragraphIndent,
//       paragraphSpacing,
//       listSpacing,
//       handingPunctiation,
//       handlingList,
//       textCase,
//       boundVariables,
//     }: TextStyle) => {
//       const variables: { [key: string]: string } = {};
//       for (let property in boundVariables) {
//         variables[property] = figma.variables.getVariableById(
//           boundVariables[property].id
//         ).name;
//       }
//       payload.push(
//         JSON.stringify({
//           type,
//           name,
//           fontSize,
//           textDecoration,
//           fontName,
//           letterSpacing,
//           lineHeight,
//           leadingTrim,
//           paragraphIndent,
//           paragraphSpacing,
//           listSpacing,
//           handingPunctiation,
//           handlingList,
//           textCase,
//           boundVariables,
//           variables,
//         })
//       );
//     }
//   );
//   return `[${payload.join(",\n")}]`;
// }
