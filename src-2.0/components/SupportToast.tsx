import { h } from "preact";
import { useEffect, useState, useRef } from "preact/hooks";
import React from "preact/compat";
import styles from "../style.css";

interface SupportToastProps {
  onClose: () => void;
  onStar: () => void;
  onSponsor: () => void;
  onRemindLater: () => void;
  autoDismissMs?: number;
  disableAutoDismiss?: boolean;
}

export const SupportToast = ({
  onClose,
  onStar,
  onSponsor,
  onRemindLater,
  autoDismissMs = 20000,
  disableAutoDismiss = false
}: SupportToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const autoDismissTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Trigger animation on mount with a slight delay for smoother entrance
    const timer = setTimeout(() => setIsVisible(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss after configured duration, respecting accessibility preferences
  useEffect(() => {
    if (disableAutoDismiss) return;

    // Check for prefers-reduced-motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // If user prefers reduced motion, extend the timeout or skip auto-dismiss
    const timeout = prefersReducedMotion ? autoDismissMs * 2 : autoDismissMs;

    autoDismissTimer.current = setTimeout(() => {
      handleRemindLater();
    }, timeout);

    return () => {
      if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
    };
  }, [autoDismissMs, disableAutoDismiss]);

  const handleClose = () => {
    if (autoDismissTimer.current) {
      clearTimeout(autoDismissTimer.current);
      autoDismissTimer.current = null;
    }
    setIsVisible(false);
    setTimeout(onClose, 400);
  };

  const handleAction = (action: () => void) => {
    if (autoDismissTimer.current) {
      clearTimeout(autoDismissTimer.current);
      autoDismissTimer.current = null;
    }
    action();
    setIsVisible(false);
    setTimeout(onClose, 400);
  };

  const handleRemindLater = () => {
    if (autoDismissTimer.current) {
      clearTimeout(autoDismissTimer.current);
      autoDismissTimer.current = null;
    }
    setIsVisible(false);
    // Don't call onClose - just call onRemindLater to dismiss without marking as seen
    setTimeout(onRemindLater, 400);
  };

  return (
    <div
      className={`${styles.supportToast} ${
        isVisible ? styles.supportToastVisible : ''
      }`}
      role="status"
      aria-live="polite"
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
          <span className={styles.supportToastTitle}>Enjoying the plugin?</span>
        </div>

        <div className={styles.supportToastBody}>
          Support us with a star or sponsorship to keep this free.
        </div>

        <div className={styles.supportToastActions}>
          <button
            className={`${styles.supportToastButton} ${styles.supportToastButtonStar}`}
            onClick={() => handleAction(onStar)}
          >
            ⭐ Star
          </button>
          <button
            className={`${styles.supportToastButton} ${styles.supportToastButtonSponsor}`}
            onClick={() => handleAction(onSponsor)}
          >
            Sponsor
          </button>
          <button
            className={`${styles.supportToastButton} ${styles.supportToastButtonTertiary}`}
            onClick={handleRemindLater}
          >
            Remind Later
          </button>
        </div>

        <div className={styles.supportToastFooter}>
          <span className={styles.supportToastGreeting}>Hello</span>
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
