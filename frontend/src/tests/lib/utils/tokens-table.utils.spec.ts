import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { CKETH_UNIVERSE_CANISTER_ID } from "$lib/constants/cketh-canister-ids.constants";
import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import type { UserTokenData, UserTokenFailed } from "$lib/types/tokens-page";
import {
  compareFailedTokensLast,
  compareTokensAlphabetically,
  compareTokensByImportance,
  compareTokensIcpFirst,
  compareTokensWithBalanceOrImportedFirst,
} from "$lib/utils/tokens-table.utils";
import { principal } from "$tests/mocks/sns-projects.mock";
import {
  ckBTCTokenBase,
  createIcpUserToken,
  createUserToken,
  createUserTokenLoading,
} from "$tests/mocks/tokens-page.mock";
import { TokenAmountV2 } from "@dfinity/utils";

describe("tokens-table.utils", () => {
  const ckBTCToken = createUserToken({
    universeId: CKBTC_UNIVERSE_CANISTER_ID,
  });
  const ckETHTToken = createUserToken({
    universeId: CKETH_UNIVERSE_CANISTER_ID,
  });
  const ckUSDCToken = createUserToken({
    universeId: CKUSDC_UNIVERSE_CANISTER_ID,
  });
  const createTokenWithBalance = ({
    id,
    amount,
  }: {
    id: number;
    amount: bigint;
  }) =>
    createUserToken({
      universeId: principal(id),
      balance: TokenAmountV2.fromUlps({
        amount,
        token: {
          name: `T${id}`,
          symbol: `T${id}`,
          decimals: 8,
        },
      }),
    }) as UserTokenData;
  const importedTokenWithBalance = createTokenWithBalance({
    id: 2,
    amount: 1n,
  });
  const importedTokenNoBalance = createTokenWithBalance({
    id: 3,
    amount: 0n,
  });
  const failedImportedToken = {
    balance: "failed",
    universeId: principal(13),
    actions: [],
    domKey: "",
  } as UserTokenFailed;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("compareTokensIcpFirst", () => {
    it("should keep ICP first", () => {
      const icpToken = createIcpUserToken();
      const ckBTCUserToken = createUserToken(ckBTCTokenBase);

      expect(compareTokensIcpFirst(icpToken, ckBTCUserToken)).toEqual(-1);
      expect(compareTokensIcpFirst(ckBTCUserToken, icpToken)).toEqual(1);
      expect(compareTokensIcpFirst(icpToken, icpToken)).toEqual(0);
    });
  });

  describe("compareTokensByImportance", () => {
    it("should sort tokens by importance", () => {
      const token0 = createTokenWithBalance({ id: 0, amount: 0n });
      const expectedOrder = [ckBTCToken, ckETHTToken, ckUSDCToken, token0];
      expect(
        [token0, ckUSDCToken, ckETHTToken, ckBTCToken].sort(
          compareTokensByImportance
        )
      ).toEqual(expectedOrder);
      expect(
        [ckBTCToken, ckETHTToken, ckUSDCToken, token0].sort(
          compareTokensByImportance
        )
      ).toEqual(expectedOrder);
      expect(
        [ckETHTToken, ckBTCToken, token0, ckUSDCToken].sort(
          compareTokensByImportance
        )
      ).toEqual(expectedOrder);
    });
  });

  describe("compareTokensAlphabetically", () => {
    const annaToken = createUserToken({ title: "Anna" });
    const arnyToken = createUserToken({ title: "Arny" });
    const albertTokenLowerCase = createUserToken({ title: "albert" });
    const zorroToken = createUserToken({ title: "Zorro" });

    it("should sort tokens by importance", () => {
      expect(compareTokensAlphabetically(annaToken, arnyToken)).toEqual(-1);
      expect(compareTokensAlphabetically(zorroToken, arnyToken)).toEqual(1);
      expect(compareTokensAlphabetically(arnyToken, arnyToken)).toEqual(0);
    });

    it("should sort by titles while ignoring case sensitivity.", () => {
      expect(
        compareTokensAlphabetically(albertTokenLowerCase, annaToken)
      ).toEqual(-1);
      expect(
        compareTokensAlphabetically(annaToken, albertTokenLowerCase)
      ).toEqual(1);
    });
  });

  describe("compareTokensWithBalanceOrImportedFirst", () => {
    const token0 = createTokenWithBalance({ id: 0, amount: 0n });
    const token1 = createTokenWithBalance({ id: 1, amount: 1n });
    const importedTokenIds = new Set([
      importedTokenWithBalance.universeId.toText(),
      importedTokenNoBalance.universeId.toText(),
      failedImportedToken.universeId.toText(),
    ]);

    it("should compare by balance", () => {
      expect(
        compareTokensWithBalanceOrImportedFirst({
          importedTokenIds,
        })(token1, token0)
      ).toEqual(-1);
      expect(
        compareTokensWithBalanceOrImportedFirst({
          importedTokenIds,
        })(token0, token1)
      ).toEqual(1);
      expect(
        compareTokensWithBalanceOrImportedFirst({
          importedTokenIds,
        })(token1, token1)
      ).toEqual(0);
      expect(
        compareTokensWithBalanceOrImportedFirst({
          importedTokenIds,
        })(token0, token0)
      ).toEqual(0);
    });

    it("should compare by imported", () => {
      expect(
        compareTokensWithBalanceOrImportedFirst({
          importedTokenIds,
        })(importedTokenNoBalance, token0)
      ).toEqual(-1);
      expect(
        compareTokensWithBalanceOrImportedFirst({
          importedTokenIds,
        })(token0, importedTokenNoBalance)
      ).toEqual(1);
      expect(
        compareTokensWithBalanceOrImportedFirst({
          importedTokenIds,
        })(importedTokenWithBalance, importedTokenNoBalance)
      ).toEqual(0);
    });

    it("should compare by balance and imported", () => {
      expect(
        compareTokensWithBalanceOrImportedFirst({
          importedTokenIds,
        })(importedTokenNoBalance, token0)
      ).toEqual(-1);
      expect(
        compareTokensWithBalanceOrImportedFirst({
          importedTokenIds,
        })(token0, importedTokenNoBalance)
      ).toEqual(1);
      expect(
        compareTokensWithBalanceOrImportedFirst({
          importedTokenIds,
        })(importedTokenWithBalance, importedTokenNoBalance)
      ).toEqual(0);
    });

    it("should treat token in loading state as having a balance of 0", () => {
      expect(
        compareTokensWithBalanceOrImportedFirst({
          importedTokenIds,
        })(createUserTokenLoading(), token0)
      ).toEqual(0);
      expect(
        compareTokensWithBalanceOrImportedFirst({
          importedTokenIds,
        })(token1, createUserTokenLoading())
      ).toEqual(-1);
      expect(
        compareTokensWithBalanceOrImportedFirst({
          importedTokenIds,
        })(createUserTokenLoading(), importedTokenNoBalance)
      ).toEqual(1);
    });
  });

  describe("compareFailedTokensLast", () => {
    it("should keep failed tokens last", () => {
      const icpToken = createIcpUserToken();
      const ckBTCUserToken = createUserToken(ckBTCTokenBase);

      expect(
        compareFailedTokensLast(failedImportedToken, importedTokenNoBalance)
      ).toEqual(1);
      expect(
        compareFailedTokensLast(failedImportedToken, importedTokenWithBalance)
      ).toEqual(1);
      expect(compareFailedTokensLast(failedImportedToken, icpToken)).toEqual(1);
      expect(
        compareFailedTokensLast(failedImportedToken, ckBTCUserToken)
      ).toEqual(1);
      expect(
        compareFailedTokensLast(importedTokenNoBalance, failedImportedToken)
      ).toEqual(-1);
      expect(
        compareFailedTokensLast(failedImportedToken, failedImportedToken)
      ).toEqual(0);
      expect(
        compareFailedTokensLast(
          importedTokenWithBalance,
          importedTokenWithBalance
        )
      ).toEqual(0);
    });
  });
});
