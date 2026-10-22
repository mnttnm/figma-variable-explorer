// Injects the __DEBUG_BUILD__ flag used by src-2.0/debug.ts.
module.exports = function (buildOptions) {
  return {
    ...buildOptions,
    define: {
      ...(buildOptions.define || {}),
      __DEBUG_BUILD__: JSON.stringify(
        process.env.npm_lifecycle_event === "build:debug"
      ),
    },
  };
};
