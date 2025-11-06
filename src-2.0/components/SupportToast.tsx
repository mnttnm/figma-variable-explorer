import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import React from "preact/compat";
import styles from "../style.css";

interface SupportToastProps {
  onClose: () => void;
  onStar: () => void;
  onSponsor: () => void;
  onRemindLater: () => void;
}

export const SupportToast = ({
  onClose,
  onStar,
  onSponsor,
  onRemindLater
}: SupportToastProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount with a slight delay
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss after 15 seconds
  useEffect(() => {
    const autoDismiss = setTimeout(() => {
      handleClose();
    }, 15000);
    return () => clearTimeout(autoDismiss);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleAction = (action: () => void) => {
    action();
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`${styles.supportToast} ${
        isVisible ? styles.supportToastVisible : ''
      }`}
      style={{
        pointerEvents: 'auto'
      }}
    >
      <button
        className={styles.supportToastCloseButton}
        onClick={handleClose}
        aria-label="Close notification"
      >
        ×
      </button>

      <div className={styles.supportToastContent}>
        <div className={styles.supportToastMessage}>
          <div className={styles.supportToastTitle}>
            👋 You've been exploring variables with us for a bit!
          </div>
          <div className={styles.supportToastSubtitle}>
            If it's saving you time, a star or sponsorship would mean the world and help keep this free.
          </div>
        </div>

        <div className={styles.supportToastActions}>
          <button
            className={`${styles.supportToastButton} ${styles.supportToastButtonPrimary}`}
            onClick={() => handleAction(onStar)}
          >
            ⭐ Star on GitHub
          </button>
          <button
            className={`${styles.supportToastButton} ${styles.supportToastButtonPrimary}`}
            onClick={() => handleAction(onSponsor)}
          >
            💝 Sponsor
          </button>
          <button
            className={`${styles.supportToastButton} ${styles.supportToastButtonSecondary}`}
            onClick={() => handleAction(onRemindLater)}
          >
            Remind me later
          </button>
        </div>
      </div>
    </div>
  );
};
