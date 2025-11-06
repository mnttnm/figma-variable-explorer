import { h } from "preact";
import React from "preact/compat";
import styles from "../style.css";

export const LoadingSpinner = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
      </div>
      <p className={styles.loadingText}>Loading variables...</p>
    </div>
  );
};
