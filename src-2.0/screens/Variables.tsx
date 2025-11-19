import { h } from "preact";
import styles from "../style.css";
import { useContext, useMemo, useRef, useState, useCallback } from "preact/hooks";
import {
  VariableContextData,
  VariablesContext,
  VariableStatus,
} from "../contexts/VariablesContext";
import { ValueRenderer } from "../components/ValueRenderer";
import { LoadingSpinner } from "../components/LoadingSpinner";
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
import { WarningIcon, EmptyIcon, SearchIconLarge } from "../components/icons";
import React from "preact/compat";

export default function Variables() {
  const { data, status, error, activeCollection, collections, jsonData, cssData } =
    useContext<VariableContextData>(VariablesContext)!;

  const { variableViewMode } = useContext(ConfigurationContext)!;

  if (status === VariableStatus.LOADING) {
    return <LoadingSpinner />;
  }

  if (status === VariableStatus.ERROR) {
    return (
      <div className={`${styles["error-state"]} ${styles.fadeIn}`}>
        <div className={styles["error-state-icon"]}>
          <WarningIcon />
        </div>
        <h3 className={styles["error-state-title"]}>Error Loading Variables</h3>
        <p className={styles["error-state-message"]}>{error}</p>
      </div>
    );
  }

  if (!data || !cssData || !jsonData || (data && Object.keys(data).length === 0)) {
    return (
      <div className={`${styles["empty-state"]} ${styles.fadeIn}`}>
        <div className={styles["empty-state-icon"]}>
          <EmptyIcon />
        </div>
        <h3 className={styles["empty-state-title"]}>No Variables Found</h3>
        <p className={styles["empty-state-message"]}>
          This file doesn't contain any variables. Create some variables in Figma to get started.
        </p>
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

const ResizeHandle = ({ 
  onMouseDown, 
  columnIndex 
}: { 
  onMouseDown: (e: any, index: number) => void;
  columnIndex: number;
}) => {
  return (
    <div
      className={styles.resizeHandle}
      onMouseDown={(e) => onMouseDown(e, columnIndex)}
    />
  );
};

const TabularView = (collectionData: CollectionVariables) => {
  if (!collectionData) return null;

  const { columnWidths, setColumnWidths } = useContext(ConfigurationContext)!;
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<number | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

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

  // Calculate empty columns to fill remaining space
  const PLUGIN_WIDTH = 900;
  const calculateEmptyColumns = () => {
    const totalColumnsWidth = headers.reduce((sum, header, index) => {
      return sum + (columnWidths[header] || (index === 0 ? 280 : 240));
    }, 0);

    const remainingWidth = PLUGIN_WIDTH - totalColumnsWidth;
    const emptyColumns: number[] = [];

    if (remainingWidth > 100) {
      // Add empty columns to fill the space
      let remaining = remainingWidth;
      while (remaining > 100) {
        const colWidth = Math.min(240, remaining);
        emptyColumns.push(colWidth);
        remaining -= colWidth;
      }
      // Add any small remaining width as a final column
      if (remaining > 0) {
        emptyColumns.push(remaining);
      }
    }

    return emptyColumns;
  };

  const emptyColumns = calculateEmptyColumns();

  const handleMouseDown = useCallback((e: any, columnIndex: number) => {
    e.preventDefault();
    setIsResizing(true);
    setResizingColumn(columnIndex);
    document.body.style.cursor = 'col-resize';

    const startX = e.clientX;
    const header = headers[columnIndex];
    const startWidth = columnWidths[header] || (columnIndex === 0 ? 280 : 240);

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX;
      const newWidth = Math.max(100, startWidth + diff); // Minimum width of 100px
      
      setColumnWidths({
        ...columnWidths,
        [header]: newWidth
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizingColumn(null);
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [columnWidths, setColumnWidths, headers]);

  // Show empty state if search returns no results
  if (rows.length === 0 && currentSearchTerm) {
    return (
      <main className={`${styles.tableContainer} ${styles.fadeIn}`}>
        <div className={styles["empty-state"]}>
          <div className={styles["empty-state-icon"]}>
            <SearchIconLarge />
          </div>
          <h3 className={styles["empty-state-title"]}>No Results Found</h3>
          <p className={styles["empty-state-message"]}>
            No variables match "{currentSearchTerm}". Try a different search term.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className={`${styles.tableContainer} ${styles.fadeIn}`}>
      <Tooltip
        id="alias-tooltip"
        className={[styles.tooltip, styles.aliasTooltip].join(" ")}
        classNameArrow={[styles.tooltip, styles.tooltipArrow].join(" ")}
      />
      <table ref={tableRef}>
        <thead className={styles.tableHead}>
          <tr className={styles.tableHeaderContainer}>
            {headers.map((header, index) => (
              <th
                key={header}
                className={styles.tableHeaderItemContainer}
                style={{
                  width: `${columnWidths[header] || (index === 0 ? 280 : 240)}px`,
                  ...(index !== 0 && { position: 'relative' })
                }}
              >
                <span>{header}</span>
                <ResizeHandle
                  onMouseDown={handleMouseDown}
                  columnIndex={index}
                />
              </th>
            ))}
            {/* Empty columns to fill remaining space */}
            {emptyColumns.map((width, index) => (
              <th
                key={`empty-${index}`}
                className={styles.tableHeaderItemContainer}
                style={{ width: `${width}px` }}
              >
                <span></span>
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
                style={{ width: `${columnWidths["Name"] || 280}px` }}
              >
                <span title={varName}>{varName}</span>
              </td>
              {values.map((varValue, valueIndex) => (
                <td
                  key={`${headers[valueIndex + 1]}::${varName}`}
                  className={styles.tableValueItemContainer}
                  style={{
                    width: `${columnWidths[headers[valueIndex + 1]] || 240}px`
                  }}
                >
                  <ValueRenderer
                    varValueInfo={varValue[1]}
                    showCollection={true}
                    type={type}
                    mode={varValue[0]}
                  />
                </td>
              ))}
              {/* Empty cells to fill remaining space */}
              {emptyColumns.map((width, index) => (
                <td
                  key={`empty-${index}`}
                  className={styles.tableValueItemContainer}
                  style={{ width: `${width}px` }}
                >
                  <span></span>
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
  const { currentSearchTerm } = useContext(
    SearchContext
  ) as SearchContextState;

  const filteredData = useMemo(() => {
    if (!currentSearchTerm || !data) return data;

    const lines = data.split('\n');
    const lowerSearchTerm = currentSearchTerm.toLowerCase();

    const filteredLines = lines.filter((line: string) =>
      line.toLowerCase().includes(lowerSearchTerm)
    );

    return filteredLines.join('\n');
  }, [data, currentSearchTerm]);

  // Show empty state if search returns no results
  if (currentSearchTerm && filteredData === '') {
    return (
      <div className={`${styles.cssViewContainer} ${styles.fadeIn}`}>
        <div className={styles["empty-state"]}>
          <div className={styles["empty-state-icon"]}>
            <SearchIconLarge />
          </div>
          <h3 className={styles["empty-state-title"]}>No Results Found</h3>
          <p className={styles["empty-state-message"]}>
            No CSS variables match "{currentSearchTerm}". Try a different search term.
          </p>
        </div>
      </div>
    );
  }

  return <pre className={`${styles.cssViewContainer} ${styles.fadeIn}`}>{filteredData}</pre>;
};

const JSONView = (collectionData: JSONData) => {
  const { currentSearchTerm } = useContext(
    SearchContext
  ) as SearchContextState;

  const filteredData = useMemo(() => {
    if (!currentSearchTerm || !collectionData) return collectionData;

    const lowerSearchTerm = currentSearchTerm.toLowerCase();

    // Filter the variables object based on search term
    if (collectionData.variables) {
      const filteredVariables = Object.fromEntries(
        Object.entries(collectionData.variables).filter(([key, value]) => {
          // Search in key name
          if (key.toLowerCase().includes(lowerSearchTerm)) return true;
          // Search in stringified value
          if (JSON.stringify(value).toLowerCase().includes(lowerSearchTerm)) return true;
          return false;
        })
      );

      return {
        ...collectionData,
        variables: filteredVariables
      };
    }

    return collectionData;
  }, [collectionData, currentSearchTerm]);

  // Show empty state if search returns no results
  if (currentSearchTerm && filteredData?.variables && Object.keys(filteredData.variables).length === 0) {
    return (
      <div className={`${styles.jsonViewContainer} ${styles.fadeIn}`}>
        <div className={styles["empty-state"]}>
          <div className={styles["empty-state-icon"]}>
            <SearchIconLarge />
          </div>
          <h3 className={styles["empty-state-title"]}>No Results Found</h3>
          <p className={styles["empty-state-message"]}>
            No JSON variables match "{currentSearchTerm}". Try a different search term.
          </p>
        </div>
      </div>
    );
  }

  return (
    <pre className={`${styles.jsonViewContainer} ${styles.fadeIn}`}>
      {JSON.stringify(filteredData, null, 2)}
    </pre>
  );
};
