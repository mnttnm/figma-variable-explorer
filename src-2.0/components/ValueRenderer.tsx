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
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import React from "preact/compat";

const OFFSET = 4; // Offset in pixels

const ResolvedAliasHeader = ({
  aliasLabel,
  title = "",
}: {
  aliasLabel: string;
  title?: string;
}) => {
  const { addToast } = useToast();

  const handleCopy = () => {
    if (copy(aliasLabel)) {
      addToast(`Copied "${aliasLabel}"`, 'success');
    } else {
      addToast('Failed to copy', 'error');
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
      onClick={handleCopy}
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
    const { theme } = useTheme();
    const { addToast } = useToast();

    const handleValueCopy = (value: any, isColor: boolean, format?: 'hex' | 'rgba' | 'hsl' | 'css-var') => {
      let valueToCopy: string;
      if (isColor) {
        const colorValue = value as ColorValue;
        switch (format) {
          case 'rgba':
            valueToCopy = colorValue.rgbaValue;
            break;
          case 'hsl':
            valueToCopy = colorValue.hslaValue;
            break;
          case 'css-var':
            // Generate CSS variable format (simplified variable name)
            const cssVarName = 'color-var'; // Fallback name for colors without alias
            valueToCopy = `var(--${cssVarName})`;
            break;
          case 'hex':
          default:
            valueToCopy = colorValue.hexValue.split(",")[0];
            break;
        }
      } else {
        if (format === 'css-var' && typeof value === 'string') {
          const cssVarName = value.replace(/\s+/g, '-').replace(/\//g, '-').toLowerCase();
          valueToCopy = `var(--${cssVarName})`;
        } else {
          valueToCopy = value as string;
        }
      }
      
      if (copy(valueToCopy)) {
        addToast(`Copied "${valueToCopy}"`, 'success');
      } else {
        addToast('Failed to copy', 'error');
      }
    };
    
    return createPortal(
      <section
        ref={ref}
        className={`${styles.aliasResolutionContainer} ${styles[`theme-${theme}`]}`}
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
                          onClick={() => handleValueCopy(v.value, resolvedVariable.type === "COLOR")}
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
    
    // Define safe margins from viewport edges
    const SAFE_MARGIN = 16;

    // Try different positioning strategies in priority order
    const strategies = [
      // Right side (preferred)
      {
        top: triggerRect.top + (triggerRect.height - popoverRect.height) / 2,
        left: triggerRect.right + OFFSET,
      },
      // Left side
      {
        top: triggerRect.top + (triggerRect.height - popoverRect.height) / 2,
        left: triggerRect.left - popoverRect.width - OFFSET,
      },
      // Above
      {
        top: triggerRect.top - popoverRect.height - OFFSET,
        left: triggerRect.left + (triggerRect.width - popoverRect.width) / 2,
      },
      // Below
      {
        top: triggerRect.bottom + OFFSET,
        left: triggerRect.left + (triggerRect.width - popoverRect.width) / 2,
      },
    ];

    // Find the first strategy that fits within viewport
    for (const strategy of strategies) {
      const { top, left } = strategy;
      
      const fitsHorizontally = 
        left >= SAFE_MARGIN && 
        left + popoverRect.width <= viewportWidth - SAFE_MARGIN;
      
      const fitsVertically = 
        top >= SAFE_MARGIN && 
        top + popoverRect.height <= viewportHeight - SAFE_MARGIN;

      if (fitsHorizontally && fitsVertically) {
        return { top, left };
      }
    }

    // Fallback: Position within viewport bounds with smart adjustments
    let top = Math.max(SAFE_MARGIN, Math.min(
      triggerRect.top + (triggerRect.height - popoverRect.height) / 2,
      viewportHeight - popoverRect.height - SAFE_MARGIN
    ));
    
    let left = Math.max(SAFE_MARGIN, Math.min(
      triggerRect.right + OFFSET,
      viewportWidth - popoverRect.width - SAFE_MARGIN
    ));

    // If still overlapping with trigger, try the other side
    if (left < triggerRect.right && left + popoverRect.width > triggerRect.left) {
      const leftSide = triggerRect.left - popoverRect.width - OFFSET;
      if (leftSide >= SAFE_MARGIN) {
        left = leftSide;
      }
    }

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

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Reduced delay to minimize flickering while still allowing popover interaction
    timeoutRef.current = setTimeout(() => {
      setShowPopover(false);
    }, 150);
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
  const { addToast } = useToast();
  const [showCopyOptions, setShowCopyOptions] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleCopy = (format?: 'hex' | 'rgba' | 'hsl') => {
    let valueToCopy: string;
    switch (format) {
      case 'rgba':
        valueToCopy = value.rgbaValue;
        break;
      case 'hsl':
        valueToCopy = value.hslaValue;
        break;
      case 'hex':
      default:
        valueToCopy = value.hexValue;
        break;
    }
    
    if (copy(valueToCopy)) {
      addToast(`Copied "${valueToCopy}"`, 'success');
    } else {
      addToast('Failed to copy', 'error');
    }
    setShowCopyOptions(false);
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowCopyOptions(!showCopyOptions);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCopyOptions(false);
      }
    };

    if (showCopyOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCopyOptions]);

  return (
    <div className={styles.colorValueContainer} title={title} style={{ position: 'relative' }}>
      <div
        className={styles.colorTileValue}
        style={{
          backgroundColor: value.rgbaValue,
        }}
        onClick={() => handleCopy()}
        onContextMenu={handleRightClick}
        title="Click to Copy • Right-click for format options"
      ></div>
      <p className={styles.stringValue}>{activeValue}</p>
      
      {showCopyOptions && (
        <div 
          ref={menuRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            backgroundColor: 'var(--figma-color-bg)',
            border: '1px solid var(--figma-color-border)',
            borderRadius: '4px',
            padding: '8px',
            zIndex: 1000,
            minWidth: '120px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Copy as:</div>
          <div 
            style={{ 
              padding: '4px 8px', 
              cursor: 'pointer', 
              borderRadius: '2px',
              fontSize: '12px'
            }}
            onClick={() => handleCopy('hex')}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--figma-color-bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            HEX: {value.hexValue}
          </div>
          <div 
            style={{ 
              padding: '4px 8px', 
              cursor: 'pointer', 
              borderRadius: '2px',
              fontSize: '12px'
            }}
            onClick={() => handleCopy('rgba')}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--figma-color-bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            RGBA: {value.rgbaValue}
          </div>
          <div 
            style={{ 
              padding: '4px 8px', 
              cursor: 'pointer', 
              borderRadius: '2px',
              fontSize: '12px'
            }}
            onClick={() => handleCopy('hsl')}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--figma-color-bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            HSL: {value.hslaValue}
          </div>
        </div>
      )}
    </div>
  );
};

export const ValueRenderer = ({
  varValueInfo,
  type,
  mode,
  title = "",
}: ValueRendererProps) => {
  const { showAliasLabels } = useContext(ConfigurationContext)!;
  
  return (
    <Fragment>
      {varValueInfo.isAlias ? (
        <AliasValueRenderer
          value={varValueInfo.value as AliasValue}
          showCollection={showAliasLabels}
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
