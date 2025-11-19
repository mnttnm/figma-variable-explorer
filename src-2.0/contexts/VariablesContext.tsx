import { createContext, JSX, h } from "preact";
import React from "preact/compat";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "preact/hooks";
import { emit, on, once } from "@create-figma-plugin/utilities";
import copy from "copy-to-clipboard";
import {
  CollectionsData,
  CSSData,
  GetJsonDataHandler,
  GetVariableHandler,
  JSONData,
  VariableViewMode,
  ExportContentType,
  ExportFormat,
} from "../types";
import ConfigurationContext from "./ConfigurationContext";
import { getMarkdownFromJSON, getCSVFromData } from "../helpers/export-helper";
import { createFileFromContent } from "../utils";
import { getCSSResponseFromData, getSCSSResponseFromData } from "../helpers/variableResolverHelper";

export enum VariableStatus {
  LOADING = "loading",
  ERROR = "error",
  SUCCESS = "success",
}

export interface InternalVariable {
  name: string;
  values: string;
  random: string;
}

interface CollectionObject {
  id: string;
  jsonId: string;
  name: string;
}

export interface VariableContextData {
  status: VariableStatus;
  error: string;
  data: CollectionsData | undefined;
  collections: CollectionObject[];
  activeCollection: number | undefined;
  changeActiveCollection: (collection: number) => void;
  handleCopyContent: () => void;
  changeDataStatus: (status: VariableStatus) => void;
  cssData: CSSData | undefined;
  scssData: CSSData | undefined;
  jsonData: JSONData | undefined;
  handleExport: (
    exportContentType: ExportContentType,
    isOnlyForActiveSelection: boolean,
    format?: ExportFormat
  ) => void;
}

export const kInitialVariableData: VariableContextData = {
  status: VariableStatus.LOADING,
  error: "",
  data: undefined,
  cssData: undefined,
  scssData: undefined,
  jsonData: undefined,
  collections: [],
  activeCollection: undefined,
  changeActiveCollection: (collection: number) => {},
  handleCopyContent: () => {},
  changeDataStatus: (status: VariableStatus) => {},
  handleExport: (
    exportContentType: ExportContentType,
    isOnlyForActiveSelection: boolean,
    format?: ExportFormat
  ) => { },
};

export const VariablesContext = createContext<VariableContextData>(
  kInitialVariableData
);

// todo: simplify this Context Provider, too much is going on here
export const VariablesContextProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const { colorResolutionMode, variableViewMode } = useContext(
    ConfigurationContext
  )!;

  const [activeCollection, setActiveCollection] = useState<
    number | undefined
  >(undefined);

  const [variablesData, setVariablesData] =
    useState<VariableContextData>(kInitialVariableData);

  const changeDataStatus = useCallback((status: VariableStatus) => {
    setVariablesData((prevState) => ({
      ...prevState,
      status,
    }));
  }, []);

  const changeActiveCollection = useCallback(
    (collectionIndex: number) => {
      setActiveCollection(collectionIndex);
    },
    []
  );



  const handleCopyContent = useCallback(() => {
    let contentToBeCopied = "";
    if (variableViewMode === "json") {
      const { jsonData, collections } = variablesData;
      if (jsonData) {
        contentToBeCopied = JSON.stringify(
          jsonData[collections[activeCollection!].jsonId],
          null,
          2
        );
      } else {
        contentToBeCopied = JSON.stringify({}, null, 2);
      }
    } else if (variableViewMode === "css") {
      const { cssData, collections } = variablesData;
      if (cssData) {
        contentToBeCopied = cssData[collections[activeCollection!].id];
      } else {
        contentToBeCopied = "";
      }
    }

    copy(contentToBeCopied);
  }, [activeCollection, variableViewMode, variablesData]);

  function getCollectionsFromData(data: any) {
    // Map collectionsData keys with corresponding jsonData keys
    if (data["collectionsData"] && data["jsonData"]) {
      const collectionsDataKeys = Object.keys(data["collectionsData"]);
      const jsonDataKeys = Object.keys(data["jsonData"]);

      return collectionsDataKeys.map((collectionKey, index) => {
        const jsonKey = jsonDataKeys[index] || collectionKey;
        const displayName = data["jsonData"]?.[jsonKey]?.["$collection_metadata"]?.name || collectionKey;
        return {
          id: collectionKey,
          jsonId: jsonKey,
          name: displayName,
        };
      });
    } else if (data["collectionsData"]) {
      return Object.keys(data["collectionsData"]).map((collectionKey) => {
        return {
          id: collectionKey,
          jsonId: collectionKey,
          name: collectionKey,
        };
      });
    } else {
      return [];
    }
  }

  const handleExport = useCallback(
    (exportContentType: ExportContentType, isOnlyForActiveSelection: boolean, format: ExportFormat = "css") => {
      if (variablesData.status !== VariableStatus.SUCCESS) return;

      const { jsonData, cssData, scssData, collections } = variablesData;
      const fileNamePrefix = isOnlyForActiveSelection && activeCollection !== undefined
        ? collections[activeCollection].name.toLowerCase().replace(/\s+/g, '-')
        : 'variables';

      switch (exportContentType) {
        case "json":
          const jsonDataForExport = isOnlyForActiveSelection && activeCollection !== undefined && jsonData
            ? { [collections[activeCollection].jsonId]: jsonData[collections[activeCollection].jsonId] }
            : jsonData || {}; // Fallback to an empty object if jsonData is undefined
          createFileFromContent(`${fileNamePrefix}.json`, JSON.stringify(jsonDataForExport, null, 2));
          break;
        case "markdown":
          const jsonForMarkdown = isOnlyForActiveSelection && activeCollection !== undefined && jsonData
            ? { [collections[activeCollection].jsonId]: jsonData[collections[activeCollection].jsonId] }
            : jsonData || {}; // Fallback to an empty object if jsonData is undefined
          getMarkdownFromJSON(jsonForMarkdown, `${fileNamePrefix}.md`);
          break;
        case "css":
          if (format === "scss") {
            const scssStringToExport = isOnlyForActiveSelection && activeCollection !== undefined && scssData
              ? scssData[collections[activeCollection].id]
              : Object.values(scssData ?? {}).join('\n\n');
            createFileFromContent(`${fileNamePrefix}.scss`, scssStringToExport);
          } else {
            const cssStringToExport = isOnlyForActiveSelection && activeCollection !== undefined && cssData
              ? cssData[collections[activeCollection].id]
              : Object.values(cssData ?? {}).join('\n');
            createFileFromContent(`${fileNamePrefix}.css`, cssStringToExport);
          }
          break;
        case "csv":
          const jsonForCSV = isOnlyForActiveSelection && activeCollection !== undefined && jsonData
            ? { [collections[activeCollection].jsonId]: jsonData[collections[activeCollection].jsonId] }
            : jsonData || {}; // Fallback to an empty object if jsonData is undefined
          getCSVFromData(jsonForCSV, `${fileNamePrefix}.csv`);
          break;
      }
    },
    [variablesData, activeCollection]
  );

  useEffect(() => {
    once("DONE", (result) => {
      if (result.error) {
        setVariablesData({
          ...kInitialVariableData,
          status: VariableStatus.ERROR,
          error: result.error,
        });
      } else {
        setVariablesData({
          ...kInitialVariableData,
          status: VariableStatus.SUCCESS,
          data: result["collectionsData"],
          cssData: getCSSResponseFromData(
            result["collectionsData"],
            colorResolutionMode
          ),
          scssData: getSCSSResponseFromData(
            result["collectionsData"],
            colorResolutionMode
          ),
          jsonData: result["jsonData"],
          collections: getCollectionsFromData(result),
        });
        if (Object.keys(result).length > 0 && !activeCollection) {
          setActiveCollection(0);
        }
      }
    });
    setVariablesData((prevState) => ({
      ...prevState,
      status: VariableStatus.LOADING,
    }));
    emit<GetVariableHandler>(
      "GET_VARIABLES",
      variableViewMode,
      colorResolutionMode
    );
  }, [colorResolutionMode]);

  return (
    <VariablesContext.Provider
      value={{
        ...variablesData,
        changeActiveCollection,
        activeCollection,
        handleCopyContent,
        changeDataStatus,
        handleExport,
      }}
    >
      {children}
    </VariablesContext.Provider>
  );
};
