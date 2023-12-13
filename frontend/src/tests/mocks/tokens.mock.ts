import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import {
  CKETHSEPOLIA_UNIVERSE_CANISTER_ID,
  CKETH_UNIVERSE_CANISTER_ID,
} from "$lib/constants/cketh-canister-ids.constants";
import { NNS_TOKEN } from "$lib/constants/tokens.constants";
import type { TokensStoreData } from "$lib/stores/tokens.store";
import {
  mockCkETHTESTToken,
  mockCkETHToken,
} from "$tests/mocks/cketh-accounts.mock";
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
  [CKETH_UNIVERSE_CANISTER_ID.toText()]: {
    token: mockCkETHToken,
    certified: true,
  },
  [CKETHSEPOLIA_UNIVERSE_CANISTER_ID.toText()]: {
    token: mockCkETHTESTToken,
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
