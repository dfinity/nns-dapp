import {
  CKETH_INDEX_CANISTER_ID,
  CKETH_LEDGER_CANISTER_ID,
  CKETH_UNIVERSE_CANISTER_ID,
} from "$lib/constants/cketh-canister-ids.constants";
import { defaultIcrcCanistersStore } from "$lib/stores/default-icrc-canisters.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { mockCkETHToken } from "$tests/mocks/cketh-accounts.mock";

export const setCkETHCanisters = () => {
  defaultIcrcCanistersStore.setCanisters({
    ledgerCanisterId: CKETH_LEDGER_CANISTER_ID,
    indexCanisterId: CKETH_INDEX_CANISTER_ID,
  });
  tokensStore.setToken({
    canisterId: CKETH_UNIVERSE_CANISTER_ID,
    token: mockCkETHToken,
  });
};

export const resetCkETHCanisters = () => {
  defaultIcrcCanistersStore.reset();
  tokensStore.reset();
};
