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
    // Trigger animation on mount with a slight delay for smoother entrance
    const timer = setTimeout(() => setIsVisible(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss after 12 seconds
  useEffect(() => {
    const autoDismiss = setTimeout(() => {
      handleClose();
    }, 12000);
    return () => clearTimeout(autoDismiss);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 400);
  };

  const handleAction = (action: () => void) => {
    action();
    setIsVisible(false);
    setTimeout(onClose, 400);
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
        <div className={styles.supportToastHeader}>
          <span className={styles.supportToastIcon}>👋</span>
          <span className={styles.supportToastTitle}>Enjoying variables?</span>
        </div>

        <div className={styles.supportToastBody}>
          Support with a ⭐ or 💝 to keep it free!
        </div>

        <div className={styles.supportToastActions}>
          <button
            className={`${styles.supportToastButton} ${styles.supportToastButtonStar}`}
            onClick={() => handleAction(onStar)}
          >
            ⭐ GitHub
          </button>
          <button
            className={`${styles.supportToastButton} ${styles.supportToastButtonSponsor}`}
            onClick={() => handleAction(onSponsor)}
          >
            💝 Sponsor
          </button>
        </div>

        <div className={styles.supportToastFooter}>
          <button
            className={styles.supportToastLaterLink}
            onClick={() => handleAction(onRemindLater)}
          >
            Later
          </button>
          <span className={styles.supportToastSocialsSeparator}>•</span>
          <a
            href="https://www.linkedin.com/in/tatermohit/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.supportToastSocialLink}
            onClick={(e) => e.stopPropagation()}
          >
            LinkedIn
          </a>
          <span className={styles.supportToastSocialsSeparator}>•</span>
          <a
            href="https://twitter.com/tatermohit"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.supportToastSocialLink}
            onClick={(e) => e.stopPropagation()}
          >
            Twitter
          </a>
        </div>
      </div>
    </div>
  );
};
