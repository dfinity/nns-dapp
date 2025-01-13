import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
import { snsSelectedTransactionFeeStore } from "$lib/derived/sns/sns-selected-transaction-fee.store";
import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
import type { Principal } from "@dfinity/principal";
import type { Token, TokenAmount } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

interface SnsNewTxData {
  token: Token;
  rootCanisterId: Principal;
  transactionFee: TokenAmount;
}

export const snsSelectedProjectNewTxData: Readable<SnsNewTxData | undefined> =
  derived(
    [
      snsTokenSymbolSelectedStore,
      selectedUniverseIdStore,
      snsSelectedTransactionFeeStore,
    ],
    ([
      $snsTokenSymbolSelectedStore,
      $snsProjectIdSelectedStore,
      $snsSelectedTransactionFeeStore,
    ]) => {
      if (
        $snsTokenSymbolSelectedStore !== undefined &&
        $snsProjectIdSelectedStore !== undefined &&
        $snsSelectedTransactionFeeStore !== undefined
      ) {
        return {
          token: $snsTokenSymbolSelectedStore,
          rootCanisterId: $snsProjectIdSelectedStore,
          transactionFee: $snsSelectedTransactionFeeStore,
        };
      }
    }
  );
