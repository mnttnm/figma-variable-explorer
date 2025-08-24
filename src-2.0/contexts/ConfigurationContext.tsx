import { createContext, JSX } from "preact";
import { useCallback, useState } from "preact/hooks";
import { ColorResolutionMode, VariableViewMode } from "../types";
import React from "preact/compat";
import { h } from "preact";

type PopoverType = "more" | "viewOptions" | "none";

interface ConfigurationContextState {
  colorResolutionMode: ColorResolutionMode;
  setColorResolutionMode: (mode: ColorResolutionMode) => void;
  variableViewMode: VariableViewMode;
  setVariableViewMode: (mode: VariableViewMode) => void;
  currentPopoverType: PopoverType;
  setCurrentPopoverType: (type: PopoverType) => void;
  showAliasLabels: boolean;
  setShowAliasLabels: (show: boolean) => void;
  columnWidths: { [key: string]: number };
  setColumnWidths: (widths: { [key: string]: number }) => void;
}

const ConfigurationContext = createContext<
  ConfigurationContextState | undefined
>(undefined);

export const ConfigurationContextProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const [currentPopoverType, setCurrentPopoverType] =
    useState<PopoverType>("none");

  const [colorResolutionMode, setColorResolutionMode] =
    useState<ColorResolutionMode>("rgba");

  const [variableViewMode, setVariableViewMode] =
    useState<VariableViewMode>("table");

  const [showAliasLabels, setShowAliasLabels] = useState<boolean>(false);

  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({});

  const showPopover = useCallback((type: PopoverType) => {
    setCurrentPopoverType(type);
  }, []);

  return (
    <ConfigurationContext.Provider
      value={{
        colorResolutionMode,
        setColorResolutionMode,
        variableViewMode,
        setVariableViewMode,
        currentPopoverType: currentPopoverType,
        setCurrentPopoverType,
        showAliasLabels,
        setShowAliasLabels,
        columnWidths,
        setColumnWidths,
      }}
    >
      {children}
    </ConfigurationContext.Provider>
  );
};

export default ConfigurationContext;
