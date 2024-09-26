import { loadedImportedTokensStore } from "$lib/derived/imported-tokens.derived";
import { defaultIcrcCanistersStore } from "$lib/stores/default-icrc-canisters.store";
import type { UniverseCanisterIdText } from "$lib/types/universe";
import { Principal } from "@dfinity/principal";
import { derived, type Readable } from "svelte/store";
import { pageStore } from "./page.derived";

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
  [defaultIcrcCanistersStore, loadedImportedTokensStore, pageStore],
  ([
    defaultIcrcCanisters,
    loadedImportedTokens,
    { universe: universeCanisterIdText },
  ]) => {
    const canisters = {
      ...defaultIcrcCanisters,
      ...Object.fromEntries(
        loadedImportedTokens.map(({ ledgerCanisterId, indexCanisterId }) => [
          ledgerCanisterId.toText(),
          { ledgerCanisterId, indexCanisterId },
        ])
      ),
    };

    try {
      const universeCanisterId = Principal.fromText(universeCanisterIdText);
      if (!canisters[universeCanisterIdText]) {
        canisters[universeCanisterIdText] = {
          ledgerCanisterId: universeCanisterId,
          indexCanisterId: undefined,
        };
      }
    } catch (error: unknown) {
      console.error("Error parsing universe canister id", error);
    }

    return canisters;
  }
);
