import { h } from "preact";
import styles from "../style.css";
import { useContext, useMemo } from "preact/hooks";
import {
  VariableContextData,
  VariablesContext,
  VariableStatus,
} from "../contexts/VariablesContext";
import { ValueRenderer } from "../components/ValueRenderer";
import { Tooltip } from "react-tooltip";
import {
  AliasValue,
  CollectionVariables,
  ColorValue,
  JSONData,
} from "../types";
import {
  SearchContext,
  SearchContextState,
} from "../contexts/SearchContext";
import ConfigurationContext from "../contexts/ConfigurationContext";
import React from "preact/compat";

export default function Variables() {
  const { data, status, error, activeCollection, collections, jsonData, cssData } =
    useContext<VariableContextData>(VariablesContext)!;

  const { variableViewMode } = useContext(ConfigurationContext)!;

  if (status === VariableStatus.LOADING) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  if (status === VariableStatus.ERROR) {
    return (
      <div>
        <p>{error}</p>
      </div>
    );
  }

  if (!data || !cssData || !jsonData || (data && Object.keys(data).length === 0)) {
    return (
      <div>
        <p>No variables found</p>
      </div>
    );
  }



  if (variableViewMode === "table") {
    const activeCollectionData =
      data[collections[activeCollection!].id];
    return TabularView(activeCollectionData);
  } else if (variableViewMode === "css") {
    const activeCollectionData =
      cssData[collections[activeCollection!].id];
    return CSSView(activeCollectionData);
  } else if (variableViewMode === "json") {
    const activeCollectionData =
      jsonData[collections[activeCollection!].id];
    return JSONView(activeCollectionData);
  } else {
    return null;
  }
}

const TabularView = (collectionData: CollectionVariables) => {
  if (!collectionData) return null;

  const { currentSearchTerm } = useContext(
    SearchContext
  ) as SearchContextState;

  const filteredDataForTables = useMemo(() => {
    if (currentSearchTerm) {
      return {
        ...collectionData,
        variables: Object.fromEntries(
          Object.entries(collectionData.variables).filter(
            ([varId, varValue]) => {
              const varName = varValue.name;
              const lowerCaseSearchTerm =
                currentSearchTerm.toLowerCase();
              if (lowerCaseSearchTerm === "") {
                return true;
              }
              const searchInVarName = varName
                .toLowerCase()
                .includes(lowerCaseSearchTerm);

              if (searchInVarName) return true;

              const variableValues = Object.values(varValue.values);

              for (const variableValue of variableValues) {
                if (variableValue.isAlias) {
                  return (
                    variableValue.value as AliasValue
                  ).aliasLabel
                    .toLowerCase()
                    .includes(lowerCaseSearchTerm);
                }

                if (typeof variableValue.value === "string") {
                  return variableValue.value
                    .toLowerCase()
                    .includes(lowerCaseSearchTerm);
                }
                return (variableValue.value as ColorValue).hexValue
                  .split(",")[0]
                  .toLowerCase()
                  .includes(lowerCaseSearchTerm);
              }

              return false;
            }
          )
        ),
      };
    }

    return collectionData;
  }, [currentSearchTerm, collectionData]);

  const generateTabularDataForCollection = (
    collectionData: CollectionVariables
  ) => {
    const headers = ["Name", ...collectionData.modes];
    const rows: Array<any[]> = [];
    for (const [variable, variableValue] of Object.entries(
      collectionData.variables
    )) {
      let rowEntry: any[] = [variableValue.name, variableValue.type];

      for (const mode of collectionData.modes) {
        const modeValue = variableValue.values[mode];
        rowEntry.push([mode, modeValue]);
      }

      rows.push(rowEntry);
    }

    return { headers, rows };
  };

  const { headers, rows } = generateTabularDataForCollection(
    filteredDataForTables
  );

  return (
    <main className={styles.tableContainer}>
      <Tooltip
        id="alias-tooltip"
        className={[styles.tooltip, styles.aliasTooltip].join(" ")}
        classNameArrow={[styles.tooltip, styles.tooltipArrow].join()}
      />
      <table>
        <thead className={styles.tableHead}>
          <tr className={styles.tableHeaderContainer}>
            {headers.map((header) => (
              <th
                key={header}
                className={styles.tableHeaderItemContainer}
              >
                <span>{header}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([varName, type, ...values], i) => (
            <tr key={i} className={styles.tableRowContainer}>
              <td
                key={varName}
                className={styles.tableValueItemContainer}
              >
                <span title={varName}>{varName}</span>
              </td>
              {values.map((varValue) => (
                <td
                  key={Math.random()}
                  className={styles.tableValueItemContainer}
                >
                  <ValueRenderer
                    varValueInfo={varValue[1]}
                    showCollection={true}
                    type={type}
                    mode={varValue[0]}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
};

const CSSView = (data: any) => {
  return <pre className={styles.cssViewContainer}>{data}</pre>;
};

const JSONView = (collectionData: JSONData) => {
  return (
    <pre className={styles.jsonViewContainer}>
      {JSON.stringify(collectionData, null, 2)}
    </pre>
  );
};
