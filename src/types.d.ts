type MenuType = "link" | "submenu";

interface BaseMenuSettings {
  type: MenuType;
  text: string;
  href: string;
  adminOnly?: boolean;
}

interface AppSwitcherMenuSettings extends BaseMenuSettings {
  content?: BaseMenuSettings[];
}

declare module "*.css" {
  const content: string;
  export default content;
}

declare module "*.svg" {
  const content: any;
  export default content;
}

declare module "*.png" {
  const content: any;
  export default content;
}

declare var deploymentRootPath: string;
