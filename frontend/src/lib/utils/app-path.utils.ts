import { AppPathLegacy, CONTEXT_PATH } from "$lib/constants/routes.constants";

const IDENTIFIER_REGEX = "[a-zA-Z0-9-]+";

const mapper: Record<string, string> = {
  // exceptions only
  [AppPathLegacy.ProposalDetail]: `${AppPathLegacy.ProposalDetail}/[0-9]+`,
  [AppPathLegacy.CanisterDetail]: `${AppPathLegacy.CanisterDetail}/${IDENTIFIER_REGEX}`,
  [AppPathLegacy.ProjectDetail]: `${AppPathLegacy.ProjectDetail}/${IDENTIFIER_REGEX}`,
  [AppPathLegacy.NeuronDetail]: `${CONTEXT_PATH}/${IDENTIFIER_REGEX}/neuron/${IDENTIFIER_REGEX}`,
};

const pathValidation = (path: AppPathLegacy): string => mapper[path] ?? path;

export const isAppPath = (routePath: string): routePath is AppPathLegacy =>
  isRoutePath({ paths: Object.values(AppPathLegacy), routePath });

export const isRoutePath = ({
  paths,
  routePath,
}: {
  paths: AppPathLegacy[];
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
  // TODO(GIX-1071): clean up and edge cases

  const [u, canisterId, context] =
    path
      ?.replace(/\/+$/, "")
      .split("/")
      .filter((path) => path !== "") ?? [];
  // Do not return empty strings
  return canisterId === "" ? undefined : canisterId;
};
