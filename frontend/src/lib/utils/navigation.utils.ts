import {
  ACCOUNT_PARAM,
  AppPath,
  CANISTER_PARAM,
  NEURON_PARAM,
  PROPOSAL_PARAM,
  UNIVERSE_PARAM,
} from "$lib/constants/routes.constants";
import type { NeuronId, ProposalId } from "@dfinity/nns";
import { isArrayEmpty } from "./utils";

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
}

const buildUrl = ({
  path,
  universe,
  params = {},
}: {
  path: AppPath;
  universe: string;
  params?: Record<string, string>;
}): string =>
  `${path}/?${UNIVERSE_PARAM}=${universe}${Object.entries(params)
    .map(([key, value]) => `&${key}=${value}`)
    .join("")}`;

export const buildAccountsUrl = ({ universe }: { universe: string }) =>
  buildUrl({ path: AppPath.Accounts, universe });
export const buildNeuronsUrl = ({ universe }: { universe: string }) =>
  buildUrl({ path: AppPath.Neurons, universe });
export const buildProposalsUrl = ({ universe }: { universe: string }) =>
  buildUrl({ path: AppPath.Proposals, universe });
export const buildCanistersUrl = ({ universe }: { universe: string }) =>
  buildUrl({ path: AppPath.Canisters, universe });

export const buildWalletUrl = ({
  universe,
  account,
}: {
  universe: string;
  account: string;
}): string =>
  buildUrl({
    path: AppPath.Wallet,
    universe,
    params: { [ACCOUNT_PARAM]: account },
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
}: {
  universe: string;
  proposalId: ProposalId | string;
}): string =>
  buildUrl({
    path: AppPath.Proposal,
    universe,
    params: { [PROPOSAL_PARAM]: `${proposalId}` },
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
