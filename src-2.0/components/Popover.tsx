import { h, JSX } from "preact";
import styles from "../style.css";
import { useContext } from "preact/hooks";
import ConfigurationContext from "../contexts/ConfigurationContext";
import { ForwardedRef, forwardRef } from "preact/compat";
import { ColorResolutionMode } from "../types";
import React from "preact/compat";

interface PopoverProps {
  children: JSX.Element;
  popoverPosition: { top: number; right: number };
}

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  (
    { popoverPosition, children }: PopoverProps,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    return (
      <div
        className={styles.popoverContainer}
        ref={ref}
        style={{
          position: "absolute",
          top: popoverPosition.top,
          right: popoverPosition.right,
        }}
      >
        {children}
      </div>
    );
  }
);

export const ViewConfigurationPopover = () => {
  const {
    colorResolutionMode,
    setColorResolutionMode,
    variableViewMode,
    showAliasLabels,
    setShowAliasLabels,
  } = useContext(ConfigurationContext)!;

  const colorModes: { value: ColorResolutionMode; label: string; description: string }[] = [
    { value: "hex", label: "HEX", description: "#FF5733" },
    { value: "rgba", label: "RGB", description: "rgb(255, 87, 51)" },
    { value: "hsla", label: "HSL", description: "hsl(11, 100%, 60%)" },
  ];

  return (
    <div className={styles.settingsPopover}>
      <div className={styles.settingsHeader}>
        <span className={styles.settingsTitle}>Settings</span>
      </div>

      <div className={styles.settingsSection}>
        <div className={styles.settingsSectionHeader}>
          <span className={styles.settingsSectionTitle}>Color Format</span>
          <span className={styles.settingsSectionDescription}>
            How color values are displayed
          </span>
        </div>
        <div className={styles.settingsOptions}>
          {colorModes.map((mode) => (
            <label
              key={mode.value}
              className={`${styles.settingsOption} ${
                colorResolutionMode === mode.value ? styles.settingsOptionActive : ""
              }`}
            >
              <input
                type="radio"
                name="colorMode"
                value={mode.value}
                checked={colorResolutionMode === mode.value}
                onChange={() => setColorResolutionMode(mode.value)}
                className={styles.settingsRadio}
              />
              <span className={styles.settingsOptionContent}>
                <span className={styles.settingsOptionLabel}>{mode.label}</span>
                <span className={styles.settingsOptionExample}>{mode.description}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {variableViewMode === "table" && (
        <div className={styles.settingsSection}>
          <div className={styles.settingsSectionHeader}>
            <span className={styles.settingsSectionTitle}>Table Display</span>
            <span className={styles.settingsSectionDescription}>
              Options for table view
            </span>
          </div>
          <div className={styles.settingsOptions}>
            <label className={styles.settingsCheckboxOption}>
              <input
                type="checkbox"
                checked={showAliasLabels}
                onChange={(e) => setShowAliasLabels((e.target as HTMLInputElement).checked)}
                className={styles.settingsCheckbox}
              />
              <span className={styles.settingsCheckboxContent}>
                <span className={styles.settingsOptionLabel}>Show collection names</span>
                <span className={styles.settingsOptionExample}>
                  Display source collection on alias badges
                </span>
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
