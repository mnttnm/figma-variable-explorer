import Header from "./components/Header";
import styles from "./style.css";
import { Variables } from "./screens";
import { VariablesContextProvider } from "./contexts/VariablesContext";
import { ConfigurationContextProvider } from "./contexts/ConfigurationContext";
import { SearchContextProvider } from "./contexts/SearchContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";
import { SupportToast } from "./components/SupportToast";
import { useLaunchTracking } from "./hooks/hooks";
import React from "preact/compat";
import { h } from "preact";

const ThemedApp = () => {
  const { theme } = useTheme();
  const { shouldShowPrompt, markAsSeen, dismissPrompt } = useLaunchTracking(3);

  const handleStar = () => {
    window.open("https://github.com/mnttnm/figma-variable-explorer", "_blank");
    markAsSeen();
  };

  const handleSponsor = () => {
    window.open("https://github.com/sponsors/mnttnm", "_blank");
    markAsSeen();
  };

  const handleRemindLater = () => {
    dismissPrompt();
  };

  const handleClose = () => {
    markAsSeen();
  };

  return (
    <div className={`${styles.pluginContainer} ${styles[`theme-${theme}`]}`}>
      <Header />
      <Variables />

      {/* Support Toast Container */}
      {shouldShowPrompt && (
        <div style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          zIndex: 10001,
          pointerEvents: 'none'
        }}>
          <SupportToast
            onClose={handleClose}
            onStar={handleStar}
            onSponsor={handleSponsor}
            onRemindLater={handleRemindLater}
          />
        </div>
      )}
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
