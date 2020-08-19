declare module "*.css" {
  const content: string;
  export default content;
}

declare module "*.svg" {
  const content: any;
  export default content;
}

declare var deploymentRootPath: string;
