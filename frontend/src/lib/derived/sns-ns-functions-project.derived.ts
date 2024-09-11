import {
  snsFunctionsStore,
  type SnsNervousSystemFunctionsStore,
} from "$lib/derived/sns-functions.derived";
import type { Principal } from "@dfinity/principal";
import type { SnsNervousSystemFunction } from "@dfinity/sns";
import { isNullish, nonNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

export type SnsNervousSystemFunctionsProjectStore = Readable<
  SnsNervousSystemFunction[] | undefined
>;

export const createSnsNsFunctionsProjectStore = (
  rootCanisterId: Principal | null | undefined
): SnsNervousSystemFunctionsProjectStore =>
  derived<
    SnsNervousSystemFunctionsStore,
    SnsNervousSystemFunction[] | undefined
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
