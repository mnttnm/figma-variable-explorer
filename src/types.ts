import { EventHandler } from '@create-figma-plugin/utilities'

export interface CloseHandler extends EventHandler {
  name: 'CLOSE'
  handler: () => void
}

export interface GetVariableHandler extends EventHandler {
  name: "GET_VARIABLES";
  handler: () => void;
}
