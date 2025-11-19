import { h } from "preact";
import { useContext } from "preact/hooks";
import styles from "../style.css";
import ConfigurationContext from "../contexts/ConfigurationContext";
import { VariableViewMode } from "../types";

interface Tab {
  id: VariableViewMode;
  label: string;
}

const tabs: Tab[] = [
  { id: "table", label: "Table" },
  { id: "css", label: "CSS" },
  { id: "json", label: "JSON" },
];

const ViewTabs = () => {
  const { variableViewMode, setVariableViewMode } =
    useContext(ConfigurationContext)!;

  return (
    <div className={styles.viewTabs}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.viewTab} ${
            variableViewMode === tab.id ? styles.viewTabActive : ""
          }`}
          onClick={() => setVariableViewMode(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ViewTabs;
