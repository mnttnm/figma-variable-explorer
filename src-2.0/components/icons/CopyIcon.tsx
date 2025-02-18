import { h } from "preact";
import styles from "../../style.css";
import React from "preact/compat";

export const CopyIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M2.8335 9.5H2.16683C1.81321 9.5 1.47407 9.35952 1.22402 9.10948C0.973972 8.85943 0.833496 8.52029 0.833496 8.16667V2.16667C0.833496 1.81305 0.973972 1.47391 1.22402 1.22386C1.47407 0.97381 1.81321 0.833334 2.16683 0.833334H8.16683C8.52045 0.833334 8.85959 0.97381 9.10964 1.22386C9.35969 1.47391 9.50016 1.81305 9.50016 2.16667V2.83333M6.8335 5.5H12.8335C13.5699 5.5 14.1668 6.09695 14.1668 6.83333V12.8333C14.1668 13.5697 13.5699 14.1667 12.8335 14.1667H6.8335C6.09712 14.1667 5.50016 13.5697 5.50016 12.8333V6.83333C5.50016 6.09695 6.09712 5.5 6.8335 5.5Z"
        stroke="var(--sds-color-icon-default-default)"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};
