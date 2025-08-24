import Header from "./components/Header";
import styles from "./style.css";
import { Variables } from "./screens";
import { VariablesContextProvider } from "./contexts/VariablesContext";
import { ConfigurationContextProvider } from "./contexts/ConfigurationContext";
import { SearchContextProvider } from "./contexts/SearchContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";
import React from "preact/compat";
import { h } from "preact";

const ThemedApp = () => {
  const { theme } = useTheme();

  return (
    <div className={`${styles.pluginContainer} ${styles[`theme-${theme}`]}`}>
      <Header />
      <Variables />
    </div>
  );
};

const PluginUI = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <SearchContextProvider>
          <ConfigurationContextProvider>
            <VariablesContextProvider>
              <ThemedApp />
            </VariablesContextProvider>
          </ConfigurationContextProvider>
        </SearchContextProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default PluginUI;
