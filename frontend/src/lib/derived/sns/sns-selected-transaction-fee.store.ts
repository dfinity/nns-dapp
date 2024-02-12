import { snsTokensByRootCanisterIdStore } from "$lib/derived/sns/sns-tokens.derived";
import { TokenAmount, nonNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";
import { snsOnlyProjectStore } from "./sns-selected-project.derived";

export const snsSelectedTransactionFeeStore: Readable<TokenAmount | undefined> =
  derived(
    [snsOnlyProjectStore, snsTokensByRootCanisterIdStore],
    ([selectedRootCanisterId, tokensStore]) => {
      const selectedToken = nonNullish(selectedRootCanisterId)
        ? tokensStore[selectedRootCanisterId.toText()]
        : undefined;
      if (nonNullish(selectedToken)) {
        return TokenAmount.fromE8s({
          amount: selectedToken.fee,
          token: selectedToken,
        });
      }
    }
  );
