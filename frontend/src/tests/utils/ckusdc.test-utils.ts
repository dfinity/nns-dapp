import {
  CKUSDC_INDEX_CANISTER_ID,
  CKUSDC_LEDGER_CANISTER_ID,
  CKUSDC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckusdc-canister-ids.constants";
import { defaultIcrcCanistersStore } from "$lib/stores/default-icrc-canisters.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { mockCkUSDCToken } from "$tests/mocks/tokens.mock";

export const setCkUSDCCanisters = () => {
  defaultIcrcCanistersStore.setCanisters({
    ledgerCanisterId: CKUSDC_LEDGER_CANISTER_ID,
    indexCanisterId: CKUSDC_INDEX_CANISTER_ID,
  });
  tokensStore.setToken({
    canisterId: CKUSDC_UNIVERSE_CANISTER_ID,
    token: mockCkUSDCToken,
  });
};
