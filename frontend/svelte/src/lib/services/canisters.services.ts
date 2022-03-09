import type { Identity } from "@dfinity/agent";
import { get } from "svelte/store";
import { NNSDappCanister } from "../canisters/nns-dapp/nns-dapp.canister";
import type { CanisterDetails } from "../canisters/nns-dapp/nns-dapp.types";
import { OWN_CANISTER_ID } from "../constants/canister-ids.constants";
import { identityServiceURL } from "../constants/identity.constants";
import { canistersStore } from "../stores/canisters.store";
import { i18n } from "../stores/i18n";
import { createAgent } from "../utils/agent.utils";

export const listCanisters = async ({
  clearBeforeQuery,
  identity,
}: {
  clearBeforeQuery?: boolean;
  identity: Identity | null | undefined;
}) => {
  if (clearBeforeQuery === true) {
    canistersStore.setCanisters([]);
  }

  const canisters: CanisterDetails[] = await queryCanisters({
    identity,
  });

  canistersStore.setCanisters(canisters);
};

const queryCanisters = async ({
  identity,
}: {
  identity: Identity | null | undefined;
}): Promise<CanisterDetails[]> => {
  if (!identity) {
    // TODO: https://dfinity.atlassian.net/browse/L2-346
    throw new Error(get(i18n).error.missing_identity);
  }

  const agent = await createAgent({ identity, host: identityServiceURL });
  // ACCOUNTS
  const nnsDapp: NNSDappCanister = NNSDappCanister.create({
    agent,
    canisterId: OWN_CANISTER_ID,
  });

  return nnsDapp.getCanisters({ certified: true });
};
