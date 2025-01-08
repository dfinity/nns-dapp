import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { CKETH_UNIVERSE_CANISTER_ID } from "$lib/constants/cketh-canister-ids.constants";
import {
  CKUSDC_INDEX_CANISTER_ID,
  CKUSDC_LEDGER_CANISTER_ID,
  CKUSDC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckusdc-canister-ids.constants";
import { defaultIcrcCanistersStore } from "$lib/stores/default-icrc-canisters.store";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import { tokensStore } from "$lib/stores/tokens.store";
import PortfolioRoute from "$routes/(app)/(nns)/portfolio/+page.svelte";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockCkBTCToken,
  mockCkTESTBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import { mockCkETHToken } from "$tests/mocks/cketh-accounts.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
import { mockCkUSDCToken } from "$tests/mocks/tokens.mock";
import { PortfolioRoutePo } from "$tests/page-objects/PortfolioRoute.page-object copy";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { setCkETHCanisters } from "$tests/utils/cketh.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { AuthClient } from "@dfinity/auth-client";
import { isNullish } from "@dfinity/utils";
import { render } from "@testing-library/svelte";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/api/sns-ledger.api");
vi.mock("$lib/api/icrc-ledger.api");
vi.mock("$lib/api/ckbtc-minter.api");

describe("Portfolio page", () => {
  const mockAuthClient = mock<AuthClient>();
  mockAuthClient.login.mockResolvedValue(undefined);

  const icpBalanceE8s = 100n * 100_000_000n; // 100ICP -> $1000
  const ckBTCBalanceE8s = 1n * 100_000_000_000_000_000n; // 1BTC -> $100_000
  const ckETHBalanceUlps = 1n * 100_000_000_000_000_000_000_000n; // 1ETH -> $1000
  const ckUSDCBalanceE8s = 1n * 1_000_000n; // 1USDC -> $1

  const renderPage = async () => {
    const { container } = render(PortfolioRoute);
    await runResolvedPromises();

    return PortfolioRoutePo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    resetIdentity();

    vi.spyOn(icrcLedgerApi, "queryIcrcToken").mockImplementation(
      async ({ canisterId }) => {
        const tokenMap = {
          [CKBTC_UNIVERSE_CANISTER_ID.toText()]: mockCkBTCToken,
          [CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]: mockCkTESTBTCToken,
          [CKETH_UNIVERSE_CANISTER_ID.toText()]: mockCkETHToken,
          [CKUSDC_UNIVERSE_CANISTER_ID.toText()]: mockCkUSDCToken,
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
    vi.spyOn(icrcLedgerApi, "queryIcrcBalance").mockImplementation(
      async ({ canisterId }) => {
        const balancesMap = {
          [CKBTC_UNIVERSE_CANISTER_ID.toText()]: ckBTCBalanceE8s,
          [CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]: ckBTCBalanceE8s,
          [CKETH_UNIVERSE_CANISTER_ID.toText()]: ckETHBalanceUlps,
          [CKUSDC_UNIVERSE_CANISTER_ID.toText()]: ckUSDCBalanceE8s,
        };

        if (isNullish(balancesMap[canisterId.toText()])) {
          throw new Error(
            `Account not found for canister ${canisterId.toText()}`
          );
        }
        return balancesMap[canisterId.toText()];
      }
    );

    setAccountsForTesting({
      main: { ...mockMainAccount, balanceUlps: icpBalanceE8s },
    });
    setCkETHCanisters();
    defaultIcrcCanistersStore.setCanisters({
      ledgerCanisterId: CKUSDC_LEDGER_CANISTER_ID,
      indexCanisterId: CKUSDC_INDEX_CANISTER_ID,
    });
    tokensStore.setToken({
      canisterId: CKUSDC_UNIVERSE_CANISTER_ID,
      token: mockCkUSDCToken,
    });
    vi.spyOn(icrcLedgerApi, "icrcTransfer").mockResolvedValue(1234n);

    icpSwapTickersStore.set([
      {
        ...mockIcpSwapTicker,
        base_id: CKBTC_UNIVERSE_CANISTER_ID.toText(),
        last_price: "100000.00",
      },
      {
        ...mockIcpSwapTicker,
        base_id: CKTESTBTC_UNIVERSE_CANISTER_ID.toText(),
        last_price: "100000.00",
      },
      {
        ...mockIcpSwapTicker,
        base_id: CKETH_UNIVERSE_CANISTER_ID.toText(),
        last_price: "1000.00",
      },
      {
        ...mockIcpSwapTicker,
        base_id: CKUSDC_UNIVERSE_CANISTER_ID.toText(),
        last_price: "10.00",
      },
    ]);
  });

  it("should display the UsdValueBanner with total of assets: tokens and neurons", async () => {
    const po = await renderPage();
    const portfolioPagePo = po.getPortfolioPagePo();

    expect(await portfolioPagePo.getUsdValueBannerPo().getPrimaryAmount()).toBe(
      "$202’001.00"
    );
    expect(
      await portfolioPagePo.getUsdValueBannerPo().getSecondaryAmount()
    ).toBe("20’200.10 ICP");
  });
});
