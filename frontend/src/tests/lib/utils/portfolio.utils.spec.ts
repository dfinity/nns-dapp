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

    const mockIcpToken = createIcpUserToken({});

    const mockCkBTCToken = createUserToken({
      universeId: CKBTC_UNIVERSE_CANISTER_ID,
    });

    const mockCkUSDCToken = createUserToken({
      universeId: CKUSDC_UNIVERSE_CANISTER_ID,
    });

    const mockOtherToken = createUserToken({
      universeId: principal(1),
    });

    it("should exclude non-UserTokenData tokens", () => {
      const tokens: UserToken[] = [
        mockIcpToken,
        mockOtherToken,
        mockCkUSDCToken,
        mockCkBTCToken,
        mockNonUserToken,
      ];

      const result = getTopTokens({ userTokens: tokens });

      expect(result).toHaveLength(4);
      expect(result).not.toContainEqual(mockNonUserToken);
    });

    it("should respect the result limit", () => {
      const tokens: UserToken[] = [
        mockIcpToken,
        mockOtherToken,
        mockCkUSDCToken,
        mockCkBTCToken,
        mockNonUserToken,
      ];
      const result = getTopTokens({
        userTokens: tokens,
        maxResults: 3,
      });

      expect(result).toHaveLength(3);
    });

    it("should order tokens: ICP first, then ckBTC/ckUSDC, then others", () => {
      const tokens: UserToken[] = [
        mockOtherToken,
        mockCkUSDCToken,
        mockCkBTCToken,
        mockNonUserToken,
        mockIcpToken,
      ];
      const result = getTopTokens({ userTokens: tokens });

      expect(result).toEqual([
        mockIcpToken,
        mockCkBTCToken,
        mockCkUSDCToken,
        mockOtherToken,
      ]);
    });

    describe("when signed in", () => {
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

      it("should exclude tokens with zero balance", () => {
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
          isSignedIn: true,
        });

        expect(result).toHaveLength(4);
        expect(result).not.toContainEqual(mockZeroBalanceUserTokenData);
      });

      it("should order tokens: ICP first, then by descending USD balance", () => {
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
          isSignedIn: true,
        });

        expect(result).toEqual([
          mockIcpToken, // 100$
          mockOtherToken, // 2000$
          mockCkUSDCToken, // 1000$
          mockCkBTCToken, // 10$
        ]);
      });

      it("should return empty array when all tokens have zero balance", () => {
        const mockIcpToken = createIcpUserToken({ balanceInUsd: 0 });
        const tokens: UserToken[] = [
          mockZeroBalanceUserTokenData,
          mockIcpToken,
        ];
        const result = getTopTokens({
          userTokens: tokens,
          isSignedIn: true,
        });

        expect(result).toHaveLength(0);
      });
    });
  });
});
