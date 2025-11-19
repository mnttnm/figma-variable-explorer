import { h } from "preact";
import { useContext } from "preact/hooks";
import styles from "../style.css";
import ConfigurationContext from "../contexts/ConfigurationContext";
import { useAnalytics } from "../contexts/AnalyticsContext";
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
  const { trackEvent } = useAnalytics();

  const handleTabClick = (tabId: VariableViewMode) => {
    if (tabId !== variableViewMode) {
      trackEvent('view_switched', { from: variableViewMode, to: tabId });
    }
    setVariableViewMode(tabId);
  };

  return (
    <div className={styles.viewTabs}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.viewTab} ${
            variableViewMode === tab.id ? styles.viewTabActive : ""
          }`}
          onClick={() => handleTabClick(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ViewTabs;
