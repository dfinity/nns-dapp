import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { NNS_TOKEN } from "$lib/constants/tokens.constants";
import {
  ckBTCTokenFeeStore,
  ckBTCTokenStore,
  nnsTokenStore,
} from "$lib/derived/universes-tokens.derived";
import { tokensStore } from "$lib/stores/tokens.store";
import { mockCkBTCToken } from "$tests/mocks/ckbtc-accounts.mock";
import {
  mockTokensSubscribe,
  mockUniversesTokens,
} from "$tests/mocks/tokens.mock";
import { TokenAmountV2 } from "@dfinity/utils";
import { get } from "svelte/store";

describe("universes-tokens", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("complete data set", () => {
    beforeEach(() => {
      vi.spyOn(tokensStore, "subscribe").mockImplementation(
        mockTokensSubscribe(mockUniversesTokens)
      );
    });

    it("should derive Nns token only", () => {
      const token = get(nnsTokenStore);
      expect(token).toEqual(NNS_TOKEN);
    });

    it("should derive ckBTC token only", () => {
      const token = get(ckBTCTokenStore);

      const expectedToken = {
        token: mockCkBTCToken,
        certified: true,
      };

      expect(token).toEqual({
        [CKBTC_UNIVERSE_CANISTER_ID.toText()]: expectedToken,
        [CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]: expectedToken,
      });
    });

    it("should derive ckBTC token fee", () => {
      const tokenFee = get(ckBTCTokenFeeStore);

      const expectedFee = TokenAmountV2.fromUlps({
        amount: mockCkBTCToken.fee,
        token: {
          name: mockCkBTCToken.name,
          symbol: mockCkBTCToken.symbol,
          decimals: mockCkBTCToken.decimals,
        },
      });

      expect(tokenFee).toEqual({
        [CKBTC_UNIVERSE_CANISTER_ID.toText()]: expectedFee,
        [CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]: expectedFee,
      });
    });
  });

  describe("ckBTC empty", () => {
    beforeEach(() => {
      vi.spyOn(tokensStore, "subscribe").mockImplementation(
        mockTokensSubscribe({
          [OWN_CANISTER_ID.toText()]: NNS_TOKEN,
        })
      );
    });

    it("should derive no ckBTC token", () => {
      const token = get(ckBTCTokenStore);

      expect(token).toEqual({
        [CKBTC_UNIVERSE_CANISTER_ID.toText()]: undefined,
        [CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]: undefined,
      });
    });
  });
});
