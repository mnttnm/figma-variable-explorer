import { h } from "preact";
import React from "preact/compat";

export const WarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    role="img"
    aria-label="Warning"
  >
    <path
      d="M22.1924 8.14356C23.1714 6.47334 25.8286 6.47334 26.8076 8.14356L45.5076 38.1436C46.4865 39.8138 45.158 42 43.2 42H5.8C3.84202 42 2.51348 39.8138 3.49244 38.1436L22.1924 8.14356Z"
      stroke="var(--sds-color-icon-danger-default)"
      stroke-width="2"
      stroke-linejoin="round"
    />
    <path
      d="M24 18V28"
      stroke="var(--sds-color-icon-danger-default)"
      stroke-width="2"
      stroke-linecap="round"
    />
    <circle
      cx="24"
      cy="34"
      r="2"
      fill="var(--sds-color-icon-danger-default)"
    />
  </svg>
);