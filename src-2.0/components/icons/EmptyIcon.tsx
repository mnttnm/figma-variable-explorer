import { h } from "preact";
import React from "preact/compat";

export const EmptyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    role="img"
    aria-label="Empty state"
  >
    <rect
      x="8"
      y="16"
      width="48"
      height="32"
      rx="4"
      stroke="var(--sds-color-icon-default-secondary)"
      stroke-width="2"
      fill="none"
    />
    <path
      d="M8 20L32 36L56 20"
      stroke="var(--sds-color-icon-default-secondary)"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <circle
      cx="20"
      cy="28"
      r="1.5"
      fill="var(--sds-color-icon-default-tertiary)"
    />
    <circle
      cx="26"
      cy="28"
      r="1.5"
      fill="var(--sds-color-icon-default-tertiary)"
    />
  </svg>
);