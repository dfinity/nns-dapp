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
import { getAnonymousIdentity } from "$lib/services/auth.services";
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
  const importedToken1Id = Principal.fromText(
    "xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe"
  );
  const importedToken1Metadata = {
    name: "ZTOKEN1",
    symbol: "ZTOKEN1",
    fee: 4_000n,
    decimals: 6,
  } as IcrcTokenMetadata;

  beforeEach(() => {
    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue(tickers);

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
  });

  it("should load ICP Swap tickers", async () => {
    expect(get(icpSwapTickersStore)).toBeUndefined();
    expect(icpSwapApi.queryIcpSwapTickers).toBeCalledTimes(0);

    await renderPage();

    expect(get(icpSwapTickersStore)).toEqual(tickers);
    expect(icpSwapApi.queryIcpSwapTickers).toBeCalledTimes(1);
  });

  it("should get ckBtc tokens", async () => {
    const identity = getAnonymousIdentity();

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

  it("should render the Portfolio page with visitor data", async () => {
    const po = await renderPage();
    const portfolioPagePo = po.getPortfolioPagePo();
    const tokensCardPo = portfolioPagePo.getHeldTokensCardPo();

    const titles = await tokensCardPo.getHeldTokensTitles();
    const usdBalances = await tokensCardPo.getHeldTokensBalanceInUsd();
    const nativeBalances =
      await tokensCardPo.getHeldTokensBalanceInNativeCurrency();

    expect(
      await portfolioPagePo.getTotalAssetsCardPo().getPrimaryAmount()
    ).toBe("$-/-");
    expect(
      await portfolioPagePo.getTotalAssetsCardPo().getSecondaryAmount()
    ).toBe("-/- ICP");

    expect(titles.length).toBe(4);
    expect(titles).toEqual(["Internet Computer", "ckBTC", "ckETH", "ckUSDC"]);

    expect(usdBalances.length).toBe(4);
    expect(usdBalances).toEqual(["$0.00", "$0.00", "$0.00", "$0.00"]);

    expect(nativeBalances.length).toBe(4);
    expect(nativeBalances).toEqual([
      "-/- ICP",
      "-/- ckBTC",
      "-/- ckETH",
      "-/- ckUSDC",
    ]);
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
        await portfolioPagePo.getTotalAssetsCardPo().getPrimaryAmount()
      ).toBe("$203’231.00");
      // $1 -> 0.1ICP
      expect(
        await portfolioPagePo.getTotalAssetsCardPo().getSecondaryAmount()
      ).toBe("20’323.10 ICP");

      const heldTokensCardPo = portfolioPagePo.getHeldTokensCardPo();
      const heldTokensTitles = await heldTokensCardPo.getHeldTokensTitles();
      const heldTokensBalanceInUsdBalance =
        await heldTokensCardPo.getHeldTokensBalanceInUsd();
      const heldTokensBalanceInNativeBalance =
        await heldTokensCardPo.getHeldTokensBalanceInNativeCurrency();

      expect(heldTokensTitles.length).toBe(4);
      expect(heldTokensTitles).toEqual([
        "Internet Computer",
        "ckBTC",
        "ckTESTBTC",
        "ckETH",
      ]);

      expect(heldTokensBalanceInUsdBalance.length).toBe(4);
      expect(heldTokensBalanceInUsdBalance).toEqual([
        "$1’000.00",
        "$100’000.00",
        "$100’000.00",
        "$1’000.00",
      ]);

      expect(heldTokensBalanceInNativeBalance.length).toBe(4);
      expect(heldTokensBalanceInNativeBalance).toEqual([
        "100.00 ICP",
        "1.00 ckBTC",
        "1.00 ckTESTBTC",
        "0.10 ckETH",
      ]);

      expect(await heldTokensCardPo.getInfoRow().isVisible()).toBe(false);

      const stakedTokensCardPo = portfolioPagePo.getStakedTokensCardPo();
      const stakedTokensTitles =
        await stakedTokensCardPo.getStakedTokensTitle();
      const stakedTokensMaturities =
        await stakedTokensCardPo.getStakedTokensMaturity();
      const stakedTokensStakeInUsd =
        await stakedTokensCardPo.getStakedTokensStakeInUsd();
      const stakedTokensStakeInNativeCurrency =
        await stakedTokensCardPo.getStakedTokensStakeInNativeCurrency();

      expect(stakedTokensTitles.length).toBe(2);
      expect(stakedTokensTitles).toEqual(["Internet Computer", "Tetris"]);

      expect(stakedTokensMaturities.length).toBe(2);
      expect(stakedTokensMaturities).toEqual(["0", "2.00"]);

      expect(stakedTokensStakeInUsd.length).toBe(2);
      expect(stakedTokensStakeInUsd).toEqual(["$10.00", "$200.00"]);

      expect(stakedTokensStakeInNativeCurrency.length).toBe(2);
      expect(stakedTokensStakeInNativeCurrency).toEqual([
        "1.00 ICP",
        "20.00 TST",
      ]);

      expect(await stakedTokensCardPo.getInfoRow().isPresent()).toBe(true);
    });
  });
});
