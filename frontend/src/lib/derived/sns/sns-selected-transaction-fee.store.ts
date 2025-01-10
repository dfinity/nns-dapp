import { snsOnlyProjectStore } from "$lib/derived/sns/sns-selected-project.derived";
import { snsTokensByRootCanisterIdStore } from "$lib/derived/sns/sns-tokens.derived";
import { TokenAmount, nonNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

export const snsSelectedTransactionFeeStore: Readable<TokenAmount | undefined> =
  derived(
    [snsOnlyProjectStore, snsTokensByRootCanisterIdStore],
    ([selectedRootCanisterId, snsTokensByRootCanisterId]) => {
      const selectedToken = nonNullish(selectedRootCanisterId)
        ? snsTokensByRootCanisterId[selectedRootCanisterId.toText()]
        : undefined;
      if (nonNullish(selectedToken)) {
        return TokenAmount.fromE8s({
          amount: selectedToken.fee,
          token: selectedToken,
        });
      }
    }
  );
