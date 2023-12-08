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
        padding: "8px 0px",
        textAlign: "left",
        width: "150px",
      }}
    >
      {varValueInfo.isAlias ? (
        <Link
          href={`#${(varValueInfo.value as AliasValue).aliasID}`}
          style={{
            textDecoration: "underline",
            color: "var(--figma-color-text-component)",
            width: "150px",
            overflow: "auto",
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
              width: "16px",
              height: "16px",
              backgroundColor: (varValueInfo.value as ColorValue).rgbaValue,
            }}
          ></div>
          <div style={{ width: "130px", userSelect: "text", cursor: "text"}}>
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

function getSimplifiedCollectionData(filteredVarCollectionData: CollectionsData) {
  let simplifiedCSSJson: any = {};

  Object.keys(filteredVarCollectionData).map((collectionName) => {
    const collection = collectionName.toUpperCase();
    const collectionObject: any = {};
    Object.keys(filteredVarCollectionData[collectionName].variables).map((variableName) => {
      const varName = `${variableName.replace(" ", "-").replace("/", "-")}`;
      const varInfo = filteredVarCollectionData[collectionName].variables[variableName];

      // iterate variables and create mapping b/w modes and variables for the current collection
      Object.keys(varInfo.values).forEach((mode) => {
        const isAlias = varInfo.values[mode].isAlias;
        const varValue = isAlias
          ? `${(varInfo.values[mode].value as AliasValue).aliasLabel
              .replace(" ", "-")
              .replace("/", "-")}`
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
  const [collections, setCollections] = useState<string[]>(["All"]);
  const [filteredVarCollectionData, setFilteredVarCollectionData] = useState<CollectionsData>({});
  const [selectedCollection, setSelectedCollection] = useState<string>("All");
  const [viewingMode, setViewingMode] = useState<ViewingMode>("List");
  const [showCollection, setShowCollection] = useState<boolean>(true);
  const [isCopying, setIsCopying] = useState<boolean>(false);

  const handleVariableRendering = useCallback((varCollectionData: CollectionsData) => {
    const collections = Object.keys(varCollectionData);
    setCollections(collections);
    setVarCollectionDataData(varCollectionData);
    setFilteredVarCollectionData(varCollectionData);
  }, []);

  on("DONE", handleVariableRendering);

  useEffect(() => {
    emit<GetVariableHandler>("GET_VARIABLES");
  }, []);

  function getCollectionOptionsFromArray(collections: string[]) {
    return [
      {
        value: "All",
      },
      ...collections.map((coll) => {
        return { value: coll };
      }),
    ];
  }

  function handleCollectionSelection(event: JSX.TargetedEvent<HTMLInputElement>) {
    const selectedCollection = event.currentTarget.value;
    setSelectedCollection(selectedCollection);

    // get variables for selected collection
    if (selectedCollection.toLowerCase() === "all") {
      setFilteredVarCollectionData(varCollectionData);
    } else {
      const filteredVars = varCollectionData[selectedCollection];
      setFilteredVarCollectionData({ [selectedCollection]: filteredVars });
    }
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

  return Object.keys(varCollectionData).length > 0 ? (
    <div style={{ padding: "8px 16px", fontSize: "14px" }}>
      <Stack space="small">
        <label>Format</label>
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
      {/* <Stack space="small">
        <Text style={{ fontWeight: "600" }}>Collection</Text>
        <Dropdown
          onChange={handleCollectionSelection}
          options={getCollectionOptionsFromArray(collections)}
          placeholder="Collection"
          value={selectedCollection}
          variant="border"
        />
      </Stack>
      <VerticalSpace space="medium" /> */}
      {viewingMode === "List" && (
        <Fragment>
          <Toggle onChange={onShowCollectionChange} value={showCollection}>
            <Text>Show Collections</Text>
          </Toggle>
          <VerticalSpace space="small" />
        </Fragment>
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
      {viewingMode === "List" && (
        <div>
          {!showCollection && (
            <Columns style={{ width: "100vw" }}>
              <div
                style={{
                  padding: "8px 0px",
                  textAlign: "left",
                  width: "150px",
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
                      width: "150px",
                      color: "var(--figma-color-text-secondary)",
                    }}
                  >
                    {`Mode: ${mode}`}
                  </div>
                );
              })}
            </Columns>
          )}
          {Object.keys(filteredVarCollectionData).map((collectionName) => (
            <Fragment>
              <div>
                {showCollection ? (
                  <Fragment>
                    <VerticalSpace space="small" />
                    <Text
                      style={{
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "var(--figma-color-text-secondary)",
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
                          width: "150px",
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
                              width: "150px",
                              color: "var(--figma-color-text-secondary)",
                            }}
                          >
                            {"Mode: " + mode}
                          </div>
                        );
                      })}
                    </Columns>
                    <VerticalSpace space="small" />
                  </Fragment>
                ) : null}
                {Object.keys(filteredVarCollectionData[collectionName].variables).map(
                  (variableName) => {
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
                            width: "150px",
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
                  }
                )}
              </div>
            </Fragment>
          ))}
        </div>
      )}
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
