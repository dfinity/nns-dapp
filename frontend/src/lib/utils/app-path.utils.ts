import { ENABLE_SNS, ENABLE_SNS_2 } from "$lib/constants/environment.constants";
import { AppPath, CONTEXT_PATH } from "$lib/constants/routes.constants";
import { routePathAccountIdentifier } from "$lib/services/accounts.services";
import { routePathNeuronId } from "$lib/services/neurons.services";

const IDENTIFIER_REGEX = "[a-zA-Z0-9-]+";

const mapper: Record<string, string> = {
  // exceptions only
  [AppPath.LegacyWallet]: `${AppPath.LegacyWallet}/${IDENTIFIER_REGEX}`,
  [AppPath.Wallet]: `${CONTEXT_PATH}/${IDENTIFIER_REGEX}/wallet/${IDENTIFIER_REGEX}`,
  [AppPath.ProposalDetail]: `${AppPath.ProposalDetail}/[0-9]+`,
  [AppPath.LegacyNeuronDetail]: `${AppPath.LegacyNeuronDetail}/[0-9]+`,
  [AppPath.Neurons]: `${CONTEXT_PATH}/${IDENTIFIER_REGEX}/neurons`,
  [AppPath.Accounts]: `${CONTEXT_PATH}/${IDENTIFIER_REGEX}/accounts`,
  [AppPath.CanisterDetail]: `${AppPath.CanisterDetail}/${IDENTIFIER_REGEX}`,
  [AppPath.ProjectDetail]: `${AppPath.ProjectDetail}/${IDENTIFIER_REGEX}`,
  [AppPath.NeuronDetail]: `${CONTEXT_PATH}/${IDENTIFIER_REGEX}/neuron/${IDENTIFIER_REGEX}`,
};

/**
 * Helpers to build the paths for the app.
 * It interpolates the context and returns the path.
 */
export const paths = {
  neuronDetail: (rootCanisterId: string) =>
    ENABLE_SNS
      ? `${CONTEXT_PATH}/${rootCanisterId}/neuron`
      : AppPath.LegacyNeuronDetail,
  neurons: (rootCanisterId: string) =>
    ENABLE_SNS
      ? `${CONTEXT_PATH}/${rootCanisterId}/neurons`
      : AppPath.LegacyNeurons,
  accounts: (rootCanisterId: string) =>
    ENABLE_SNS_2
      ? `${CONTEXT_PATH}/${rootCanisterId}/accounts`
      : AppPath.LegacyAccounts,
  wallet: (rootCanisterId: string) =>
    ENABLE_SNS_2
      ? `${CONTEXT_PATH}/${rootCanisterId}/wallet`
      : AppPath.LegacyWallet,
};

const pathValidation = (path: AppPath): string => mapper[path] ?? path;

export const isAppPath = (routePath: string): routePath is AppPath =>
  isRoutePath({ paths: Object.values(AppPath), routePath });

export const isRoutePath = ({
  paths,
  routePath,
}: {
  paths: AppPath[];
  routePath?: string;
}): boolean =>
  routePath !== undefined
    ? paths.some((path) =>
        new RegExp(`^${pathValidation(path)}$`).test(routePath)
      )
    : false;

const contextPathRegex = new RegExp(`^${CONTEXT_PATH}/${IDENTIFIER_REGEX}`);

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
 * Checks whether the path is a legacy context path.
 * Returns a new path with the new context path if it is a legacy context path.
 * Returns same path if not a legacy context path.
 * This needs to be updated when we support more legacy context paths.
 *
 * Ex: `/#/neurons` becomes `/#/u/bbbbb-bb/neurons`
 *
 * @param path string - the path to change
 * @param newContext string - the new context to navigate to
 * @returns newPath string
 */
const checkContextPathExceptions = ({
  path,
  newContext,
}: {
  path: string;
  newContext: string;
}): string => {
  if (isRoutePath({ paths: [AppPath.LegacyNeurons], routePath: path })) {
    return `${CONTEXT_PATH}/${newContext}/neurons`;
  }
  if (isRoutePath({ paths: [AppPath.LegacyAccounts], routePath: path })) {
    return `${CONTEXT_PATH}/${newContext}/accounts`;
  }
  if (
    isRoutePath({
      paths: [AppPath.LegacyNeuronDetail],
      routePath: path,
    })
  ) {
    const neuronId = routePathNeuronId(path);
    return `${CONTEXT_PATH}/${newContext}/neuron/${neuronId}`;
  }
  if (
    isRoutePath({
      paths: [AppPath.LegacyWallet],
      routePath: path,
    })
  ) {
    const routeAccountIdentifier = routePathAccountIdentifier(path);
    if (routeAccountIdentifier !== undefined) {
      return `${CONTEXT_PATH}/${newContext}/wallet/${routeAccountIdentifier.accountIdentifier}`;
    }
  }
  // Returns same path if no exception
  return path;
};

/**
 * Returns a new path with the new context.
 * Doesn't do anything if the current path is not a context path.
 *
 * When called with `bbbbb-bb`
 * Ex: `/#/u/aaaaa-aa/neurons` becomes `/#/u/bbbbb-bb/neurons`
 * Ex: `/#/u/aaaaa-aa/account/1234` becomes `/#/u/bbbbb-bb/account/1234`
 * Ex: `/#/neurons` becomes `/#/u/bbbbb-bb/neurons`
 * Ex: `/#/neuron/1234` becomes `/#/u/bbbbb-bb/neuron/1234`
 * Ex: `/#/proposals` does nothing because `/#/proposals` is not a context path
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
  // Check exceptions or return same path
  let newPath = checkContextPathExceptions({ path, newContext });
  // Check if the path is a context path and perform the change
  if (isContextPath(path)) {
    const contextDetails = getContextDetailsFromPath(path);
    newPath = `${CONTEXT_PATH}/${newContext}${contextDetails}`;
  }
  return newPath;
};
