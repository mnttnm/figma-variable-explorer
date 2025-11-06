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
  targetLaunchCount: number = 3
): {
  shouldShowPrompt: boolean;
  markAsSeen: () => void;
  resetCount: () => void;
} => {
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false);

  useEffect(() => {
    // Listen for launch data from main thread
    const unsubscribe = on("LAUNCH_DATA", (data: LaunchData) => {
      const { launchCount, hasSeenPrompt } = data;

      // Show prompt if user has launched plugin the target number of times
      // and hasn't seen the prompt yet
      if (launchCount === targetLaunchCount && !hasSeenPrompt) {
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
  }, [targetLaunchCount]);

  const markAsSeen = () => {
    emit("MARK_SUPPORT_PROMPT_SEEN");
    setShouldShowPrompt(false);
  };

  const resetCount = () => {
    // Reset is handled by not marking as seen
    // This allows the prompt to appear again after another 3 launches
    setShouldShowPrompt(false);
  };

  return {
    shouldShowPrompt,
    markAsSeen,
    resetCount,
  };
};
