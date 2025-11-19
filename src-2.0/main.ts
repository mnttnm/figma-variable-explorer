import {
  emit,
  on,
  once,
  showUI,
} from "@create-figma-plugin/utilities";

import {
  CloseHandler,
  CollectionsData,
  CollectionVariables,
  ColorResolutionMode,
  GetJsonDataHandler,
  GetVariableHandler,
  InternalVariable,
  ResizeWindowHandler,
  TrackLaunchHandler,
  MarkSupportPromptSeenHandler,
  DismissSupportPromptHandler,
  VariableViewMode,
} from "./types";
import {
  enrichVariableModeValues,
  getCSSResponseFromData,
} from "./helpers/variableResolverHelper";
import { exportToJSON } from "./helpers/figma-sds-helper";

export default function () {
  on<ResizeWindowHandler>(
    "RESIZE_WINDOW",
    function (windowSize: { width: number; height: number }) {
      const { width, height } = windowSize;
      figma.ui.resize(width, height);
    }
  );

  once<CloseHandler>("CLOSE", function () {
    figma.closePlugin();
  });

  // Track plugin launches for support prompt
  on<TrackLaunchHandler>("TRACK_LAUNCH", async function () {
    try {
      const launchCount = (await figma.clientStorage.getAsync("launchCount")) || 0;
      const hasSeenPrompt = (await figma.clientStorage.getAsync("hasSeenSupportPrompt")) || false;
      const lastDismissLaunchCount = (await figma.clientStorage.getAsync("lastDismissLaunchCount")) || null;

      const newCount = launchCount + 1;
      await figma.clientStorage.setAsync("launchCount", newCount);

      emit("LAUNCH_DATA", {
        launchCount: newCount,
        hasSeenPrompt,
        lastDismissLaunchCount
      });
    } catch (error) {
      console.error("Error tracking launch:", error);
    }
  });

  // Mark support prompt as seen
  on<MarkSupportPromptSeenHandler>("MARK_SUPPORT_PROMPT_SEEN", async function () {
    try {
      await figma.clientStorage.setAsync("hasSeenSupportPrompt", true);
    } catch (error) {
      console.error("Error marking support prompt as seen:", error);
    }
  });

  // Dismiss support prompt (for "Remind Later" and auto-dismiss)
  on<DismissSupportPromptHandler>("DISMISS_SUPPORT_PROMPT", async function (currentLaunchCount) {
    try {
      await figma.clientStorage.setAsync("lastDismissLaunchCount", currentLaunchCount);
    } catch (error) {
      console.error("Error dismissing support prompt:", error);
    }
  });

  // Analytics consent handlers
  on("ANALYTICS_GET_CONSENT", async function () {
    try {
      const consent = await figma.clientStorage.getAsync("analyticsConsent");
      emit("ANALYTICS_CONSENT_LOADED", consent ?? null);
    } catch (error) {
      console.error("Error getting analytics consent:", error);
      emit("ANALYTICS_CONSENT_LOADED", null);
    }
  });

  on("ANALYTICS_SET_CONSENT", async function (consent: boolean) {
    try {
      await figma.clientStorage.setAsync("analyticsConsent", consent);
    } catch (error) {
      console.error("Error setting analytics consent:", error);
    }
  });

  on("ANALYTICS_GET_ANONYMOUS_ID", async function () {
    try {
      const id = await figma.clientStorage.getAsync("analyticsAnonymousId");
      emit("ANALYTICS_ANONYMOUS_ID_LOADED", id ?? null);
    } catch (error) {
      console.error("Error getting anonymous ID:", error);
      emit("ANALYTICS_ANONYMOUS_ID_LOADED", null);
    }
  });

  on("ANALYTICS_SET_ANONYMOUS_ID", async function (id: string) {
    try {
      await figma.clientStorage.setAsync("analyticsAnonymousId", id);
    } catch (error) {
      console.error("Error setting anonymous ID:", error);
    }
  });

  on<GetJsonDataHandler>(
    "GET_JSON_DATA_FOR_EXPORT",
    async function (
      colorResolutionMode,
      exportContentType,
      activeCollection
    ) {
      // we are just forwarding the activeCollection value to the ui layer
      const jsonData = await exportToJSON(colorResolutionMode);
      emit(
        "EXPORT_JSON_DATA_READY",
        jsonData,
        exportContentType,
        activeCollection
      );
    }
  );

  on<GetVariableHandler>(
    "GET_VARIABLES",
    async function (
      viewMode: VariableViewMode,
      colorResolutionMode: ColorResolutionMode
    ) {
      const collections =
        await figma.variables.getLocalVariableCollectionsAsync();
      const collectionsData: CollectionsData = {};
      for (const collection of collections) {
        const {
          name: collectionName,
          modes,
          variableIds,
        } = collection;
        const collectionVariables: CollectionVariables = {
          modes: modes.map(({ name: modeName }) => modeName),
          variables: {},
        };
        for (const variableId of variableIds) {
          const figmaVar =
            await figma.variables.getVariableByIdAsync(variableId);
          if (figmaVar) {
            const {
              resolvedType,
              name: varName,
              valuesByMode,
            } = figmaVar;
            const varInfo: InternalVariable = {
              type: resolvedType,
              values: await enrichVariableModeValues(
                valuesByMode,
                collection
              ),
              name: varName,
            };
            collectionVariables.variables[variableId] = varInfo;
          }
        }
        collectionsData[collectionName] = collectionVariables;
      }

      emit("DONE", {
        "collectionsData": collectionsData,
        "jsonData": await exportToJSON(colorResolutionMode),
      });
    }
  );

  showUI({
    width: 900,
    height: 800,
  });
}
