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
} from "../types";
import ConfigurationContext from "./ConfigurationContext";
import { getMarkdownFromJSON } from "../helpers/export-helper";

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
  name: string;
}

export interface VariableContextData {
  status: VariableStatus;
  error: string;
  data: CollectionsData | CSSData | JSONData | undefined;
  collections: CollectionObject[];
  activeCollection: number | undefined;
  changeActiveCollection: (collection: number) => void;
  handleCopyContent: () => void;
  changeDataStatus: (status: VariableStatus) => void;
  handleExport: (isOnlyForActiveSelection: boolean) => void;
}

export const kInitialVariableData: VariableContextData = {
  status: VariableStatus.LOADING,
  error: "",
  data: undefined,
  collections: [],
  activeCollection: undefined,
  changeActiveCollection: (collection: number) => {},
  handleCopyContent: () => {},
  changeDataStatus: (status: VariableStatus) => {},
  handleExport: (isOnlyForActiveSelection: boolean) => void {},
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

  const currentData = useMemo(() => {
    if (activeCollection !== undefined)
      return variablesData.data?.[
        variablesData.collections[activeCollection].id
      ];

    return {};
  }, [variablesData.data, activeCollection]);

  const handleCopyContent = useCallback(() => {
    let contentToBeCopied = currentData;
    if (variableViewMode === "json") {
      contentToBeCopied = JSON.stringify(
        {
          [variablesData.collections[activeCollection!].id]:
            currentData,
        },
        null,
        2
      );
    }
    copy(contentToBeCopied);
  }, [currentData]);

  function getCollectionsFromData(
    data: CollectionsData | CSSData | JSONData,
    variableViewMode: VariableViewMode
  ) {
    if (variableViewMode === "table" || variableViewMode === "css") {
      return Object.keys(data).map((collectionKey) => {
        return {
          id: collectionKey,
          name: collectionKey,
        };
      });
    } else if (variableViewMode === "json") {
      return Object.keys(data).map((collectionKey) => {
        return {
          id: collectionKey,
          name: data[collectionKey]["$collection_metadata"].name,
        };
      });
    } else {
      return [];
    }
  }

  const handleExport = useCallback(
    (isOnlyForActiveSelection: boolean) => {
      emit<GetJsonDataHandler>(
        "GET_JSON_DATA",
        colorResolutionMode,
        isOnlyForActiveSelection ? activeCollection : undefined
      );
    },
    [colorResolutionMode, activeCollection]
  );

  const handleJsonDataReady = useCallback(
    (data, activeCollection) => {
      if (variablesData.status === VariableStatus.SUCCESS) {
        const jsonData =
          activeCollection !== undefined
            ? Object.fromEntries([
                Object.entries(data)[activeCollection],
              ])
            : data;
        getMarkdownFromJSON(jsonData);
      }
    },
    [variablesData.collections, activeCollection]
  );

  useEffect(() => {
    on("JSON_DATA_READY", handleJsonDataReady);
  }, [handleJsonDataReady]);

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
          data: result,
          collections: getCollectionsFromData(
            result,
            variableViewMode
          ),
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
  }, [colorResolutionMode, variableViewMode]);

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
