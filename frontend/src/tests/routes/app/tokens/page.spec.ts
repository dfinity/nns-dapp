import * as ckBTCLedgerApi from "$lib/api/ckbtc-ledger.api";
import * as snsLedgerApi from "$lib/api/sns-ledger.api";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { page } from "$mocks/$app/stores";
import TokensRoute from "$routes/(app)/(nns)/tokens/+page.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { mockSnsToken, principal } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { TokensRoutePo } from "$tests/page-objects/TokensRoute.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { AuthClient } from "@dfinity/auth-client";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/api/ckbtc-ledger.api");
vi.mock("$lib/api/sns-ledger.api");

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
  const icpBalanceE8s = 123456789n;

  const renderPage = async () => {
    const { container } = render(TokensRoute);

    await runResolvedPromises();

    return TokensRoutePo.under(new JestPageObjectElement(container));
  };

  describe("when feature flag enabled", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", true);
      vi.spyOn(ckBTCLedgerApi, "getCkBTCToken").mockResolvedValue(
        mockCkBTCToken
      );
      vi.spyOn(AuthClient, "create").mockImplementation(
        async (): Promise<AuthClient> => mockAuthClient
      );
      vi.spyOn(ckBTCLedgerApi, "getCkBTCAccount").mockResolvedValue({
        ...mockCkBTCMainAccount,
        balanceE8s: ckBTCBalanceE8s,
      });
      vi.spyOn(snsLedgerApi, "getSnsAccounts").mockImplementation(
        async ({ rootCanisterId }) => {
          if (rootCanisterId.toText() === rootCanisterIdTetris.toText()) {
            return [
              {
                ...mockSnsMainAccount,
                balanceE8s: tetrisBalanceE8s,
              },
            ];
          }
          return [
            {
              ...mockSnsMainAccount,
              balanceE8s: pacmanBalanceE8s,
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
      icpAccountsStore.setForTesting({
        main: { ...mockMainAccount, balanceE8s: icpBalanceE8s },
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

      describe("when ckBTC is enabled", () => {
        beforeEach(() => {
          overrideFeatureFlagsStore.setFlag("ENABLE_CKBTC", true);
          overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", false);
        });

        it("should render ICP, ckBTC and SNS tokens", async () => {
          const po = await renderPage();

          const tokensPagePo = po.getTokensPagePo();
          expect(await tokensPagePo.getTokenNames()).toEqual([
            "Internet Computer",
            "ckBTC",
            "Tetris",
            "Pacman",
          ]);
        });

        it("should render ICP, ckBTC and SNS token balances", async () => {
          const po = await renderPage();

          const tokensPagePo = po.getTokensPagePo();
          expect(await tokensPagePo.getRowsData()).toEqual([
            { projectName: "Internet Computer", balance: "1.23 ICP" },
            { projectName: "ckBTC", balance: "4.45 ckBTC" },
            { projectName: "Tetris", balance: "2.22 TST" },
            { projectName: "Pacman", balance: "3.14 PCMN" },
          ]);
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
