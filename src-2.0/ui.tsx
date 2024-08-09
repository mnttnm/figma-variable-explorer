import { render, useWindowResize } from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";
import { ResizeWindowHandler } from "./types";
import { h } from "preact";
import PluginUI from "./PluginUI";
import React from "preact/compat";

function Plugin() {
  function onWindowResize(windowSize: {
    width: number;
    height: number;
  }) {
    emit<ResizeWindowHandler>("RESIZE_WINDOW", windowSize);
  }

  useWindowResize(onWindowResize, {
    minWidth: 300,
    minHeight: 600,
    resizeBehaviorOnDoubleClick: "maximize",
    maxHeight: window.screen.availHeight - 100,
    maxWidth: window.screen.availWidth - 100,
  });

  return (
    <body>
      <PluginUI />
    </body>
  );
}

export default render(Plugin);
