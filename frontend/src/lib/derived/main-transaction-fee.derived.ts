import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
import { tokensStore } from "$lib/stores/tokens.store";
import { TokenAmount, isNullish } from "@dfinity/utils";
import { derived } from "svelte/store";

export const mainTransactionFeeStoreAsToken = derived(tokensStore, ($store) => {
  const icpToken = $store[OWN_CANISTER_ID_TEXT].token;
  if (isNullish(icpToken)) {
    return TokenAmount.fromE8s({
      amount: NNS_TOKEN_DATA.fee,
      token: NNS_TOKEN_DATA,
    });
  }
  return TokenAmount.fromE8s({ amount: icpToken.fee, token: icpToken });
});
