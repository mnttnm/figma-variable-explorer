import { JSX } from "preact";

export interface NavItemInfo {
  icon: JSX.Element;
  title: string;
  isActive: boolean;
  id: NavItemId;
}

export enum NavItemId {
  variables = "variables",
  export = "export",
  config = "config",
  help = "help",
}
