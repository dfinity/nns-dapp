import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { tokensStore } from "$lib/stores/tokens.store";
import { TokenAmount, isNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

export const mainTransactionFeeStoreAsToken: Readable<TokenAmount> = derived(
  tokensStore,
  ($store) => {
    const icpToken = $store[OWN_CANISTER_ID_TEXT].token;
    if (isNullish(icpToken)) {
      // This can't happen because the tokensStore always contains the NNS token.
      throw new Error("ICP token not found");
    }
    return TokenAmount.fromE8s({ amount: icpToken.fee, token: icpToken });
  }
);

/**
 * @deprecated prefer mainTransactionFeeE8sStore to use e8s for amount of tokens instead of Number.
 */
export const mainTransactionFeeStore: Readable<number> = derived(
  tokensStore,
  ($store) => {
    const icpToken = $store[OWN_CANISTER_ID_TEXT]?.token;
    if (isNullish(icpToken)) {
      // This can't happen because the tokensStore always contains the NNS token.
      throw new Error("ICP token not found");
    }
    return Number(icpToken.fee);
  }
);

export const mainTransactionFeeE8sStore: Readable<bigint> = derived(
  tokensStore,
  ($store) => {
    const icpToken = $store[OWN_CANISTER_ID_TEXT]?.token;
    if (isNullish(icpToken)) {
      // This can't happen because the tokensStore always contains the NNS token.
      throw new Error("ICP token not found");
    }
    return icpToken.fee;
  }
);
