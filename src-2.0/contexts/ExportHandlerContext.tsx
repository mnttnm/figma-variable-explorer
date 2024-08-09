// import { createContext, JSX, h } from "preact";
// import { useContext, useReducer } from "preact/hooks";

// interface ExportHandlerContext {
//   exportHandler: () => void;
// }

// const exportHandlerContext = createContext({});

// const ExportHandlerContextProvider = ({
//   children,
// }: {
//   children: JSX.Element;
// }) => {
//   const [exportHandler, dispatch] = useReducer(
//     (state, action): ExportHandlerContext => {
//       switch (action.type) {
//         case "setExportHandler":
//           return { ...state, exportHandler: action.exportHandler };
//         default:
//           return state;
//       }
//     },
//     {
//       exportHandler: () => {},
//     }
//   );

//   return (
//     <exportHandlerContext.Provider
//       value={{
//         exportHandler: () => {},
//       }}
//     >
//       {children}
//     </exportHandlerContext.Provider>
//   );
// };
