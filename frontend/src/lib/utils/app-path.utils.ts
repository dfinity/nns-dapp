import { AppPath, CONTEXT_PATH } from "../constants/routes.constants";
import { routePathNeuronId } from "../services/neurons.services";
import { memoize } from "./optimization.utils";

const mapper: Record<string, string> = {
  // exceptions only
  [AppPath.Wallet]: `${AppPath.Wallet}/[a-zA-Z0-9]+`,
  [AppPath.ProposalDetail]: `${AppPath.ProposalDetail}/[0-9]+`,
  [AppPath.LegacyNeuronDetail]: `${AppPath.LegacyNeuronDetail}/[0-9]+`,
  [AppPath.Neurons]: `${CONTEXT_PATH}/[a-zA-Z0-9-]+/neurons`,
  [AppPath.CanisterDetail]: `${AppPath.CanisterDetail}/[a-zA-Z0-9-]+`,
  [AppPath.ProjectDetail]: `${AppPath.ProjectDetail}/[a-zA-Z0-9-]+`,
  [AppPath.NeuronDetail]: `${AppPath.ProjectDetail}/[a-zA-Z0-9-]+/neuron/[a-zA-Z0-9-]+`,
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

const contextPathRegex = new RegExp(`^${CONTEXT_PATH}/[a-zA-Z0-9-]+`);

/**
 * Returns the path after the context.
 * Returns undefined if the path is not a context path.
 *
 * Ex: `/#/u/xxxxx/neurons` returns `/neurons`
 * Ex: `/#/u/xxxxx/account/12345` returns `/account/12345`
 * Ex: `/#/neurons` returns undefined
 *
 * @param routePath
 * @returns string or undefined
 */
export const getContextDetailsFromPath = (
  routePath: string
): string | undefined => {
  if (isContextPath(routePath)) {
    return routePath.replace(contextPathRegex, "");
  }
};

/**
 * Returns whether the path is a context path.
 * A context path is a path that starts with `/u/<some-path>`.
 *
 * Ex: `/#/u/xxxxx/neurons` returns true
 * Ex: `/#/u/xxxxx/account/12345` returns true
 * Ex: `/#/neurons` returns false
 *
 * @param routePath string - The path to check
 * @returns boolean
 */
export const isContextPath = (routePath: string): boolean =>
  new RegExp(`^${CONTEXT_PATH}/[a-zA-Z0-9-]+`).test(routePath);

/**
 * Returns the context if the routePath is a path with a context prefix: `/#/u/:rootCanisterId{/...}`
 * Returns undefined if the routePath is not a context path.
 *
 * Ex: `/#/u/aaaaa-aa/neurons` returns `aaaaa-aa`
 * Ex: `/#/u/12234/account/12345` returns `12234`
 * Ex: `/#/neurons` returns undefined
 *
 * @param routePath Path of the app: `/proposals`, `/u/xxxxx/neurons`, etc.
 */
export const getContextFromPath = (routePath: string): string | undefined => {
  if (isContextPath(routePath)) {
    return getParentPathDetail(routePath);
  }
};

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
 * Ex: /#/u/sp3hj-caaaa-aaaaa-aaajq-cai/neuron/9aaefb31ec11d
 * Ex: /#/u/sp3hj-caaaa-aaaaa-aaajq-cai
 * @returns string
 * Ex: sp3hj-caaaa-aaaaa-aaajq-cai
 */
export const getParentPathDetail = (
  path: string | undefined
): string | undefined => {
  const steps = path?.replace(/\/+$/, "").split("/") ?? [];
  // Do not return empty strings
  return steps[3] === "" ? undefined : steps[3];
};

/**
 * Returns a new path with the new context.
 * Doesn't do anything if the current path is not a context path.
 *
 * When called with `bbbbb-bb`
 * Ex: `/#/u/aaaaa-aa/neurons` becomes `/#/u/bbbbb-bb/neurons`
 * Ex: `/#/u/aaaaa-aa/account/1234` becomes `/#/u/bbbbb-bb/account/1234`
 * Ex: `/#/neurons` doesn't change anything
 *
 * @param path string - the path to change
 * @param newContext string - the new context to navigate to
 */
export const changePathContext = ({
  path,
  newContext,
}: {
  path: string;
  newContext: string;
}) => {
  let newPath = path;
  // Check exceptions
  if (isRoutePath({ path: AppPath.LegacyNeurons, routePath: path })) {
    newPath = `${CONTEXT_PATH}/${newContext}/neurons`;
  }
  if (
    isRoutePath({
      path: AppPath.LegacyNeuronDetail,
      routePath: path,
    })
  ) {
    const neuronId = routePathNeuronId(path);
    newPath = `${CONTEXT_PATH}/${newContext}/neuron/${neuronId}`;
  }
  // Check if the path is a context path and perform the change
  if (isContextPath(path)) {
    const contextDetails = getContextDetailsFromPath(path);
    newPath = `${CONTEXT_PATH}/${newContext}${contextDetails}`;
  }
  return newPath;
};
