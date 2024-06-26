import {
  render,
  VerticalSpace,
  Text,
  MiddleAlign,
  Stack,
  Columns,
  Dropdown,
  Link,
  Toggle,
  Divider,
  Button,
  IconSwap32,
  useWindowResize,
  DropdownOption,
  IconLayerFrame16,
} from "@create-figma-plugin/ui";
import { emit, on } from "@create-figma-plugin/utilities";
import { Fragment, JSX, h } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";

import { GetVariableHandler } from "./types";
import { AliasValue, CollectionsData, ColorValue, VariableValueInfo } from "./main";
import copy from "copy-to-clipboard";
import TableCSS from "./table.css";

declare type ViewingMode = "List" | "CSS" | "JSON";

interface ValueRendererProps {
  varValueInfo: VariableValueInfo;
  showCollection: boolean;
  type: VariableResolvedDataType;
}

function ValueRenderer({ varValueInfo, showCollection, type }: ValueRendererProps) {
  return (
    <div
      style={{
        textAlign: "left",
        width: "200px",
        maxWidth: "200px",
      }}
    >
      {varValueInfo.isAlias ? (
        <Link
          href={`#${(varValueInfo.value as AliasValue).aliasID}`}
          style={{
            textDecoration: "underline",
            color: "var(--figma-color-text-component)",
            overflow: "auto",
            width: "200px",
          }}
        >
          {`${
            showCollection ? (varValueInfo.value as AliasValue as AliasValue).collection + ":" : ""
          }
                  ${(varValueInfo.value as AliasValue as AliasValue).aliasLabel}`}
        </Link>
      ) : type === "COLOR" ? (
        <Columns space="extraSmall" style={{ alignItems: "center" }}>
          <div
            style={{
              width: "18px",
              height: "18px",
              backgroundColor: (varValueInfo.value as ColorValue).rgbaValue,
              borderRadius: "4px",
              border: "1px solid var(--figma-color-border)",
              // change pointer cursor to "text" for copy button
              cursor: "pointer",
            }}
            onClick={() => copy((varValueInfo.value as ColorValue).hexValue.split(",")[0])}
            title={"Click to Copy"}
          ></div>
          <div style={{ width: "180px", userSelect: "text", cursor: "text" }}>
            {(varValueInfo.value as ColorValue).hexValue}
          </div>
        </Columns>
      ) : (
        <div
          style={{
            width: "150px",
            textAlign: "left",
            userSelect: "text",
            cursor: "text",
            overflowX: "auto",
          }}
        >
          {varValueInfo.value}
        </div>
      )}
    </div>
  );
}
function getUniqueModes(filteredVarCollectionData: CollectionsData) {
  const allModes: string[] = Object.values(filteredVarCollectionData).flatMap(
    (collection) => collection.modes
  );

  return Array.from(new Set(allModes));
}

function replaceSpacesAndSlashesWithHyphen(str: string) {
  return str.replace(/\s+/g, "-").replace(/\//g, "-");
}

function getSimplifiedCollectionData(filteredVarCollectionData: CollectionsData) {
  let simplifiedCSSJson: any = {};

  Object.keys(filteredVarCollectionData).map((collectionName) => {
    const collection = collectionName.toUpperCase();
    const collectionObject: any = {};
    Object.keys(filteredVarCollectionData[collectionName].variables).map((variableName) => {
      const varName = replaceSpacesAndSlashesWithHyphen(variableName);
      const varInfo = filteredVarCollectionData[collectionName].variables[variableName];

      // iterate variables and create mapping b/w modes and variables for the current collection
      Object.keys(varInfo.values).forEach((mode) => {
        const isAlias = varInfo.values[mode].isAlias;
        const varValue = isAlias
          ? replaceSpacesAndSlashesWithHyphen((varInfo.values[mode].value as AliasValue).aliasLabel)
          : varInfo.type === "COLOR"
          ? (varInfo.values[mode].value as ColorValue).rgbaValue
          : varInfo.values[mode].value;
        collectionObject[mode] = { ...collectionObject[mode], [varName]: { varValue, isAlias } };
      });
    });
    simplifiedCSSJson[collection] = collectionObject;
  });

  return simplifiedCSSJson;
}

function getCollectionsByMode(filteredVarCollectionData: CollectionsData) {
  const simplifiedCollectionData = getSimplifiedCollectionData(filteredVarCollectionData);

  // consolidate variables on a mode basis
  const modeVariables: Record<string, Record<string, any>> = {};
  const uniqueModes = getUniqueModes(filteredVarCollectionData);
  uniqueModes.forEach((mode) => {
    Object.keys(simplifiedCollectionData).forEach((collection) => {
      if (collection in simplifiedCollectionData && mode in simplifiedCollectionData[collection]) {
        modeVariables[mode] = {
          ...(modeVariables[mode] || {}),
          [collection]: simplifiedCollectionData[collection][mode],
        };
      }
    });
  });
  return modeVariables;
}

function getCSSResponseByMode(filteredVarCollectionData: CollectionsData) {
  const modeVariables = getCollectionsByMode(filteredVarCollectionData);

  let cssString = "";
  Object.keys(modeVariables).forEach((mode, i) => {
    cssString += `/* Mode-${i + 1}: ${mode} */\n\n`;

    Object.keys(modeVariables[mode]).forEach((collection) => {
      cssString += `/* Collection: ${collection} */\n`;

      Object.keys(modeVariables[mode][collection]).forEach((variable) => {
        const variableData = modeVariables[mode][collection][variable];
        cssString += `--${variable}: ${
          variableData.isAlias ? `var(--${variableData.varValue})` : variableData.varValue
        };\n`;
      });

      cssString += "\n";
    });
  });
  return cssString;
}

function Plugin() {
  const [varCollectionData, setVarCollectionDataData] = useState<CollectionsData>({});
  const [, setCollections] = useState<string[]>(["All"]);
  const [filteredVarCollectionData, setFilteredVarCollectionData] = useState<CollectionsData>({});
  const [, setSelectedCollection] = useState<string>("All");
  const [viewingMode, setViewingMode] = useState<ViewingMode>("List");
  const [showCollection, setShowCollection] = useState<boolean>(true);
  const [isCopying, setIsCopying] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleVariableRendering = useCallback((varCollectionData: CollectionsData) => {
    const collections = Object.keys(varCollectionData);
    setCollections(collections);
    setVarCollectionDataData(varCollectionData);
    setFilteredVarCollectionData(varCollectionData);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  }, []);

  on("DONE", handleVariableRendering);

  useEffect(() => {
    emit<GetVariableHandler>("GET_VARIABLES");
  }, []);

  function onWindowResize(windowSize: { width: number; height: number }) {
    emit("RESIZE_WINDOW", windowSize);
  }

  useWindowResize(onWindowResize, {
    minWidth: 400,
    minHeight: 600,
    resizeBehaviorOnDoubleClick: "maximize",
    maxHeight: window.screen.availHeight - 100,
    maxWidth: window.screen.availWidth - 100,
  });

  function onRefresh() {
    setIsRefreshing(true);
    emit<GetVariableHandler>("GET_VARIABLES");
  }

  function handleViewingModeChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const newViewingMode = event.currentTarget.value as ViewingMode;
    setViewingMode(newViewingMode);
  }

  function onShowCollectionChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    setShowCollection(!showCollection);
  }

  function handleCopyButtonClick(event: JSX.TargetedMouseEvent<HTMLButtonElement>) {
    const textToCopy =
      viewingMode === "CSS"
        ? getCSSResponseByMode(varCollectionData)
        : viewingMode === "JSON"
        ? JSON.stringify(getSimplifiedCollectionData(varCollectionData))
        : "List";
    copy(textToCopy);
    setIsCopying(true);
    setTimeout(() => {
      setIsCopying(false);
    }, 1000);
  }

  function handleSearchChange(searchString: string) {
    setSearchTerm(searchString);
  }

  const lowerCaseSearchTerm = searchTerm.toLowerCase();

  return Object.keys(varCollectionData).length > 0 ? (
    <div style={{ padding: "8px 16px", fontSize: "14px" }}>
      <Stack space="small">
        {/* Add a header bar showing plugin name and an action button to alllow the users to submit issue */}
        {/* <Text style={{ fontWeight: "600" }}>Variables</Text> */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            onClick={onRefresh}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              color: "var(--figma-color-text-component)",
              cursor: "pointer",
              flex: 1,
            }}
          >
            <IconSwap32 />
            <Text style={{ color: "var(--figma-color-text-component)" }}>
              {isRefreshing ? "Refreshing..." : `Refresh`}
            </Text>
          </div>
          <a
            style={{ flex: 1, textAlign: "right", color: "var(--figma-color-text-component)" }}
            href={"https://tally.so/r/3N7e9j"}
            target={"blank"}
          >
            Submit Feedback
          </a>
        </div>
        <label style={{ fontWeight: "600" }}>Format</label>
        <Dropdown
          onChange={handleViewingModeChange}
          options={[
            {
              value: "List",
            },
            {
              value: "CSS",
            },
            {
              value: "JSON",
            },
          ]}
          placeholder="Collection"
          value={viewingMode}
          variant="border"
        />
      </Stack>
      <VerticalSpace space="small" />
      {viewingMode === "List" && (
        <Stack space="small">
          <Fragment>
            <Toggle onChange={onShowCollectionChange} value={showCollection}>
              <Text>Show Collections</Text>
            </Toggle>
            <VerticalSpace space="small" />
          </Fragment>
          <label style={{ fontWeight: "600" }}>Search</label>
          <input
            style={{
              padding: "4px 4px",
              fontSize: "14px",
              border: "1px solid grey",
              width: "100%",
            }}
            type="text"
            onInput={(e) => {
              handleSearchChange(e.currentTarget.value);
            }}
            value={searchTerm}
            placeholder="Search"
          />
          <VerticalSpace space="extraSmall" />
        </Stack>
      )}

      {viewingMode === "List" && (
        <div>
          {!showCollection && (
            <Columns style={{ width: "100vw" }}>
              <div
                style={{
                  padding: "8px 0px",
                  textAlign: "left",
                  width: "250px",
                  maxWidth: "250px",
                  fontWeight: "600",
                  color: "var(--figma-color-text-secondary)",
                }}
              >
                Variable
              </div>
              {getUniqueModes(filteredVarCollectionData).map((mode) => {
                return (
                  <div
                    style={{
                      padding: "8px 0px",
                      textAlign: "left",
                      width: "200px",
                      fontWeight: "600",
                      color: "var(--figma-color-text-secondary)",
                    }}
                  >
                    {`Mode: ${mode}`}
                  </div>
                );
              })}
            </Columns>
          )}
          {Object.keys(filteredVarCollectionData).map((collectionName) => {
            return (
              <div>
                {showCollection ? (
                  <Fragment>
                    <VerticalSpace space="small" />
                    <Text
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "var(--figma-color-text)",
                      }}
                    >
                      {collectionName.toUpperCase()}
                    </Text>
                    <VerticalSpace space="small" />
                    <Divider />
                    <Columns style={{ width: "100vw" }}>
                      <div
                        style={{
                          padding: "8px 0px",
                          textAlign: "left",
                          width: "250px",
                          fontWeight: "600",
                          color: "var(--figma-color-text-secondary)",
                        }}
                      >
                        Name
                      </div>
                      {filteredVarCollectionData[collectionName].modes.map((mode) => {
                        return (
                          <div
                            style={{
                              padding: "8px 0px",
                              textAlign: "left",
                              width: "200px",
                              maxWidth: "200px",
                              fontWeight: "600",
                              color: "var(--figma-color-text-secondary)",
                            }}
                          >
                            {"Mode: " + mode}
                          </div>
                        );
                      })}
                    </Columns>
                  </Fragment>
                ) : (
                  <Fragment> </Fragment>
                )}
                {Object.keys(filteredVarCollectionData[collectionName].variables)
                  .filter((varName) => {
                    if (lowerCaseSearchTerm === "") {
                      return true;
                    }
                    const searchInVarName = varName.toLowerCase().includes(lowerCaseSearchTerm);

                    if (searchInVarName) return true;

                    // we are excluding object keys from being included into the search

                    const variableValues = Object.values(
                      filteredVarCollectionData[collectionName].variables[varName].values
                    );

                    for (const variableValue of variableValues) {
                      console.log(variableValue);
                      if (variableValue.isAlias) {
                        return (variableValue.value as AliasValue).aliasLabel
                          .toLowerCase()
                          .includes(lowerCaseSearchTerm);
                      }

                      if (typeof variableValue.value === "string") {
                        return variableValue.value.toLowerCase().includes(lowerCaseSearchTerm);
                      }
                      return (variableValue.value as ColorValue).hexValue
                        .split(",")[0]
                        .toLowerCase()
                        .includes(lowerCaseSearchTerm);
                    }
                  })
                  .map((variableName) => {
                    const varInfo =
                      filteredVarCollectionData[collectionName].variables[variableName];
                    return (
                      <Columns style={{ width: "100vw" }}>
                        <div
                          style={{
                            padding: "8px 0px",
                            color: "var(--figma-color-text)",
                            userSelect: "text",
                            textAlign: "left",
                            cursor: "text",
                            width: "250px",
                            maxWidth: "250px",
                            overflow: "auto",
                          }}
                          id={varInfo.id}
                        >
                          {variableName}
                        </div>
                        {Object.keys(varInfo.values).map((mode) => {
                          const varValueInfo = varInfo.values[mode];
                          return (
                            <ValueRenderer
                              varValueInfo={varValueInfo}
                              showCollection={showCollection}
                              type={varInfo.type}
                            />
                          );
                        })}
                      </Columns>
                    );
                  })}
              </div>
            );
          })}
        </div>
      )}
      {
        // make copy functionality available only in css and json view
        viewingMode !== "List" && (
          <div style={{ textAlign: "right" }}>
            <Button
              style={{
                borderColor: "var(--figma-color-border-strong)",
                width: "150",
                borderWidth: "2",
              }}
              class={TableCSS.button}
              onClick={handleCopyButtonClick}
              secondary
            >
              {isCopying ? `Copied!` : `Copy ${viewingMode}`}
            </Button>
          </div>
        )
      }
      {viewingMode === "JSON" && (
        <pre
          style={{
            userSelect: "all",
            cursor: "text",
            border: "1px var(--figma-color-border) solid",
            background: "var(--figma-color-bg-secondary)",
            padding: "8px 6px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(getCollectionsByMode(varCollectionData), null, 2)}
        </pre>
      )}
      {viewingMode === "CSS" && (
        <pre
          style={{
            userSelect: "all",
            cursor: "text",
            border: "1px var(--figma-color-border) solid",
            background: "var(--figma-color-bg-secondary)",
            padding: "6px",
            overflow: "auto",
          }}
        >
          {getCSSResponseByMode(filteredVarCollectionData)}
        </pre>
      )}
    </div>
  ) : (
    <MiddleAlign> No variables to show! </MiddleAlign>
  );
}

export default render(Plugin);

