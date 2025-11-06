import { Fragment, h } from "preact";
import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "preact/hooks";
import styles from "../style.css";
import IconButton from "./IconButton";
import {
  SliderMenuIcon,
  CopyIcon,
  VerticalMore,
} from "./icons";
import CollectionsSelector from "./CollectionsSelector";
import ConfigurationContext from "../contexts/ConfigurationContext";
import { VariablesContext } from "../contexts/VariablesContext";
import SearchBar from "./SearchBar";
import { useEscape } from "../hooks/hooks";
import { Popover, ViewConfigurationPopover } from "./Popover";
import { CustomModal } from "./CustomModal";
import { OptionsPopover } from "./OptionsPopover";
import React from "preact/compat";
import { ExportContentType } from "../types";

export default function Header() {
  const {
    variableViewMode,
    currentPopoverType,
    setCurrentPopoverType,
  } = useContext(ConfigurationContext)!;

  const { handleCopyContent } = useContext(VariablesContext)!;

  const [exportContentType, setExportContentType] = useState<ExportContentType>("markdown");

  const iconRef = useRef<HTMLButtonElement>(null);
  const moreIconRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close the configuration box when clicking outside of it
  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (
      popoverRef.current &&
      !popoverRef.current.contains(target) &&
      iconRef.current &&
      !iconRef.current.contains(target) &&
      moreIconRef.current &&
      !moreIconRef.current.contains(target)
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

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (exportContentType: ExportContentType) => {
    setIsModalOpen(true);
    setExportContentType(exportContentType);
  };
  const closeModal = () => setIsModalOpen(false);

  return (
    <header class={styles.header}>
      <Fragment>
        <CollectionsSelector />
        {variableViewMode === "table" && (
          <div style={{ flex: 1, marginLeft: '12px', marginRight: '12px' }}>
            <SearchBar />
          </div>
        )}
        {variableViewMode !== "table" && (
          <div style={{ flex: 1 }}></div>
        )}
        <div class={styles["actions-box"]}>
          {variableViewMode !== "table" && (
            <IconButton
              showBorder
              onClick={handleCopyContent}
              title={`Copy ${variableViewMode
                .toString()
                .toUpperCase()}`}
            >
              <CopyIcon />
            </IconButton>
          )}
          <div className={styles.configurationBoxContainer}>
              <IconButton
                showBorder
                onClick={() => {
                  if (currentPopoverType === "viewOptions") {
                    setCurrentPopoverType("none");
                  } else setCurrentPopoverType("viewOptions");
                }}
                ref={iconRef}
                title="View Options"
              >
                <SliderMenuIcon />
              </IconButton>
              {currentPopoverType === "viewOptions" && (
                <Popover
                  ref={popoverRef}
                  popoverPosition={{
                    top: iconRef.current?.getBoundingClientRect()
                      .height
                      ? iconRef.current?.getBoundingClientRect()
                          .height + 5
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
                  if (currentPopoverType === "more") {
                    setCurrentPopoverType("none");
                  } else {
                    setCurrentPopoverType("more");
                  }
                }}
                title="More"
                ref={moreIconRef}
              >
                <VerticalMore />
              </IconButton>
              {currentPopoverType === "more" && (
                <Popover
                  ref={popoverRef}
                  popoverPosition={{
                    top: iconRef.current?.getBoundingClientRect()
                      .height
                      ? iconRef.current?.getBoundingClientRect()
                          .height + 5
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
        </Fragment>
    </header>
  );
}
