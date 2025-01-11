import {
  ACCOUNT_PARAM,
  ACTIONABLE_PROPOSALS_PARAM,
  AppPath,
  CANISTER_PARAM,
  NEURON_PARAM,
  PROPOSAL_PARAM,
  UNIVERSE_PARAM,
} from "$lib/constants/routes.constants";
import { isArrayEmpty } from "$lib/utils/utils";
import type { NeuronId, ProposalId } from "@dfinity/nns";
import { nonNullish } from "@dfinity/utils";

// If the previous page is a particular detail page and if we have data in store, we don't reset and query the data in store after the route is mounted.
// We do this to smoothness the back and forth navigation between the page and the detail page that have store that are not loaded at boot time.
export const reloadRouteData = <T>({
  expectedPreviousPath,
  effectivePreviousPath,
  currentData,
}: {
  expectedPreviousPath: AppPath;
  effectivePreviousPath: AppPath | undefined;
  currentData: T[] | undefined;
}): boolean => {
  const isRoutePath = (): boolean =>
    effectivePreviousPath !== undefined &&
    effectivePreviousPath === expectedPreviousPath;

  const isReferrerDetail = isRoutePath();

  return isArrayEmpty(currentData ?? []) || !isReferrerDetail;
};

export const buildSwitchUniverseUrl = (universe: string): string => {
  const { pathname } = window.location;
  return `${pathname}?${UNIVERSE_PARAM}=${universe}`;
};

const appendParams = ({
  path,
  params = {},
}: {
  path: string;
  params?: Record<string, string>;
}) => {
  const queryString = Object.entries(params)
    // Handling empty values: if the value is empty, we only append the key for the esthetic of the URL.
    .map(([key, value]) =>
      value === "" ? key : `${key}=${encodeURIComponent(value)}`
    )
    .join("&");
  return queryString ? `${path}/?${queryString}` : path;
};

const buildUrl = ({
  path,
  universe,
  params = {},
}: {
  path: AppPath;
  universe?: string;
  params?: Record<string, string>;
}): string =>
  appendParams({
    path,
    params: {
      ...(universe ? { [UNIVERSE_PARAM]: universe } : {}),
      ...params,
    },
  });

export const buildAccountsUrl = ({ universe }: { universe: string }) =>
  buildUrl({ path: AppPath.Accounts, universe });
export const buildNeuronsUrl = ({ universe }: { universe: string }) =>
  buildUrl({ path: AppPath.Neurons, universe });
export const buildProposalsUrl = ({ universe }: { universe: string }) =>
  buildUrl({ path: AppPath.Proposals, universe });
export const ACTIONABLE_PROPOSALS_URL = buildUrl({
  path: AppPath.Proposals,
  params: { [ACTIONABLE_PROPOSALS_PARAM]: "" },
});
export const buildCanistersUrl = ({ universe }: { universe: string }) =>
  buildUrl({ path: AppPath.Canisters, universe });

export const buildWalletUrl = ({
  universe,
  account,
}: {
  universe: string;
  account?: string;
}): string =>
  buildUrl({
    path: AppPath.Wallet,
    universe,
    params: nonNullish(account) ? { [ACCOUNT_PARAM]: account } : undefined,
  });

export const buildNeuronUrl = ({
  universe,
  neuronId,
}: {
  universe: string;
  neuronId: NeuronId | string;
}): string =>
  buildUrl({
    path: AppPath.Neuron,
    universe,
    params: { [NEURON_PARAM]: `${neuronId}` },
  });

export const buildProposalUrl = ({
  universe,
  proposalId,
  actionable,
}: {
  universe: string;
  proposalId: ProposalId | string;
  actionable?: boolean;
}): string =>
  buildUrl({
    path: AppPath.Proposal,
    universe,
    params: {
      [PROPOSAL_PARAM]: `${proposalId}`,
      ...(actionable && { [ACTIONABLE_PROPOSALS_PARAM]: "" }),
    },
  });

export const buildCanisterUrl = ({
  universe,
  canister,
}: {
  universe: string;
  canister: string;
}): string =>
  buildUrl({
    path: AppPath.Canister,
    universe,
    params: { [CANISTER_PARAM]: canister },
  });

export const isSelectedPath = ({
  paths,
  currentPath,
}: {
  currentPath: AppPath | null;
  paths: (AppPath | null)[];
}): boolean => currentPath !== null && paths.includes(currentPath);
