import * as icpSwapApi from "$lib/api/icp-swap.api";
import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";

import * as importedTokensApi from "$lib/api/imported-tokens.api";
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
import { importedTokensStore } from "$lib/stores/imported-tokens.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { tokensStore } from "$lib/stores/tokens.store";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type { ImportedTokenData } from "$lib/types/imported-tokens";
import PortfolioRoute from "$routes/(app)/(nns)/portfolio/+page.svelte";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockCkBTCToken,
  mockCkTESTBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import { mockCkETHToken } from "$tests/mocks/cketh-accounts.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { mockSnsToken, principal } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { mockCkUSDCToken } from "$tests/mocks/tokens.mock";
import { PortfolioRoutePo } from "$tests/page-objects/PortfolioRoute.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { setCkETHCanisters } from "$tests/utils/cketh.test-utils";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Portfolio route", () => {
  const renderPage = async () => {
    const { container } = render(PortfolioRoute);
    await runResolvedPromises();

    return PortfolioRoutePo.under(new JestPageObjectElement(container));
  };

  const tickers = [
    {
      ...mockIcpSwapTicker,
      base_id: CKUSDC_UNIVERSE_CANISTER_ID.toText(),
      last_price: "10.00",
    },
  ];

  beforeEach(() => {
    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue(tickers);
  });

  it("should load ICP Swap tickers", async () => {
    expect(get(icpSwapTickersStore)).toBeUndefined();
    expect(icpSwapApi.queryIcpSwapTickers).toBeCalledTimes(0);

    await renderPage();

    expect(get(icpSwapTickersStore)).toEqual(tickers);
    expect(icpSwapApi.queryIcpSwapTickers).toBeCalledTimes(1);
  });

  describe("when logged in", () => {
    const icpBalanceE8s = 100n * 100_000_000n; // 100ICP(1ICP==10$) -> $1000
    const ckBTCBalanceE8s = 1n * 100_000_000n; // 1BTC(1BTC==10_000ICP) -> $100_000
    const ckETHBalanceUlps = 1n * 100_000_000_000_000_000n; // 1ETH(1ETH=100ICP) -> $1000
    const tetrisBalanceE8s = 2n * 100_000_000n; // 2Tetris(1Tetris==1ICP) -> $20
    const importedToken1BalanceE6s = 100n * 1_000_000n; // 100ZTOKEN1(1ZTOKEN1==1ICP) -> $1000
    const ckUSDCBalanceE6s = 1n * 1_000_000n; // 1USDC -> $1

    const nnsNeuronStake = 1n * 100_000_000n; // 1ICP -> $10
    const tetrisSnsNeuronStake = 20n * 100_000_000n; // 20Tetris -> $200

    const importedToken1Id = Principal.fromText(
      "xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe"
    );
    const importedToken1Metadata = {
      name: "ZTOKEN1",
      symbol: "ZTOKEN1",
      fee: 4_000n,
      decimals: 6,
    } as IcrcTokenMetadata;
    const importedToken1Data: ImportedTokenData = {
      ledgerCanisterId: importedToken1Id,
      indexCanisterId: principal(111),
    };

    const tetrisSNS = {
      rootCanisterId: rootCanisterIdMock,
      ledgerCanisterId: principal(2),
      projectName: "Tetris",
      tokenMetadata: { ...mockSnsToken, decimals: 8 },
      lifecycle: SnsSwapLifecycle.Committed,
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
            [importedToken1Id.toText()]: importedToken1Metadata,
          };
          return tokenMap[canisterId.toText()];
        }
      );

      vi.spyOn(icrcLedgerApi, "queryIcrcBalance").mockImplementation(
        async ({ canisterId }) => {
          const balancesMap = {
            [CKBTC_UNIVERSE_CANISTER_ID.toText()]: ckBTCBalanceE8s,
            [CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]: ckBTCBalanceE8s,
            [CKETH_UNIVERSE_CANISTER_ID.toText()]: ckETHBalanceUlps,
            [CKUSDC_UNIVERSE_CANISTER_ID.toText()]: ckUSDCBalanceE6s,
            [tetrisSNS.ledgerCanisterId.toText()]: tetrisBalanceE8s,
            [importedToken1Id.toText()]: importedToken1BalanceE6s,
          };

          return balancesMap[canisterId.toText()];
        }
      );

      setCkETHCanisters();
      // TODO: Copy setCkETHCanisters aproach to set the canisters for CKUSDC
      defaultIcrcCanistersStore.setCanisters({
        ledgerCanisterId: CKUSDC_LEDGER_CANISTER_ID,
        indexCanisterId: CKUSDC_INDEX_CANISTER_ID,
      });
      tokensStore.setToken({
        canisterId: CKUSDC_UNIVERSE_CANISTER_ID,
        token: mockCkUSDCToken,
      });

      setSnsProjects([tetrisSNS]);

      vi.spyOn(importedTokensApi, "getImportedTokens").mockResolvedValue({
        imported_tokens: [
          {
            ledger_canister_id: importedToken1Id,
            index_canister_id: [],
          },
        ],
      });

      tokensStore.setToken({
        canisterId: importedToken1Id,
        token: importedToken1Metadata,
      });
      importedTokensStore.set({
        importedTokens: [importedToken1Data],
        certified: true,
      });
    });

    it("should get ckBtc tokens", async () => {
      const identity = mockIdentity;

      expect(icrcLedgerApi.queryIcrcToken).toBeCalledTimes(0);

      await renderPage();

      expect(icrcLedgerApi.queryIcrcToken).toBeCalledTimes(2);
      expect(icrcLedgerApi.queryIcrcToken).toHaveBeenNthCalledWith(1, {
        canisterId: CKBTC_UNIVERSE_CANISTER_ID,
        certified: false,
        identity,
      });

      expect(icrcLedgerApi.queryIcrcToken).toHaveBeenNthCalledWith(2, {
        canisterId: CKTESTBTC_UNIVERSE_CANISTER_ID,
        certified: false,
        identity,
      });
    });

    it("should load all accounts balances for both ckBTC and icrc(ckETH, ckUSDC, Tetris(SNS token))", async () => {
      const identity = mockIdentity;
      const account = {
        owner: identity.getPrincipal(),
      };

      expect(icrcLedgerApi.queryIcrcBalance).toBeCalledTimes(0);

      await renderPage();

      // Should be called 5 times total (2 ckBTC + 2 ICRC + 1 ImportedToken + 1 SNS)
      expect(icrcLedgerApi.queryIcrcBalance).toBeCalledTimes(6);

      expect(icrcLedgerApi.queryIcrcBalance).toHaveBeenNthCalledWith(1, {
        canisterId: CKBTC_UNIVERSE_CANISTER_ID,
        certified: false,
        identity,
        account,
      });

      expect(icrcLedgerApi.queryIcrcBalance).toHaveBeenNthCalledWith(2, {
        canisterId: CKTESTBTC_UNIVERSE_CANISTER_ID,
        certified: false,
        identity,
        account,
      });

      expect(icrcLedgerApi.queryIcrcBalance).toHaveBeenNthCalledWith(3, {
        canisterId: CKETH_UNIVERSE_CANISTER_ID,
        certified: false,
        identity,
        account,
      });

      expect(icrcLedgerApi.queryIcrcBalance).toHaveBeenNthCalledWith(4, {
        canisterId: CKUSDC_UNIVERSE_CANISTER_ID,
        certified: false,
        identity,
        account,
      });

      expect(icrcLedgerApi.queryIcrcBalance).toHaveBeenNthCalledWith(5, {
        canisterId: importedToken1Id,
        certified: false,
        identity,
        account,
      });

      expect(icrcLedgerApi.queryIcrcBalance).toHaveBeenNthCalledWith(6, {
        canisterId: tetrisSNS.ledgerCanisterId,
        certified: false,
        identity,
        account,
      });
    });

    it("should render the Portfolio page with the provided data", async () => {
      setAccountsForTesting({
        main: { ...mockMainAccount, balanceUlps: icpBalanceE8s },
      });
      icpSwapTickersStore.set([
        {
          ...mockIcpSwapTicker,
          base_id: CKBTC_UNIVERSE_CANISTER_ID.toText(),
          last_price: "0.0001",
        },
        {
          ...mockIcpSwapTicker,
          base_id: CKTESTBTC_UNIVERSE_CANISTER_ID.toText(),
          last_price: "0.0001",
        },
        {
          ...mockIcpSwapTicker,
          base_id: CKETH_UNIVERSE_CANISTER_ID.toText(),
          last_price: "0.001",
        },
        {
          ...mockIcpSwapTicker,
          base_id: CKUSDC_UNIVERSE_CANISTER_ID.toText(),
          last_price: "10.00",
        },
        {
          ...mockIcpSwapTicker,
          base_id: importedToken1Id.toText(),
          last_price: "1.00",
        },
        {
          ...mockIcpSwapTicker,
          base_id: tetrisSNS.ledgerCanisterId.toText(),
          last_price: "1.00",
        },
      ]);

      const nnsNeuronWithStake = {
        ...mockNeuron,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          cachedNeuronStake: nnsNeuronStake,
        },
      };
      neuronsStore.setNeurons({
        neurons: [nnsNeuronWithStake],
        certified: true,
      });

      const snsNeuronWithStake = createMockSnsNeuron({
        stake: tetrisSnsNeuronStake,
      });
      snsNeuronsStore.setNeurons({
        rootCanisterId: tetrisSNS.rootCanisterId,
        neurons: [snsNeuronWithStake],
        certified: true,
      });

      const po = await renderPage();
      const portfolioPagePo = po.getPortfolioPagePo();

      // 1BTC -> $100_000
      // 1BTCTest -> $100_000
      // 100ICP -> $1000
      // 1ETH -> $1000
      // 1USDC -> $1
      // 100ZTOKEN1 -> $1000
      // 2Tetris -> $20
      // 1ICP Neuron -> 10$
      // 20Tetris Neuron -> 200$
      // --------------------
      // Total: $203’231.00
      expect(
        await portfolioPagePo.getUsdValueBannerPo().getPrimaryAmount()
      ).toBe("$203’231.00");
      // $1 -> 0.1ICP
      expect(
        await portfolioPagePo.getUsdValueBannerPo().getSecondaryAmount()
      ).toBe("20’323.10 ICP");
    });
  });
});
