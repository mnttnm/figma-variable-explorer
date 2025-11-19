import { h } from "preact";
import React from "preact/compat";
import { useEffect, useState } from "preact/hooks";
import styles from "../style.css";
import { useAnalytics } from "../contexts/AnalyticsContext";

export const AnalyticsConsentBanner = () => {
  const { hasConsent, setConsent, isInitialized } = useAnalytics();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show banner after a short delay if consent hasn't been set
    if (isInitialized && hasConsent === null) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isInitialized, hasConsent]);

  // Don't render if already decided or not yet initialized
  if (!isInitialized || hasConsent !== null) {
    return null;
  }

  const handleAccept = () => {
    setIsVisible(false);
    setTimeout(() => setConsent(true), 200);
  };

  const handleDecline = () => {
    setIsVisible(false);
    setTimeout(() => setConsent(false), 200);
  };

  return (
    <div
      className={`${styles.consentBanner} ${isVisible ? styles.consentBannerVisible : ''}`}
    >
      <div className={styles.consentContent}>
        <div className={styles.consentHeader}>
          <span className={styles.consentTitle}>Help improve this plugin</span>
        </div>
        <p className={styles.consentMessage}>
          We collect anonymous usage data to understand which features are helpful.
          No personal information is collected.
        </p>
        <div className={styles.consentActions}>
          <button
            className={styles.consentButtonPrimary}
            onClick={handleAccept}
          >
            Allow analytics
          </button>
          <button
            className={styles.consentButtonSecondary}
            onClick={handleDecline}
          >
            No thanks
          </button>
        </div>
        <p className={styles.consentFooter}>
          You can change this anytime in settings.
        </p>
      </div>
    </div>
  );
};
