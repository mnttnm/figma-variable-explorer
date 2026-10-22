import { h } from "preact";
import React from "preact/compat";
import { useEffect, useState } from "preact/hooks";
import { on } from "@create-figma-plugin/utilities";
import copy from "copy-to-clipboard";
import { createFileFromContent } from "../utils";

// Only rendered in debug builds (`npm run build:debug`)
export const DebugReportBar = () => {
  const [report, setReport] = useState<string | null>(null);
  const [issueCount, setIssueCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return on("DEBUG_REPORT", (reportText: string, count: number) => {
      setReport(reportText);
      setIssueCount(count);
    });
  }, []);

  const buttonStyle = {
    marginLeft: "8px",
    padding: "2px 8px",
    border: "1px solid #7a5c00",
    borderRadius: "4px",
    background: "#fff",
    color: "#3d2e00",
    cursor: "pointer",
    fontSize: "11px",
  };

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10002,
        display: "flex",
        alignItems: "center",
        padding: "6px 12px",
        background: "#ffe08a",
        color: "#3d2e00",
        fontSize: "11px",
        borderTop: "1px solid #7a5c00",
      }}
    >
      <strong>DEBUG BUILD</strong>
      <span style={{ marginLeft: "8px", flex: 1 }}>
        {report === null
          ? "Scanning variables..."
          : `${issueCount} issue(s) found. Please send the report to the plugin author.`}
      </span>
      {report !== null && (
        <span>
          <button
            style={buttonStyle}
            onClick={() => {
              copy(report);
              setCopied(true);
            }}
          >
            {copied ? "Copied" : "Copy report"}
          </button>
          <button
            style={buttonStyle}
            onClick={() =>
              createFileFromContent("variable-explorer-debug-report.txt", report)
            }
          >
            Download report
          </button>
        </span>
      )}
    </div>
  );
};
