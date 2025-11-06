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

      const newCount = launchCount + 1;
      await figma.clientStorage.setAsync("launchCount", newCount);

      emit("LAUNCH_DATA", { launchCount: newCount, hasSeenPrompt });
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
