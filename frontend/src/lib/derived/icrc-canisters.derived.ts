import { defaultIcrcCanistersStore } from "$lib/stores/default-icrc-canisters.store";
import type { UniverseCanisterIdText } from "$lib/types/universe";
import type { Principal } from "@dfinity/principal";
import { derived, type Readable } from "svelte/store";
import { importedTokensStore } from "../stores/imported-tokens.store";

export interface IcrcCanisters {
  ledgerCanisterId: Principal;
  indexCanisterId: Principal | undefined;
}

export type IcrcCanistersStoreData = Record<
  UniverseCanisterIdText,
  IcrcCanisters
>;

export type IcrcCanistersStore = Readable<IcrcCanistersStoreData>;

export const icrcCanistersStore: IcrcCanistersStore = derived(
  [defaultIcrcCanistersStore, importedTokensStore],
  ([defaultIcrcCanisters, importedTokensStore]) => {
    return {
      ...defaultIcrcCanisters,
      ...importedTokensStore?.importedTokens?.reduce(
        (acc, { ledgerCanisterId, indexCanisterId }) => ({
          ...acc,
          [ledgerCanisterId.toText()]: {
            ledgerCanisterId,
            indexCanisterId,
          },
        }),
        {}
      ),
    };
  }
);
