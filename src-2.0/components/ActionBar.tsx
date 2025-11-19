import { h } from "preact";
import { useContext, useState, useRef, useEffect } from "preact/hooks";
import styles from "../style.css";
import { VariablesContext, VariableStatus } from "../contexts/VariablesContext";
import ConfigurationContext from "../contexts/ConfigurationContext";
import { CopyIcon, ExportIcon, DownwardArrowIcon } from "./icons";
import { ExportContentType } from "../types";

const ActionBar = () => {
  const { handleCopyContent, handleExport, status, collections, activeCollection } =
    useContext(VariablesContext)!;
  const { variableViewMode } = useContext(ConfigurationContext)!;

  const [showExportMenu, setShowExportMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status !== VariableStatus.SUCCESS) {
    return null;
  }

  const currentCollectionName = collections[activeCollection!]?.name || "variables";

  const exportOptions: { label: string; type: ExportContentType; format?: "css" | "scss" }[] = [
    { label: "Export as CSS", type: "css", format: "css" },
    { label: "Export as SCSS", type: "css", format: "scss" },
    { label: "Export as JSON", type: "json" },
    { label: "Export as Markdown", type: "markdown" },
    { label: "Export as CSV", type: "csv" },
  ];

  return (
    <div className={styles.actionBar}>
      <div className={styles.actionBarLeft}>
        <span className={styles.actionBarInfo}>
          {currentCollectionName}
        </span>
      </div>
      <div className={styles.actionBarRight}>
        <div className={styles.exportMenuContainer} ref={menuRef}>
          <button
            className={styles.actionButton}
            onClick={() => setShowExportMenu(!showExportMenu)}
          >
            <ExportIcon />
            <span>Export</span>
            <DownwardArrowIcon />
          </button>
          {showExportMenu && (
            <div className={styles.exportMenu}>
              {exportOptions.map((option) => (
                <button
                  key={option.label}
                  className={styles.exportMenuItem}
                  onClick={() => {
                    handleExport(option.type, true, option.format);
                    setShowExportMenu(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {variableViewMode !== "table" && (
          <button className={styles.actionButton} onClick={handleCopyContent}>
            <CopyIcon />
            <span>Copy {variableViewMode.toUpperCase()}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ActionBar;
