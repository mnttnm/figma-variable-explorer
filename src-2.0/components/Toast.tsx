import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import React from "preact/compat";
import styles from "../style.css";
import { ToastMessage } from "../contexts/ToastContext";

interface ToastProps {
  toast: ToastMessage;
  onRemove: () => void;
}

export const Toast = ({ toast, onRemove }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for animation to complete before removing
    setTimeout(onRemove, 200);
  };

  return (
    <div
      className={`${styles.toast} ${styles[`toast-${toast.type}`]} ${
        isVisible ? styles.toastVisible : ''
      }`}
      style={{
        pointerEvents: 'auto'
      }}
    >
      <div
        className={styles.toastContent}
        onKeyDown={(e) => {
          if (e.key === 'Escape') handleClose();
        }}
        tabIndex={0}
      >
        <span className={styles.toastMessage}>{toast.message}</span>
        <button
          className={styles.toastCloseButton}
          onClick={handleClose}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};