import { createContext, h, ComponentChildren } from "preact";
import { useCallback, useContext, useState, useEffect } from "preact/hooks";
import { emit, on } from "@create-figma-plugin/utilities";

// Event types for tracking
export type AnalyticsEvent =
  | 'plugin_opened'
  | 'view_switched'
  | 'export_completed'
  | 'copy_completed'
  | 'search_used'
  | 'collection_switched'
  | 'settings_changed'
  | 'error_occurred';

export interface AnalyticsEventData {
  event: AnalyticsEvent;
  properties?: Record<string, string | number | boolean>;
  timestamp: number;
  sessionId: string;
  anonymousId: string;
}

export interface AnalyticsContextState {
  hasConsent: boolean | null; // null = not yet asked
  setConsent: (consent: boolean) => void;
  trackEvent: (event: AnalyticsEvent, properties?: Record<string, string | number | boolean>) => void;
  isInitialized: boolean;
}

export const AnalyticsContext = createContext<AnalyticsContextState | null>(null);

interface AnalyticsProviderProps {
  children: ComponentChildren;
}

// Generate a random anonymous ID
const generateAnonymousId = (): string => {
  return 'anon_' + Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
};

// Generate session ID (resets each time plugin opens)
const generateSessionId = (): string => {
  return 'sess_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
};

// Configuration - can be customized for different analytics backends
const ANALYTICS_CONFIG = {
  // Set to your analytics endpoint (e.g., PostHog, Mixpanel, or custom)
  // Leave empty to just log to console (for development)
  endpoint: '',
  // Batch events to reduce network calls
  batchSize: 10,
  // Flush interval in ms
  flushInterval: 30000,
};

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [anonymousId, setAnonymousId] = useState<string>('');
  const [sessionId] = useState<string>(generateSessionId());
  const [eventQueue, setEventQueue] = useState<AnalyticsEventData[]>([]);

  // Load consent and anonymous ID from storage on mount
  useEffect(() => {
    emit('ANALYTICS_GET_CONSENT');
    emit('ANALYTICS_GET_ANONYMOUS_ID');

    const handleConsentLoaded = (consent: boolean | null) => {
      setHasConsent(consent);
      setIsInitialized(true);
    };

    const handleAnonymousIdLoaded = (id: string | null) => {
      if (id) {
        setAnonymousId(id);
      } else {
        // Generate new anonymous ID if none exists
        const newId = generateAnonymousId();
        setAnonymousId(newId);
        emit('ANALYTICS_SET_ANONYMOUS_ID', newId);
      }
    };

    on('ANALYTICS_CONSENT_LOADED', handleConsentLoaded);
    on('ANALYTICS_ANONYMOUS_ID_LOADED', handleAnonymousIdLoaded);

    return () => {
      // Cleanup listeners if needed
    };
  }, []);

  // Flush events to analytics endpoint
  const flushEvents = useCallback(async (events: AnalyticsEventData[]) => {
    if (events.length === 0) return;

    if (!ANALYTICS_CONFIG.endpoint) {
      // Development mode - just log to console
      console.log('[Analytics] Events:', events);
      return;
    }

    try {
      await fetch(ANALYTICS_CONFIG.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      console.error('[Analytics] Failed to send events:', error);
    }
  }, []);

  // Periodic flush of event queue
  useEffect(() => {
    const interval = setInterval(() => {
      if (eventQueue.length > 0 && hasConsent) {
        flushEvents(eventQueue);
        setEventQueue([]);
      }
    }, ANALYTICS_CONFIG.flushInterval);

    return () => clearInterval(interval);
  }, [eventQueue, hasConsent, flushEvents]);

  // Set consent and persist
  const setConsent = useCallback((consent: boolean) => {
    setHasConsent(consent);
    emit('ANALYTICS_SET_CONSENT', consent);

    // If user denies consent, clear any queued events
    if (!consent) {
      setEventQueue([]);
    }
  }, []);

  // Track an event
  const trackEvent = useCallback((
    event: AnalyticsEvent,
    properties?: Record<string, string | number | boolean>
  ) => {
    // Don't track if no consent or not initialized
    if (!hasConsent || !anonymousId) return;

    const eventData: AnalyticsEventData = {
      event,
      properties,
      timestamp: Date.now(),
      sessionId,
      anonymousId,
    };

    setEventQueue(prev => {
      const newQueue = [...prev, eventData];

      // Flush if queue reaches batch size
      if (newQueue.length >= ANALYTICS_CONFIG.batchSize) {
        flushEvents(newQueue);
        return [];
      }

      return newQueue;
    });
  }, [hasConsent, anonymousId, sessionId, flushEvents]);

  return (
    <AnalyticsContext.Provider value={{
      hasConsent,
      setConsent,
      trackEvent,
      isInitialized
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = (): AnalyticsContextState => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
