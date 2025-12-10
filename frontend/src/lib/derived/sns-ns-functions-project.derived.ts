import {
  snsFunctionsStore,
  type SnsNervousSystemFunctionsStore,
} from "$lib/derived/sns-functions.derived";
import { isNullish, nonNullish } from "@dfinity/utils";
import type { SnsGovernanceDid } from "@icp-sdk/canisters/sns";
import type { Principal } from "@icp-sdk/core/principal";
import { derived, type Readable } from "svelte/store";

export type SnsNervousSystemFunctionsProjectStore = Readable<
  SnsGovernanceDid.NervousSystemFunction[] | undefined
>;

export const createSnsNsFunctionsProjectStore = (
  rootCanisterId: Principal | null | undefined
): SnsNervousSystemFunctionsProjectStore =>
  derived<
    SnsNervousSystemFunctionsStore,
    SnsGovernanceDid.NervousSystemFunction[] | undefined
  >(snsFunctionsStore, (snsFunctions) => {
    if (isNullish(rootCanisterId)) {
      return undefined;
    }
    const rootCanisterIdText = rootCanisterId.toText();
    if (nonNullish(snsFunctions[rootCanisterIdText])) {
      return snsFunctions[rootCanisterIdText].nsFunctions;
    }
    return undefined;
  });
