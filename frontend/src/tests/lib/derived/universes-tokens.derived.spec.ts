import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { NNS_TOKEN } from "$lib/constants/tokens.constants";
import {
  ckBTCTokenStore,
  nnsTokenStore,
} from "$lib/derived/universes-tokens.derived";
import { tokensStore } from "$lib/stores/tokens.store";
import { get } from "svelte/store";
import { mockCkBTCToken } from "../../mocks/ckbtc-accounts.mock";
import {
  mockTokensSubscribe,
  mockUniversesTokens,
} from "../../mocks/tokens.mock";

describe("universes-tokens.derived.spec", () => {
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

      expect(token).toEqual({
        token: mockCkBTCToken,
        certified: true,
      });
    });
  });

  describe("ckBTC", () => {
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

      expect(token).toBeUndefined();
    });
  });
});
