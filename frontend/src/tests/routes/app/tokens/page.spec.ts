import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import * as snsLedgerApi from "$lib/api/sns-ledger.api";
import * as walletLedgerApi from "$lib/api/wallet-ledger.api";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import {
  CKETHSEPOLIA_UNIVERSE_CANISTER_ID,
  CKETH_UNIVERSE_CANISTER_ID,
} from "$lib/constants/cketh-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import { numberToUlps } from "$lib/utils/token.utils";
import { page } from "$mocks/$app/stores";
import TokensRoute from "$routes/(app)/(nns)/tokens/+page.svelte";
import {
  mockIdentity,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
  mockCkTESTBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import {
  mockCkETHMainAccount,
  mockCkETHToken,
} from "$tests/mocks/cketh-accounts.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { mockSnsToken, principal } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { TokensRoutePo } from "$tests/page-objects/TokensRoute.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setCkETHCanisters } from "$tests/utils/cketh.test-utils";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { AuthClient } from "@dfinity/auth-client";
import { encodeIcrcAccount, type IcrcAccount } from "@dfinity/ledger-icrc";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { isNullish } from "@dfinity/utils";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/api/wallet-ledger.api");
vi.mock("$lib/api/sns-ledger.api");
vi.mock("$lib/api/icrc-ledger.api");

describe("Tokens route", () => {
  const mockAuthClient = mock<AuthClient>();
  mockAuthClient.login.mockResolvedValue(undefined);

  const rootCanisterIdTetris = rootCanisterIdMock;
  const rootCanisterIdPacman = principal(1);
  const tetrisToken = mockSnsToken;
  const pacmanToken = {
    ...mockSnsToken,
    symbol: "PCMN",
  };
  const tetrisBalanceE8s = 222000000n;
  const pacmanBalanceE8s = 314000000n;
  const ckBTCBalanceE8s = 444556699n;
  const amountCkBTCTransaction = 2;
  const amountCkBTCTransactionUlps = numberToUlps({
    amount: amountCkBTCTransaction,
    token: mockCkBTCToken,
  });
  let ckBTCTransactionPerformed = false;
  const ckBTCNewBalanceE8s = ckBTCBalanceE8s - amountCkBTCTransactionUlps;
  const ckETHBalanceUlps = 4_140_000_000_000_000_000n;
  const icpBalanceE8s = 123456789n;

  const renderPage = async () => {
    const { container } = render(TokensRoute);

    await runResolvedPromises();

    return TokensRoutePo.under(new JestPageObjectElement(container));
  };

  describe("when feature flag enabled", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      icrcAccountsStore.reset();
      tokensStore.reset();
      ckBTCTransactionPerformed = false;
      overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", true);
      vi.spyOn(walletLedgerApi, "getToken").mockImplementation(
        async ({ canisterId }) => {
          const tokenMap = {
            [CKBTC_UNIVERSE_CANISTER_ID.toText()]: mockCkBTCToken,
            [CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]: mockCkTESTBTCToken,
            [CKETH_UNIVERSE_CANISTER_ID.toText()]: mockCkETHToken,
            [CKETHSEPOLIA_UNIVERSE_CANISTER_ID.toText()]: mockCkTESTBTCToken,
          };
          if (isNullish(tokenMap[canisterId.toText()])) {
            throw new Error(
              `Token not found for canister ${canisterId.toText()}`
            );
          }
          return tokenMap[canisterId.toText()];
        }
      );
      vi.spyOn(AuthClient, "create").mockImplementation(
        async (): Promise<AuthClient> => mockAuthClient
      );
      vi.spyOn(walletLedgerApi, "getAccount").mockImplementation(
        async ({ canisterId }) => {
          const accountMap = {
            [CKBTC_UNIVERSE_CANISTER_ID.toText()]: {
              ...mockCkBTCMainAccount,
              balanceUlps: ckBTCTransactionPerformed
                ? ckBTCNewBalanceE8s
                : ckBTCBalanceE8s,
            },
            [CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]: {
              ...mockCkBTCMainAccount,
              balanceUlps: ckBTCBalanceE8s,
            },
            [CKETH_UNIVERSE_CANISTER_ID.toText()]: {
              ...mockCkETHMainAccount,
              balanceUlps: ckETHBalanceUlps,
            },
            [CKETHSEPOLIA_UNIVERSE_CANISTER_ID.toText()]: {
              ...mockCkETHMainAccount,
              balanceUlps: ckETHBalanceUlps,
            },
          };
          if (isNullish(accountMap[canisterId.toText()])) {
            throw new Error(
              `Account not found for canister ${canisterId.toText()}`
            );
          }
          return accountMap[canisterId.toText()];
        }
      );
      vi.spyOn(snsLedgerApi, "snsTransfer").mockResolvedValue(undefined);
      vi.spyOn(snsLedgerApi, "getSnsAccounts").mockImplementation(
        async ({ rootCanisterId }) => {
          if (rootCanisterId.toText() === rootCanisterIdTetris.toText()) {
            return [
              {
                ...mockSnsMainAccount,
                balanceUlps: tetrisBalanceE8s,
              },
            ];
          }
          return [
            {
              ...mockSnsMainAccount,
              balanceUlps: pacmanBalanceE8s,
            },
          ];
        }
      );
      vi.spyOn(snsLedgerApi, "getSnsToken").mockImplementation(
        async ({ rootCanisterId }) => {
          if (rootCanisterId.toText() === rootCanisterIdTetris.toText()) {
            return tetrisToken;
          }
          return pacmanToken;
        }
      );
      vi.spyOn(icrcLedgerApi, "icrcTransfer").mockResolvedValue(1234n);

      setSnsProjects([
        {
          rootCanisterId: rootCanisterIdTetris,
          projectName: "Tetris",
          lifecycle: SnsSwapLifecycle.Committed,
        },
        {
          rootCanisterId: rootCanisterIdPacman,
          projectName: "Pacman",
          lifecycle: SnsSwapLifecycle.Committed,
        },
      ]);
      tokensStore.setTokens({
        [rootCanisterIdTetris.toText()]: {
          token: mockSnsToken,
        },
        [rootCanisterIdPacman.toText()]: {
          token: mockSnsToken,
        },
      });
      setCkETHCanisters();
      // TODO: Remove when we deprecate the store: https://dfinity.atlassian.net/browse/GIX-2060
      transactionsFeesStore.setFee({
        rootCanisterId: rootCanisterIdTetris,
        fee: mockSnsToken.fee,
        certified: true,
      });
      icpAccountsStore.setForTesting({
        main: { ...mockMainAccount, balanceUlps: icpBalanceE8s },
      });
    });

    describe("when logged in", () => {
      beforeEach(() => {
        resetIdentity();
      });

      it("should render my tokens page", async () => {
        const po = await renderPage();

        expect(await po.hasLoginPage()).toBe(false);
        expect(await po.hasTokensPage()).toBe(true);
      });

      it("renders 'Projects' as tokens table first column", async () => {
        const po = await renderPage();

        const tablePo = po.getTokensPagePo().getTokensTable();
        expect(await tablePo.getFirstColumnHeader()).toEqual("Projects");
      });

      describe("when ckBTC is enabled", () => {
        beforeEach(() => {
          overrideFeatureFlagsStore.setFlag("ENABLE_CKBTC", true);
          overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", false);
        });

        it("should render ICP, ckBTC, ckETH and SNS tokens", async () => {
          const po = await renderPage();

          const tokensPagePo = po.getTokensPagePo();
          expect(await tokensPagePo.getTokenNames()).toEqual([
            "Internet Computer",
            "ckBTC",
            "ckETH",
            "Tetris",
            "Pacman",
          ]);
        });

        it("should render ICP, ckBTC, ckETH and SNS token balances", async () => {
          const po = await renderPage();

          const tokensPagePo = po.getTokensPagePo();
          expect(await tokensPagePo.getRowsData()).toEqual([
            { projectName: "Internet Computer", balance: "1.23 ICP" },
            { projectName: "ckBTC", balance: "4.45 ckBTC" },
            { projectName: "ckETH", balance: "4.14 ckETH" },
            { projectName: "Tetris", balance: "2.22 TST" },
            { projectName: "Pacman", balance: "3.14 PCMN" },
          ]);
        });

        it("users can send SNS tokens", async () => {
          const po = await renderPage();

          const tokensPagePo = po.getTokensPagePo();

          await tokensPagePo.clickSendOnRow("Tetris");

          expect(await po.getSnsTransactionModalPo().isPresent()).toBe(true);

          expect(snsLedgerApi.snsTransfer).not.toBeCalled();

          const toAccount: IcrcAccount = {
            owner: principal(1),
          };
          const amount = 2;

          await po.transferSnsTokens({
            amount,
            destinationAddress: encodeIcrcAccount(toAccount),
          });

          expect(snsLedgerApi.snsTransfer).toBeCalledTimes(1);
          expect(snsLedgerApi.snsTransfer).toBeCalledWith({
            rootCanisterId: rootCanisterIdTetris,
            fee: tetrisToken.fee,
            to: toAccount,
            amount: numberToUlps({ amount, token: tetrisToken }),
            fromSubAccount: undefined,
            identity: mockIdentity,
          });
        });

        it("users can send ckBTC tokens", async () => {
          const po = await renderPage();

          const tokensPagePo = po.getTokensPagePo();

          expect(await tokensPagePo.getRowData("ckBTC")).toEqual({
            projectName: "ckBTC",
            balance: "4.45 ckBTC",
          });

          await tokensPagePo.clickSendOnRow("ckBTC");

          expect(await po.getCkBTCTransactionModalPo().isPresent()).toBe(true);

          expect(icrcLedgerApi.icrcTransfer).not.toBeCalled();

          const toAccount: IcrcAccount = {
            owner: principal(1),
          };

          await po.transferCkBTCTokens({
            amount: amountCkBTCTransaction,
            destinationAddress: encodeIcrcAccount(toAccount),
          });

          ckBTCTransactionPerformed = true;
          await runResolvedPromises();

          expect(icrcLedgerApi.icrcTransfer).toBeCalledTimes(1);
          expect(icrcLedgerApi.icrcTransfer).toBeCalledWith({
            canisterId: CKBTC_UNIVERSE_CANISTER_ID,
            fee: mockCkBTCToken.fee,
            to: toAccount,
            amount: amountCkBTCTransactionUlps,
            fromSubAccount: undefined,
            identity: mockIdentity,
          });

          expect(await tokensPagePo.getRowData("ckBTC")).toEqual({
            projectName: "ckBTC",
            balance: "2.45 ckBTC",
          });
          expect(await po.getCkBTCTransactionModalPo().isPresent()).toBe(false);
        });
      });
    });

    describe("when logged out", () => {
      beforeEach(() => {
        setNoIdentity();
      });

      it("should render sign-in if not logged in", async () => {
        const po = await renderPage();

        expect(await po.hasLoginPage()).toBe(true);
        expect(await po.hasTokensPage()).toBe(false);
      });

      it("renders 'Projects' as tokens table first column", async () => {
        const po = await renderPage();

        const tablePo = po.getSignInTokensPagePo().getTokensTablePo();
        expect(await tablePo.getFirstColumnHeader()).toEqual("Projects");
      });

      describe("when ckBTC is enabled", () => {
        beforeEach(() => {
          overrideFeatureFlagsStore.setFlag("ENABLE_CKBTC", true);
          overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", false);
        });

        it("should render ICP and SNS tokens", async () => {
          const po = await renderPage();

          const signInPo = po.getSignInTokensPagePo();
          expect(await signInPo.getTokenNames()).toEqual([
            "Internet Computer",
            "ckBTC",
            "ckETH",
            "Tetris",
            "Pacman",
          ]);
        });
      });

      describe("when ckBTC is not enabled", () => {
        beforeEach(() => {
          overrideFeatureFlagsStore.setFlag("ENABLE_CKBTC", false);
          overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", false);
        });

        it("should render ICP and SNS tokens", async () => {
          const po = await renderPage();

          const signInPo = po.getSignInTokensPagePo();
          expect(await signInPo.getTokenNames()).toEqual([
            "Internet Computer",
            "ckETH",
            "Tetris",
            "Pacman",
          ]);
        });
      });

      it("should click on a row should trigger a login", async () => {
        const po = await renderPage();

        const tablePo = po.getSignInTokensPagePo().getTokensTablePo();

        expect(mockAuthClient.login).toBeCalledTimes(0);
        const rows = await tablePo.getRows();
        await rows[0].click();

        expect(mockAuthClient.login).toBeCalledTimes(1);
      });
    });
  });

  describe("when feature flag disabled", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", false);
      page.mock({ routeId: AppPath.Tokens });
    });

    it("should redirect to accounts page", async () => {
      expect(get(pageStore).path).toEqual(AppPath.Tokens);

      await renderPage();

      expect(get(pageStore).path).toEqual(AppPath.Accounts);
    });
  });
});
