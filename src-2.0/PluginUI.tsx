import Header from "./components/Header";
import styles from "./style.css";
import { Variables } from "./screens";
import { VariablesContextProvider } from "./contexts/VariablesContext";
import { ConfigurationContextProvider } from "./contexts/ConfigurationContext";
import { SearchContextProvider } from "./contexts/SearchContext";
import React from "preact/compat";
import { h } from "preact";

const PluginUI = () => {
  return (
    <SearchContextProvider>
      <ConfigurationContextProvider>
        <VariablesContextProvider>
          <div className={styles.pluginContainer}>
            <Header />
            <Variables />
          </div>
        </VariablesContextProvider>
      </ConfigurationContextProvider>
    </SearchContextProvider>
  );
};

export default PluginUI;
