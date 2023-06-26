import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import { TokenAmount } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";
import { selectedUniverseIdStore } from "../selected-universe.derived";
import { snsTokenSymbolSelectedStore } from "./sns-token-symbol-selected.store";

// TS was not smart enough to infer the type of the stores, so we need to specify them
export const snsSelectedTransactionFeeStore: Readable<TokenAmount | undefined> =
  derived(
    [
      selectedUniverseIdStore,
      transactionsFeesStore,
      snsTokenSymbolSelectedStore,
    ],
    ([selectedRootCanisterId, feesStore, selectedToken]) => {
      const selectedFee =
        feesStore.projects[selectedRootCanisterId.toText()]?.fee;
      if (selectedFee !== undefined && selectedToken !== undefined) {
        return TokenAmount.fromE8s({
          amount: selectedFee,
          token: selectedToken,
        });
      }
    }
  );
