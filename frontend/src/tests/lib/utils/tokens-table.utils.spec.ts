import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { CKETH_UNIVERSE_CANISTER_ID } from "$lib/constants/cketh-canister-ids.constants";
import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import {
  compareTokensAlphabetically,
  compareTokensByImportance,
  compareTokensIcpFirst,
  compareTokensWithBalanceFirst,
} from "$lib/utils/tokens-table.utils";
import { principal } from "$tests/mocks/sns-projects.mock";
import {
  ckBTCTokenBase,
  createIcpUserToken,
  createUserToken,
  createUserTokenLoading,
} from "$tests/mocks/tokens-page.mock";
import { allowLoggingInOneTestForDebugging } from "$tests/utils/console.test-utils";
import { TokenAmountV2 } from "@dfinity/utils";

describe("tokens-table.utils", () => {
  const tokenWithBalance = (amount: bigint) =>
    createUserToken({
      universeId: principal(Number(amount)),
      balance: TokenAmountV2.fromUlps({
        amount,
        token: { name: `T${amount}`, symbol: `T${amount}`, decimals: 8 },
      }),
    });
  const ckBTCToken = createUserToken({
    universeId: CKBTC_UNIVERSE_CANISTER_ID,
  });
  const ckETHTToken = createUserToken({
    universeId: CKETH_UNIVERSE_CANISTER_ID,
  });
  const ckUSDCToken = createUserToken({
    universeId: CKUSDC_UNIVERSE_CANISTER_ID,
  });

  beforeEach(() => {
    allowLoggingInOneTestForDebugging();
    vi.clearAllMocks();
  });

  // ;
  // compareTokensForTable;

  describe("compareTokensIcpFirst", () => {
    it("should keep ICP first", () => {
      const icpToken = createIcpUserToken();
      const ckBTCUserToken = createUserToken(ckBTCTokenBase);
      //   {
      //   ...ckBTCTokenBase,
      //   // TODO: the balance not needed
      //   balance: TokenAmountV2.fromUlps({
      //     amount: mockCkBTCMainAccount.balanceUlps,
      //     token: mockCkBTCToken,
      //   }),
      // };
      const token1 = createUserToken({
        universeId: principal(0),
      });

      expect(compareTokensIcpFirst(icpToken, ckBTCUserToken)).toEqual(-1);
      expect(compareTokensIcpFirst(ckBTCUserToken, icpToken)).toEqual(1);
      expect(compareTokensIcpFirst(icpToken, icpToken)).toEqual(0);
    });
  });

  describe("compareTokensWithBalanceFirst", () => {
    it("should keep tokens with balance first", () => {
      expect(
        compareTokensWithBalanceFirst(
          tokenWithBalance(1n),
          tokenWithBalance(0n)
        )
      ).toEqual(-1);
      expect(
        compareTokensWithBalanceFirst(
          tokenWithBalance(0n),
          tokenWithBalance(1n)
        )
      ).toEqual(1);
      expect(
        compareTokensWithBalanceFirst(
          tokenWithBalance(0n),
          tokenWithBalance(0n)
        )
      ).toEqual(0);
      expect(
        compareTokensWithBalanceFirst(
          tokenWithBalance(1n),
          tokenWithBalance(1n)
        )
      ).toEqual(0);
    });

    it("should treat token in loading state as having a balance of 0", () => {
      expect(
        compareTokensWithBalanceFirst(
          createUserTokenLoading(),
          tokenWithBalance(1n)
        )
      ).toEqual(1);
      expect(
        compareTokensWithBalanceFirst(
          tokenWithBalance(1n),
          createUserTokenLoading()
        )
      ).toEqual(-1);
    });
  });

  describe("compareTokensByImportance", () => {
    it("should sort tokens by importance", () => {
      const token0 = tokenWithBalance(0n);
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
});
