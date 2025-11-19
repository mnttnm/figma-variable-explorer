import { h } from "preact";
import React from "preact/compat";
import { useState, useEffect } from "preact/hooks";
import styles from "../style.css";

const tips = [
  "Tip: Use search to quickly find variables across all modes",
  "Tip: Export variables as CSS, SCSS, JSON, or Markdown",
  "Tip: Click on alias badges to navigate to referenced variables",
  "Tip: Switch between Table, CSS, and JSON views using tabs",
  "Tip: Color values can be displayed as HEX, RGB, or HSL",
];

export const LoadingSpinner = () => {
  const [tipIndex, setTipIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % tips.length);
        setFadeIn(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
      </div>
      <p className={styles.loadingText}>Loading variables...</p>
      <p className={`${styles.loadingTip} ${fadeIn ? styles.tipFadeIn : styles.tipFadeOut}`}>
        {tips[tipIndex]}
      </p>
    </div>
  );
};
