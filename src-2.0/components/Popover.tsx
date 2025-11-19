import { h, JSX } from "preact";
import styles from "../style.css";
import { useContext } from "preact/hooks";
import ConfigurationContext from "../contexts/ConfigurationContext";
import {
  RadioButtons,
  RadioButtonsOption,
  Text,
  Checkbox,
} from "@create-figma-plugin/ui";
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

  const colorModeOptions: Array<RadioButtonsOption> = [
    { children: <Text>HSL</Text>, value: "hsla" },
    { children: <Text>RGB</Text>, value: "rgba" },
    { children: <Text>HEX</Text>, value: "hex" },
  ];

  const handleColorModeChange = (
    event: JSX.TargetedEvent<HTMLInputElement, Event>
  ) => {
    const newColorMode = event.currentTarget.value;
    setColorResolutionMode(newColorMode as ColorResolutionMode);
  };

  const handleAliasLabelsChange = (
    event: JSX.TargetedEvent<HTMLInputElement, Event>
  ) => {
    setShowAliasLabels(event.currentTarget.checked);
  };

  return (
    <form className={styles.configurationForm}>
      <fieldset name="colorMode">
        <legend>Color Mode</legend>
        <RadioButtons
          onChange={handleColorModeChange}
          options={colorModeOptions}
          value={colorResolutionMode}
        />
      </fieldset>
      {variableViewMode === "table" && (
        <fieldset name="aliasOptions">
          <legend>Table Options</legend>
          <Checkbox
            onChange={handleAliasLabelsChange}
            value={showAliasLabels}
          >
            <Text>Show alias collection names</Text>
          </Checkbox>
        </fieldset>
      )}
    </form>
  );
};
