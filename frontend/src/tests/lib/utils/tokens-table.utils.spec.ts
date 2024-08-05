import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { CKETH_UNIVERSE_CANISTER_ID } from "$lib/constants/cketh-canister-ids.constants";
import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import {
  compareTokensAlphabetically,
  compareTokensByImportance,
  compareTokensIcpFirst,
  compareTokensWithBalanceFirst,
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
  const tokenWithBalance = ({ id, amount }: { id: number; amount: bigint }) =>
    createUserToken({
      universeId: principal(id),
      balance: TokenAmountV2.fromUlps({
        amount,
        token: { name: `T${id}`, symbol: `T${id}`, decimals: 8 },
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

  describe("compareTokensWithBalanceFirst", () => {
    it("should keep tokens with balance first", () => {
      expect(
        compareTokensWithBalanceFirst(
          tokenWithBalance({ id: 1, amount: 1n }),
          tokenWithBalance({ id: 0, amount: 0n })
        )
      ).toEqual(-1);
      expect(
        compareTokensWithBalanceFirst(
          tokenWithBalance({ id: 0, amount: 0n }),
          tokenWithBalance({ id: 1, amount: 1n })
        )
      ).toEqual(1);
      expect(
        compareTokensWithBalanceFirst(
          tokenWithBalance({ id: 0, amount: 0n }),
          tokenWithBalance({ id: 0, amount: 0n })
        )
      ).toEqual(0);
      expect(
        compareTokensWithBalanceFirst(
          tokenWithBalance({ id: 1, amount: 1n }),
          tokenWithBalance({ id: 1, amount: 1n })
        )
      ).toEqual(0);
    });

    it("should treat token in loading state as having a balance of 0", () => {
      expect(
        compareTokensWithBalanceFirst(
          createUserTokenLoading(),
          tokenWithBalance({ id: 1, amount: 1n })
        )
      ).toEqual(1);
      expect(
        compareTokensWithBalanceFirst(
          tokenWithBalance({ id: 1, amount: 1n }),
          createUserTokenLoading()
        )
      ).toEqual(-1);
    });
  });

  describe("compareTokensByImportance", () => {
    it("should sort tokens by importance", () => {
      const token0 = tokenWithBalance({ id: 0, amount: 0n });
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

  describe("compareTokensWithBalanceOrImportedFirst", () => {
    const token0 = tokenWithBalance({ id: 0, amount: 0n });
    const token1 = tokenWithBalance({ id: 1, amount: 1n });
    const importedTokenWithBalance = tokenWithBalance({ id: 2, amount: 1n });
    const importedTokenNoBalance = tokenWithBalance({ id: 3, amount: 0n });
    const importedTokenIds = new Set([
      importedTokenWithBalance.universeId.toText(),
      importedTokenNoBalance.universeId.toText(),
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
        })(importedTokenNoBalance, token1)
      ).toEqual(0);
      expect(
        compareTokensWithBalanceOrImportedFirst({
          importedTokenIds,
        })(token0, importedTokenNoBalance)
      ).toEqual(1);
      expect(
        compareTokensWithBalanceOrImportedFirst({
          importedTokenIds,
        })(importedTokenWithBalance, token0)
      ).toEqual(-1);
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
