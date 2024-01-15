import { tokensStore } from "$lib/stores/tokens.store";
import { TokenAmount, nonNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";
import { snsOnlyProjectStore } from "./sns-selected-project.derived";

export const snsSelectedTransactionFeeStore: Readable<TokenAmount | undefined> =
  derived(
    [snsOnlyProjectStore, tokensStore],
    ([selectedRootCanisterId, tokensStore]) => {
      const selectedToken = nonNullish(selectedRootCanisterId)
        ? tokensStore[selectedRootCanisterId.toText()]?.token
        : undefined;
      if (nonNullish(selectedToken)) {
        return TokenAmount.fromE8s({
          amount: selectedToken.fee,
          token: selectedToken,
        });
      }
    }
  );
