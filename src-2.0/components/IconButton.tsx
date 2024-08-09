import { h, JSX } from "preact";
import { forwardRef } from "preact/compat";
import styles from "../style.css";
import React from "preact/compat";

export interface IconButtonProps {
  showBorder: boolean;
  onClick: () => void;
  children: JSX.Element;
  title?: string;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ showBorder = false, onClick, children, title }, ref) => {
    return (
      <button
        ref={ref}
        className={[
          styles["icon-button"],
          showBorder ? styles["icon-button-box"] : "",
        ].join(" ")}
        onClick={() => {
          onClick();
        }}
        title={title}
      >
        {children}
      </button>
    );
  }
);

export default IconButton;
