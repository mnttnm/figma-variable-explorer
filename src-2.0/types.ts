import { EventHandler } from "@create-figma-plugin/utilities";

export interface ResizeWindowHandler extends EventHandler {
  name: "RESIZE_WINDOW";
  handler: (windowSize: { width: number; height: number }) => void;
}

export interface CloseHandler extends EventHandler {
  name: "CLOSE";
  handler: () => void;
}

export interface GetVariableHandler extends EventHandler {
  name: "GET_VARIABLES";
  handler: (
    variableViewMode: VariableViewMode,
    colorResolutionMode: ColorResolutionMode
  ) => void;
}

export interface GetJsonDataHandler extends EventHandler {
  name: "GET_JSON_DATA_FOR_EXPORT";
  handler: (
    colorResolutionMode: ColorResolutionMode,
    exportContentType: ExportContentType,
    activeCollection?: number
  ) => void;
}

export interface TrackLaunchHandler extends EventHandler {
  name: "TRACK_LAUNCH";
  handler: () => void;
}

export interface MarkSupportPromptSeenHandler extends EventHandler {
  name: "MARK_SUPPORT_PROMPT_SEEN";
  handler: () => void;
}

export type VariableViewMode = "table" | "css" | "json";
export type ColorResolutionMode = "hex" | "rgba" | "hsla";

export interface AliasValue {
  aliasID: string;
  aliasLabel: string;
  collection: string;
  resolvedValues?: VariableValueInfo[];
}

export interface ColorValue {
  hexValue: string;
  rgbaValue: string;
  hslaValue: string;
}

export interface VariableValueInfo {
  isAlias: boolean;
  value: ColorValue | AliasValue | string;
  aliasResolvedValues?: InternalVariable[];
  collection: string;
}

export interface VariableModeValues {
  [mode: string]: VariableValueInfo;
}

export interface InternalVariable {
  type: VariableResolvedDataType;
  values: VariableModeValues;
  name: string;
}

export interface CollectionVariables {
  modes: string[];
  variables: { [id: string]: InternalVariable };
}

export interface CollectionsData {
  [collectionName: string]: CollectionVariables;
}

// if the variable values has modes as the current mode, then show the resolve value, else show all the modes and the value.

export interface ValueRendererProps {
  varValueInfo: VariableValueInfo;
  showCollection: boolean;
  type: VariableResolvedDataType;
  mode: string;
  title?: string;
}

export type CSSData = Record<string, string>;
export type JSONData = Record<string, any>;
export type ExportScope = "all" | "current";
export type ExportContentType = "markdown" | "json" | "css" | "csv";
export type ExportFormat = "css" | "scss";
export type VariableResolvedDataType = "COLOR" | "STRING" | "NUMBER" | "BOOLEAN";
