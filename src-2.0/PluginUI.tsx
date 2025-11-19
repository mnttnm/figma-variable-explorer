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
import Sidebar from "./components/Sidebar";
import ViewTabs from "./components/ViewTabs";
import ActionBar from "./components/ActionBar";
import SearchBar from "./components/SearchBar";
import IconButton from "./components/IconButton";
import { SliderMenuIcon, VerticalMore } from "./components/icons";
import { useContext, useRef, useState, useCallback, useEffect } from "preact/hooks";
import ConfigurationContext from "./contexts/ConfigurationContext";
import { Popover, ViewConfigurationPopover } from "./components/Popover";
import { OptionsPopover } from "./components/OptionsPopover";
import { CustomModal } from "./components/CustomModal";
import { useEscape } from "./hooks/hooks";
import { ExportContentType } from "./types";

const MainContent = () => {
  const {
    variableViewMode,
    currentPopoverType,
    setCurrentPopoverType,
  } = useContext(ConfigurationContext)!;

  const [exportContentType, setExportContentType] = useState<ExportContentType>("markdown");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const settingsRef = useRef<HTMLButtonElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (
      popoverRef.current &&
      !popoverRef.current.contains(target) &&
      settingsRef.current &&
      !settingsRef.current.contains(target) &&
      moreRef.current &&
      !moreRef.current.contains(target)
    ) {
      setCurrentPopoverType("none");
    }
  }, []);

  useEscape(() => {
    if (currentPopoverType !== "none") {
      setCurrentPopoverType("none");
    }
  });

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  const openModal = (exportContentType: ExportContentType) => {
    setIsModalOpen(true);
    setExportContentType(exportContentType);
  };
  const closeModal = () => setIsModalOpen(false);

  return (
    <main className={styles.mainContent}>
      {/* Top Bar with Search and Controls */}
      <header className={styles.contentHeader}>
        <div className={styles.searchWrapper}>
          <SearchBar />
        </div>
        <div className={styles.headerActions}>
          <div className={styles.configurationBoxContainer}>
            <IconButton
              showBorder
              onClick={() => {
                setCurrentPopoverType(
                  currentPopoverType === "viewOptions" ? "none" : "viewOptions"
                );
              }}
              ref={settingsRef}
              title="Settings"
            >
              <SliderMenuIcon />
            </IconButton>
            {currentPopoverType === "viewOptions" && (
              <Popover
                ref={popoverRef}
                popoverPosition={{
                  top: settingsRef.current?.getBoundingClientRect().height
                    ? settingsRef.current.getBoundingClientRect().height + 5
                    : 0,
                  right: 0,
                }}
              >
                <ViewConfigurationPopover />
              </Popover>
            )}
          </div>
          <div className={styles.configurationBoxContainer}>
            <IconButton
              showBorder
              onClick={() => {
                setCurrentPopoverType(
                  currentPopoverType === "more" ? "none" : "more"
                );
              }}
              ref={moreRef}
              title="More"
            >
              <VerticalMore />
            </IconButton>
            {currentPopoverType === "more" && (
              <Popover
                ref={popoverRef}
                popoverPosition={{
                  top: moreRef.current?.getBoundingClientRect().height
                    ? moreRef.current.getBoundingClientRect().height + 5
                    : 0,
                  right: 0,
                }}
              >
                <OptionsPopover openModal={openModal} />
              </Popover>
            )}
            <CustomModal
              showModal={isModalOpen}
              onClose={closeModal}
              ref={modalRef}
              exportContentType={exportContentType}
            />
          </div>
        </div>
      </header>

      {/* View Mode Tabs */}
      <ViewTabs />

      {/* Main Variables Display */}
      <div className={styles.contentArea}>
        <Variables />
      </div>

      {/* Bottom Action Bar */}
      <ActionBar />
    </main>
  );
};

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
      <div className={styles.appLayout}>
        <Sidebar />
        <MainContent />
      </div>

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
