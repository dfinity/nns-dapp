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
import { TokenAmount } from "@dfinity/utils";
import { get } from "svelte/store";

describe("universes-tokens", () => {
  describe("complete data set", () => {
    beforeAll(() => {
      jest
        .spyOn(tokensStore, "subscribe")
        .mockImplementation(mockTokensSubscribe(mockUniversesTokens));
    });

    afterAll(() => jest.clearAllMocks());

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

      const expectedFee = TokenAmount.fromE8s({
        amount: mockCkBTCToken.fee,
        token: {
          name: mockCkBTCToken.name,
          symbol: mockCkBTCToken.symbol,
        },
      });

      expect(tokenFee).toEqual({
        [CKBTC_UNIVERSE_CANISTER_ID.toText()]: expectedFee,
        [CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]: expectedFee,
      });
    });
  });

  describe("ckBTC empty", () => {
    beforeAll(() => {
      jest.spyOn(tokensStore, "subscribe").mockImplementation(
        mockTokensSubscribe({
          [OWN_CANISTER_ID.toText()]: NNS_TOKEN,
        })
      );
    });

    afterAll(() => jest.clearAllMocks());

    it("should derive no ckBTC token", () => {
      const token = get(ckBTCTokenStore);

      expect(token).toEqual({
        [CKBTC_UNIVERSE_CANISTER_ID.toText()]: undefined,
        [CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]: undefined,
      });
    });
  });
});
