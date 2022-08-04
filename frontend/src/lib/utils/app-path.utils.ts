import { AppPath } from "../constants/routes.constants";
import { memoize } from "./optimization.utils";

const mapper: Record<string, string> = {
  // exceptions only
  [AppPath.Wallet]: `${AppPath.Wallet}/[a-zA-Z0-9]+`,
  [AppPath.ProposalDetail]: `${AppPath.ProposalDetail}/[0-9]+`,
  [AppPath.NeuronDetail]: `${AppPath.NeuronDetail}/[0-9]+`,
  [AppPath.CanisterDetail]: `${AppPath.CanisterDetail}/[a-zA-Z0-9-]+`,
  [AppPath.ProjectDetail]: `${AppPath.ProjectDetail}/[a-zA-Z0-9-]+`,
  [AppPath.SnsNeuronDetail]: `${AppPath.ProjectDetail}/[a-zA-Z0-9-]+/neuron/[a-zA-Z0-9-]+`,
};

const pathValidation = (path: AppPath): string => mapper[path] ?? path;

export const isAppPath = (routePath: string): routePath is AppPath =>
  Boolean(
    Object.values(AppPath).find((path) => isRoutePath({ path, routePath }))
  );

export const isRoutePath: ({
  path,
  routePath,
}: {
  path: AppPath;
  routePath: string | undefined;
}) => boolean = memoize(({ path, routePath }) =>
  new RegExp(`^${pathValidation(path)}$`).test(routePath)
);

export const getLastPathDetailId = (path: string): bigint | undefined => {
  const pathDetail = getLastPathDetail(path);
  if (pathDetail === undefined) {
    return undefined;
  }
  try {
    const id = BigInt(pathDetail);
    return `${id}` === pathDetail ? id : undefined;
  } catch (err) {
    console.error(`Couldn't get last detail id from ${pathDetail}`);
    return undefined;
  }
};

export const getLastPathDetail = (
  path: string | undefined
): string | undefined => path?.split("/").pop();

/**
 * Returns the third last path detail not taking into account trailing slashes
 * @param path: string
 * Ex: /#/project/sp3hj-caaaa-aaaaa-aaajq-cai/neuron/9aaefb31ec11d
 * @returns string
 * Ex: sp3hj-caaaa-aaaaa-aaajq-cai
 */
export const getParentPathDetail = (
  path: string | undefined
): string | undefined => {
  const steps = path?.replace(/\/+$/, "").split("/") ?? [];
  // Do not return empty strings
  return steps[steps.length - 3] === "" ? undefined : steps[steps.length - 3];
};
