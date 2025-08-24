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

  on<GetJsonDataHandler>(
    "GET_JSON_DATA_FOR_EXPORT",
    function (
      colorResolutionMode,
      exportContentType,
      activeCollection
    ) {
      // we are just forwarding the activeCollection value to the ui layer
      const jsonData = exportToJSON(colorResolutionMode);
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
    function (
      viewMode: VariableViewMode,
      colorResolutionMode: ColorResolutionMode
    ) {
      const collections =
        figma.variables.getLocalVariableCollections();
      const collectionsData: CollectionsData = {};
      collections.forEach((collection) => {
        const {
          name: collectionName,
          modes,
          variableIds,
        } = collection;
        const collectionVariables: CollectionVariables = {
          modes: modes.map(({ name: modeName }) => modeName),
          variables: {},
        };
        variableIds.forEach((variableId) => {
          const figmaVar =
            figma.variables.getVariableById(variableId);
          if (figmaVar) {
            const {
              resolvedType,
              name: varName,
              valuesByMode,
            } = figmaVar;
            const varInfo: InternalVariable = {
              type: resolvedType,
              values: enrichVariableModeValues(
                valuesByMode,
                collection
              ),
              name: varName,
            };
            collectionVariables.variables[variableId] = varInfo;
          }
        });
        collectionsData[collectionName] = collectionVariables;
      });

      emit("DONE", {
        "collectionsData": collectionsData,
        "jsonData": exportToJSON(colorResolutionMode),
      });
    }
  );

  showUI({
    width: 420,
    height: 600,
  });
}
