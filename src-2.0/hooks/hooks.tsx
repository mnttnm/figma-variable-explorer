import { useEffect, useState } from "preact/hooks";
import { emit, on } from "@create-figma-plugin/utilities";
import type { LaunchData } from "../types";

export const useEscape = (onEscape: () => void) => {
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onEscape();
      }
    };

    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [onEscape]);
};

export const useLaunchTracking = (
  targetLaunchCount: number = 3,
  dismissCooldown: number = 5
): {
  shouldShowPrompt: boolean;
  markAsSeen: () => void;
  dismissPrompt: () => void;
} => {
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false);
  const [currentLaunchCount, setCurrentLaunchCount] = useState(0);

  useEffect(() => {
    // Listen for launch data from main thread
    const unsubscribe = on("LAUNCH_DATA", (data: LaunchData) => {
      const { launchCount, hasSeenPrompt, lastDismissLaunchCount } = data;
      setCurrentLaunchCount(launchCount);

      // Show prompt if:
      // 1. User has launched plugin the target number of times or more
      // 2. User hasn't permanently dismissed it (hasSeenPrompt = false)
      // 3. Either never dismissed OR cooldown period has passed (5 launches since last dismiss)
      const cooldownPassed = lastDismissLaunchCount === null ||
                            (launchCount - lastDismissLaunchCount) >= dismissCooldown;

      if (launchCount >= targetLaunchCount && !hasSeenPrompt && cooldownPassed) {
        // Delay showing the prompt by 3 seconds
        setTimeout(() => {
          setShouldShowPrompt(true);
        }, 3000);
      }
    });

    // Track this launch
    emit("TRACK_LAUNCH");

    return () => {
      unsubscribe();
    };
  }, [targetLaunchCount, dismissCooldown]);

  const markAsSeen = () => {
    emit("MARK_SUPPORT_PROMPT_SEEN");
    setShouldShowPrompt(false);
  };

  const dismissPrompt = () => {
    // Records the current launch count and hides the prompt
    // Prompt will reappear after 5 more launches
    emit("DISMISS_SUPPORT_PROMPT", currentLaunchCount);
    setShouldShowPrompt(false);
  };

  return {
    shouldShowPrompt,
    markAsSeen,
    dismissPrompt,
  };
};
