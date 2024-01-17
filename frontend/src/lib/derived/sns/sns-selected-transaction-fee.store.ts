import { tokensStore } from "$lib/stores/tokens.store";
import { TokenAmountV2, nonNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";
import { snsOnlyProjectStore } from "./sns-selected-project.derived";

export const snsSelectedTransactionFeeStore: Readable<
  TokenAmountV2 | undefined
> = derived(
  [snsOnlyProjectStore, tokensStore],
  ([selectedRootCanisterId, tokensStore]) => {
    const selectedToken = nonNullish(selectedRootCanisterId)
      ? tokensStore[selectedRootCanisterId.toText()]?.token
      : undefined;
    if (nonNullish(selectedToken)) {
      return TokenAmountV2.fromUlps({
        amount: selectedToken.fee,
        token: selectedToken,
      });
    }
  }
);
