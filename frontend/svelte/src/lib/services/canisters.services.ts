import type { Identity } from "@dfinity/agent";
import { get } from "svelte/store";
import { queryCanisters } from "../api/canisters.api";
import type { CanisterDetails } from "../canisters/nns-dapp/nns-dapp.types";
import { canistersStore } from "../stores/canisters.store";
import { i18n } from "../stores/i18n";

export const listCanisters = async ({
  clearBeforeQuery,
  identity,
}: {
  clearBeforeQuery?: boolean;
  identity: Identity | null | undefined;
}) => {
  if (!identity) {
    // TODO: https://dfinity.atlassian.net/browse/L2-346
    throw new Error(get(i18n).error.missing_identity);
  }

  if (clearBeforeQuery === true) {
    canistersStore.setCanisters([]);
  }

  const canisters: CanisterDetails[] = await queryCanisters({
    identity,
  });

  canistersStore.setCanisters(canisters);
};
