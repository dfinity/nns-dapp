import { defaultIcrcCanistersStore } from "$lib/stores/default-icrc-canisters.store";
import { importedTokensStore } from "$lib/stores/imported-tokens.store";
import type { UniverseCanisterIdText } from "$lib/types/universe";
import type { Principal } from "@dfinity/principal";
import { derived, type Readable } from "svelte/store";

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
      ...Object.fromEntries(
        importedTokensStore?.importedTokens?.map(
          ({ ledgerCanisterId, indexCanisterId }) => [
            ledgerCanisterId.toText(),
            { ledgerCanisterId, indexCanisterId },
          ]
        ) ?? []
      ),
    };
  }
);
