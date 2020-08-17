export const hrefIsTheSameDeploymentRootPath = (href: string): boolean => {
  let deployment = "";
  try {
    deployment = deploymentRootPath;
  } catch {
    deployment = "";
  }

  if (!deployment) {
    return false;
  }

  return href !== "/" && href.includes(deployment);
};

export const getDeploymentRootPathLink = (href: string): string => {
  const link = href.split(deploymentRootPath)[1];

  return link.startsWith("/") ? link : `/${link}`;
};
