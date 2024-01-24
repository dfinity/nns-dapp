import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { tokensStore } from "$lib/stores/tokens.store";
import { TokenAmount, isNullish } from "@dfinity/utils";
import { derived } from "svelte/store";

export const mainTransactionFeeStoreAsToken = derived(tokensStore, ($store) => {
  const icpToken = $store[OWN_CANISTER_ID_TEXT].token;
  if (isNullish(icpToken)) {
    // This can't happen because the tokensStore always contains the NNS token.
    throw new Error("ICP token not found");
  }
  return TokenAmount.fromE8s({ amount: icpToken.fee, token: icpToken });
});
