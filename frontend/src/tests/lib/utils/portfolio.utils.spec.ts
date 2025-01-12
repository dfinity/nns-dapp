import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import type { UserToken } from "$lib/types/tokens-page";
import { getTopTokens } from "$lib/utils/portfolio.utils";
import { principal } from "$tests/mocks/sns-projects.mock";
import {
  createIcpUserToken,
  createUserToken,
  createUserTokenLoading,
} from "$tests/mocks/tokens-page.mock";

describe("Portfolio utils", () => {
  describe("getTopTokens", () => {
    const mockNonUserToken = createUserTokenLoading();

    const mockIcpToken = createIcpUserToken({
      balanceInUsd: 0,
    });

    const mockCkBTCToken = createUserToken({
      universeId: CKBTC_UNIVERSE_CANISTER_ID,
      balanceInUsd: 0,
    });

    const mockCkUSDCToken = createUserToken({
      universeId: CKUSDC_UNIVERSE_CANISTER_ID,
      balanceInUsd: 0,
    });

    const mockOtherToken = createUserToken({
      universeId: principal(1),
      balanceInUsd: 0,
    });

    it("should filter out non UserTokenData", () => {
      const tokens: UserToken[] = [
        mockIcpToken,
        mockOtherToken,
        mockCkUSDCToken,
        mockCkBTCToken,
        mockNonUserToken,
      ];

      const result = getTopTokens({
        userTokens: tokens,
        maxTokensToShow: 10,
      });

      expect(result).toHaveLength(4);
      expect(result).not.toContainEqual(mockNonUserToken);
    });

    it("should limit output to maxTokensToShow", () => {
      const tokens: UserToken[] = [
        mockIcpToken,
        mockOtherToken,
        mockCkUSDCToken,
        mockCkBTCToken,
        mockNonUserToken,
      ];
      const result = getTopTokens({
        userTokens: tokens,
        maxTokensToShow: 3,
      });

      expect(result).toHaveLength(3);
    });

    it("should prioritize ICP token, then important tokens, then rest", () => {
      const tokens: UserToken[] = [
        mockOtherToken,
        mockCkUSDCToken,
        mockCkBTCToken,
        mockNonUserToken,
        mockIcpToken,
      ];
      const result = getTopTokens({
        userTokens: tokens,
        maxTokensToShow: 10,
      });

      expect(result).toHaveLength(4);
      expect(result).toEqual([
        mockIcpToken,
        mockCkBTCToken,
        mockCkUSDCToken,
        mockOtherToken,
      ]);
    });

    describe("when sign in", () => {
      const mockIcpToken = createIcpUserToken({
        balanceInUsd: 100,
      });

      const mockCkBTCToken = createUserToken({
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
        balanceInUsd: 10,
      });

      const mockCkUSDCToken = createUserToken({
        universeId: CKUSDC_UNIVERSE_CANISTER_ID,
        balanceInUsd: 1000,
      });

      const mockOtherToken = createUserToken({
        universeId: principal(1),
        balanceInUsd: 2000,
      });

      const mockZeroBalanceUserTokenData = createUserToken({
        universeId: principal(2),
        balanceInUsd: 0,
      });

      it("should filter out zero balance tokens", () => {
        const tokens: UserToken[] = [
          mockZeroBalanceUserTokenData,
          mockOtherToken,
          mockCkUSDCToken,
          mockCkBTCToken,
          mockNonUserToken,
          mockIcpToken,
        ];
        const result = getTopTokens({
          userTokens: tokens,
          maxTokensToShow: 6,
          isSignedIn: true,
        });

        expect(result).toHaveLength(4);
        expect(result).not.toContainEqual(mockZeroBalanceUserTokenData);
      });

      it("should prioritize ICP token, then sort by balance", () => {
        const tokens: UserToken[] = [
          mockOtherToken,
          mockCkUSDCToken,
          mockCkBTCToken,
          mockNonUserToken,
          mockZeroBalanceUserTokenData,
          mockIcpToken,
        ];
        const result = getTopTokens({
          userTokens: tokens,
          maxTokensToShow: 10,
          isSignedIn: true,
        });

        expect(result).toHaveLength(4);
        expect(result).toEqual([
          mockIcpToken,
          mockOtherToken,
          mockCkUSDCToken,
          mockCkBTCToken,
        ]);
      });
    });
  });
});
