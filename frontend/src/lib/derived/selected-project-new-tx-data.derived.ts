import type { Token, TokenAmount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { derived, type Readable } from "svelte/store";
import { selectedUniverseIdStore } from "./selected-universe.derived";
import { snsSelectedTransactionFeeStore } from "./sns/sns-selected-transaction-fee.store";
import { snsTokenSymbolSelectedStore } from "./sns/sns-token-symbol-selected.store";

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
