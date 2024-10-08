import { Fragment, h } from "preact";
import { createPortal, forwardRef } from "preact/compat";
import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "preact/hooks";
import copy from "copy-to-clipboard";
import {
  AliasValue,
  ColorValue,
  InternalVariable,
  ValueRendererProps,
} from "../types";
import styles from "../style.css";

import { CopyIcon } from "./icons";
import { DownwardArrowIcon } from "./icons/DownwardArrowIcon";
import ConfigurationContext from "../contexts/ConfigurationContext";
import React from "preact/compat";

const OFFSET = 4; // Offset in pixels

const ResolvedAliasHeader = ({
  aliasLabel,
  title = "",
}: {
  aliasLabel: string;
  title?: string;
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
      onClick={() => copy(aliasLabel)}
      title={title}
    >
      <div className={styles.resolvedAliasLabel}>
        {aliasLabel}
        <CopyIcon />
      </div>
      <DownwardArrowIcon />
    </div>
  );
};

interface AliasPopoverProps {
  value: AliasValue;
  resolvedValues: InternalVariable[];
  popoverPosition: { top: number; left: number };
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
}

const AliasResolutionPopover = forwardRef<
  HTMLElement,
  AliasPopoverProps
>(
  (
    {
      value,
      resolvedValues,
      popoverPosition,
      handleMouseEnter,
      handleMouseLeave,
    },
    ref
  ) => {
    return createPortal(
      <section
        ref={ref}
        className={styles.aliasResolutionContainer}
        style={{
          position: "fixed",
          top: popoverPosition.top,
          left: popoverPosition.left,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <ResolvedAliasHeader
          aliasLabel={value.aliasLabel}
          title={`Collection: ${value.collection}`}
        />
        <div>
          {resolvedValues.map((resolvedVariable, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "var(--sds-size-space-100)",
              }}
            >
              {Object.entries(resolvedVariable.values).map(
                ([mode, v], index) => (
                  <div key={index}>
                    {v.isAlias ? (
                      <ResolvedAliasHeader
                        aliasLabel={
                          (v.value as AliasValue).aliasLabel
                        }
                        title={`Collection: ${v.collection}`}
                      />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-start",
                          gap: "0px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                            justifyContent: "center",
                            gap: "var(--sds-size-space-150)",
                          }}
                          onClick={() => {
                            resolvedVariable.type === "COLOR"
                              ? copy(
                                  (
                                    v.value as ColorValue
                                  ).hexValue.split(",")[0]
                                )
                              : copy(v.value as string);
                          }}
                        >
                          {resolvedVariable.type === "COLOR" ? (
                            <ColorValueRenderer
                              value={v.value as ColorValue}
                            />
                          ) : (
                            <Fragment>
                              {resolvedValues.length > 1 && (
                                <p>{mode}</p>
                              )}
                              <p className={styles.aliasFinalValue}>
                                {v.value}
                              </p>
                            </Fragment>
                          )}
                          <CopyIcon />
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      </section>,
      document.body
    );
  }
);

const AliasValueRenderer = ({
  value,
  showCollection,
  resolvedValues,
  mode,
  title = "",
}: {
  value: AliasValue;
  showCollection: boolean;
  resolvedValues: InternalVariable[];
  mode: string;
  title?: string;
}) => {
  const [showPopover, setShowPopover] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({
    top: 0,
    left: 0,
  });

  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLElement>(null);
  let timeoutRef = useRef<number | null>(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !popoverRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = triggerRect.top - popoverRect.height / 2;
    let left = triggerRect.right + OFFSET;

    // Check if popover goes beyond bottom edge
    if (top + popoverRect.height > viewportHeight) {
      top = triggerRect.top - popoverRect.height - OFFSET;
      left = triggerRect.left;
    }

    // Check if popover goes beyond right edge
    if (left + popoverRect.width > viewportWidth) {
      left = triggerRect.right - popoverRect.width;
      top = triggerRect.top - popoverRect.height - OFFSET;
    }

    // Ensure popover doesn't go beyond left edge
    left = Math.max(OFFSET, left);

    // Ensure popover doesn't go beyond top edge
    top = Math.max(OFFSET, top);

    return { top, left };
  }, []);

  const updatePopoverPosition = useCallback(() => {
    const newPosition = calculatePosition();
    if (newPosition) {
      setPopoverPosition(newPosition);
    }
  }, [calculatePosition]);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowPopover(true);
    updatePopoverPosition();
  }, [updatePopoverPosition]);

  // todo: This delay is causing weird effect when user quickly hover over multiple values
  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowPopover(false);
    }, 200); // 200ms delay before hiding the popover, this allows user to hover on the popover and it will stay visible
  }, []);

  useEffect(() => {
    if (showPopover) {
      updatePopoverPosition();
      window.addEventListener("resize", updatePopoverPosition);
      window.addEventListener("scroll", updatePopoverPosition);
    }

    return () => {
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition);
    };
  }, [showPopover]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={triggerRef}
      className={styles.aliasValueContainer}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={title}
    >
      <p className={styles.aliasValue}>
        {`${showCollection ? value.collection + ":" : ""}${
          value.aliasLabel
        }`}
      </p>
      {showPopover && (
        <AliasResolutionPopover
          value={value}
          resolvedValues={resolvedValues}
          handleMouseEnter={handleMouseEnter}
          handleMouseLeave={handleMouseLeave}
          popoverPosition={popoverPosition}
          ref={popoverRef}
        />
      )}
    </div>
  );
};
const ColorValueRenderer = ({
  value,
  title = "",
}: {
  value: ColorValue;
  title?: string;
}) => {
  const { colorResolutionMode } = useContext(ConfigurationContext)!;
  let activeValue = value.rgbaValue;
  switch (colorResolutionMode) {
    case "rgba":
      activeValue = value.rgbaValue;
      break;
    case "hsla":
      activeValue = value.hslaValue;
      break;
    case "hex":
      activeValue = value.hexValue;
      break;
    default:
      break;
  }

  return (
    <div className={styles.colorValueContainer} title={title}>
      <div
        className={styles.colorTileValue}
        style={{
          backgroundColor: value.rgbaValue,
        }}
        onClick={() => copy(activeValue)}
        title={"Click to Copy"}
      ></div>
      <p className={styles.stringValue}>{activeValue}</p>
    </div>
  );
};

export const ValueRenderer = ({
  varValueInfo,
  type,
  mode,
  title = "",
}: ValueRendererProps) => {
  return (
    <Fragment>
      {varValueInfo.isAlias ? (
        <AliasValueRenderer
          value={varValueInfo.value as AliasValue}
          showCollection={false}
          resolvedValues={varValueInfo.aliasResolvedValues ?? []}
          mode={mode}
          title={title}
        />
      ) : type === "COLOR" ? (
        <ColorValueRenderer
          value={varValueInfo.value as ColorValue}
          title={title}
        />
      ) : (
        <p className={styles.stringValue} title={title}>
          {varValueInfo.value}
        </p>
      )}
    </Fragment>
  );
};
