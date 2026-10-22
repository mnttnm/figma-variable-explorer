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
import { formatReport, scanVariables } from "./helpers/diagnostics";
import { IS_DEBUG_BUILD } from "./debug";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

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

  on<GetJsonDataHandler>(
    "GET_JSON_DATA_FOR_EXPORT",
    async function (
      colorResolutionMode,
      exportContentType,
      activeCollection
    ) {
      // we are just forwarding the activeCollection value to the ui layer
      let jsonData;
      try {
        jsonData = await exportToJSON(colorResolutionMode);
      } catch (error) {
        console.error("Variable Explorer: export failed", error);
        figma.notify(`Export failed: ${errorMessage(error)}`, { error: true });
        return;
      }
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
      if (IS_DEBUG_BUILD) {
        const report = await scanVariables();
        const reportText = formatReport(report);
        console.log(reportText);
        console.log("Variable Explorer debug report (raw):", report);
        emit("DEBUG_REPORT", reportText, report.issues.length);
      }

      try {
        emit("DONE", await getVariablesData(colorResolutionMode));
      } catch (error) {
        console.error("Variable Explorer: failed to load variables", error);
        emit("DONE", { error: errorMessage(error) });
      }
    }
  );

  showUI({
    width: 900,
    height: 800,
  });
}

async function getVariablesData(colorResolutionMode: ColorResolutionMode) {
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
        let values;
        try {
          values = await enrichVariableModeValues(valuesByMode, collection);
        } catch (error) {
          throw new Error(
            `${errorMessage(error)} (while reading "${varName}" in collection "${collectionName}")`
          );
        }
        const varInfo: InternalVariable = {
          type: resolvedType,
          values,
          name: varName,
        };
        collectionVariables.variables[variableId] = varInfo;
      }
    }
    collectionsData[collectionName] = collectionVariables;
  }

  return {
    "collectionsData": collectionsData,
    "jsonData": await exportToJSON(colorResolutionMode),
  };
}
