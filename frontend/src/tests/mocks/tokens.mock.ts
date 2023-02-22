import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { NNS_TOKEN } from "$lib/constants/tokens.constants";
import type { TokensStoreData } from "$lib/stores/tokens.store";
import type { Subscriber } from "svelte/store";
import { mockCkBTCToken } from "./ckbtc-accounts.mock";
import { mockSnsFullProject, mockSnsToken } from "./sns-projects.mock";

export const mockTokens = {
  [CKBTC_UNIVERSE_CANISTER_ID.toText()]: {
    token: mockCkBTCToken,
    certified: true,
  },
  [CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]: {
    token: mockCkBTCToken,
    certified: true,
  },
  [mockSnsFullProject.rootCanisterId.toText()]: {
    token: mockSnsToken,
    certified: true,
  },
};

export const mockUniversesTokens = {
  [OWN_CANISTER_ID.toText()]: NNS_TOKEN,
  ...mockTokens,
};

export const mockTokensSubscribe =
  (tokens: TokensStoreData) =>
  (run: Subscriber<TokensStoreData>): (() => void) => {
    run(tokens);

    return () => undefined;
  };
