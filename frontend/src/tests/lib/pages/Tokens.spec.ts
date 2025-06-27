import * as ledgerApi from "$lib/api/icrc-ledger.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { MAX_IMPORTED_TOKENS } from "$lib/constants/imported-tokens.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
import TokensPage from "$lib/pages/Tokens.svelte";
import { importedTokensStore } from "$lib/stores/imported-tokens.store";
import { tokensTableOrderStore } from "$lib/stores/tokens-table.store";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type { UserTokenData } from "$lib/types/tokens-page";
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import { page } from "$mocks/$app/stores";
import { mockSnsToken, principal } from "$tests/mocks/sns-projects.mock";
import {
  createIcpUserToken,
  createUserToken,
  userTokensPageMock,
} from "$tests/mocks/tokens-page.mock";
import { TokensPagePo } from "$tests/page-objects/TokensPage.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setIcpPrice } from "$tests/utils/icp-swap.test-utils";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { TokenAmountV2 } from "@dfinity/utils";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Tokens page", () => {
  const positiveBalance = createUserToken({
    universeId: principal(1),
    title: "Positive balance",
    balance: TokenAmountV2.fromUlps({
      amount: 123_000_000n,
      token: {
        ...mockSnsToken,
        symbol: "T1",
      },
    }),
  });
  const zeroBalance = createUserToken({
    universeId: principal(2),
    title: "Zero balance",
    balance: TokenAmountV2.fromUlps({
      amount: 0n,
      token: {
        ...mockSnsToken,
        symbol: "T0",
      },
    }),
  });
  const icpZeroBalance = createIcpUserToken({
    balance: TokenAmountV2.fromUlps({
      amount: 0n,
      token: NNS_TOKEN_DATA,
    }),
  });
  const unavailableBalance = createUserToken({
    title: "Unavailable balance",
    universeId: principal(3),
    balance: new UnavailableTokenAmount(mockSnsToken),
  });

  const token1 = zeroBalance;
  const token2 = positiveBalance;

  const renderPage = (userTokensData: UserTokenData[]) => {
    const { container } = render(TokensPage, {
      props: { userTokensData },
    });
    return TokensPagePo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    vi.useFakeTimers();

    importedTokensStore.set({ importedTokens: [], certified: true });
    setIcpPrice(10);
  });

  it("should render the tokens table", async () => {
    const po = renderPage(userTokensPageMock);
    expect(await po.hasTokensTable()).toBeDefined();
  });

  it("should render a row per token", async () => {
    const po = renderPage([token1, token2]);
    expect(await po.getTokensTable().getRows()).toHaveLength(2);
  });

  it("should show settings button", async () => {
    const po = renderPage([token1, token2]);
    expect(await po.getSettingsButtonPo().isPresent()).toBe(true);
  });

  it("should open settings popup when clicking on settings button", async () => {
    const po = renderPage([token1, token2]);

    expect(await po.getHideZeroBalancesTogglePo().isPresent()).toBe(false);
    expect(await po.getBackdropPo().isPresent()).toBe(false);
    await po.getSettingsButtonPo().click();
    expect(await po.getHideZeroBalancesTogglePo().isPresent()).toBe(true);
    expect(await po.getBackdropPo().isPresent()).toBe(true);
  });

  it("should close settings popup when clicking on backdrop", async () => {
    const po = renderPage([token1, token2]);

    await po.getSettingsButtonPo().click();
    expect(await po.getHideZeroBalancesTogglePo().isPresent()).toBe(true);
    expect(await po.getBackdropPo().isPresent()).toBe(true);

    await po.getBackdropPo().click();

    // Finish transitions
    await advanceTime(500);

    expect(await po.getHideZeroBalancesTogglePo().isPresent()).toBe(false);
    expect(await po.getBackdropPo().isPresent()).toBe(false);
  });

  it("should hide tokens with zero balance", async () => {
    const po = renderPage([positiveBalance, zeroBalance]);

    expect(await po.getTokensTable().getTokenNames()).toEqual([
      "Positive balance",
      "Zero balance",
    ]);

    await po.getSettingsButtonPo().click();
    await po.getHideZeroBalancesTogglePo().getTogglePo().toggle();

    // Finish transitions
    await advanceTime(500);

    expect(await po.getTokensTable().getTokenNames()).toEqual([
      "Positive balance",
    ]);
  });

  it("should not hide imported tokens, even if they have a zero balance.", async () => {
    importedTokensStore.set({
      importedTokens: [
        {
          ledgerCanisterId: zeroBalance.universeId,
          indexCanisterId: undefined,
        },
      ],
      certified: true,
    });
    const po = renderPage([positiveBalance, zeroBalance]);

    expect(await po.getTokensTable().getTokenNames()).toEqual([
      "Positive balance",
      "Zero balance",
    ]);

    await po.getSettingsButtonPo().click();
    await po.getHideZeroBalancesTogglePo().getTogglePo().toggle();

    // Finish transitions
    await advanceTime(500);

    expect(await po.getTokensTable().getTokenNames()).toEqual([
      "Positive balance",
      "Zero balance",
    ]);
  });

  it("should hide tokens without balance", async () => {
    const po = renderPage([unavailableBalance, positiveBalance]);

    expect(await po.getTokensTable().getTokenNames()).toEqual([
      "Positive balance",
      "Unavailable balance",
    ]);

    await po.getSettingsButtonPo().click();
    await po.getHideZeroBalancesTogglePo().getTogglePo().toggle();

    // Finish transitions
    await advanceTime(500);

    expect(await po.getTokensTable().getTokenNames()).toEqual([
      "Positive balance",
    ]);
  });

  it("should not hide ICP even with zero balance and should prioritize it", async () => {
    const po = renderPage([icpZeroBalance, positiveBalance]);

    expect(await po.getTokensTable().getTokenNames()).toEqual([
      "Internet Computer",
      "Positive balance",
    ]);

    await po.getSettingsButtonPo().click();
    await po.getHideZeroBalancesTogglePo().getTogglePo().toggle();

    expect(await po.getTokensTable().getTokenNames()).toEqual([
      "Internet Computer",
      "Positive balance",
    ]);
  });

  it("show-all button should show all tokens", async () => {
    const po = renderPage([positiveBalance, zeroBalance]);

    expect(await po.getShowAllButtonPo().isPresent()).toBe(false);

    await po.getSettingsButtonPo().click();
    await po.getHideZeroBalancesTogglePo().getTogglePo().toggle();

    // Finish transitions
    await advanceTime(500);

    expect(await po.getTokensTable().getTokenNames()).toEqual([
      "Positive balance",
    ]);

    expect(await po.getShowAllButtonPo().isPresent()).toBe(true);
    await po.getShowAllButtonPo().click();

    // Finish transitions
    await advanceTime(500);

    expect(await po.getShowAllButtonPo().isPresent()).toBe(false);
    expect(await po.getTokensTable().getTokenNames()).toEqual([
      "Positive balance",
      "Zero balance",
    ]);
  });

  describe("when import token feature flag is enabled", () => {
    it("should show import token button", async () => {
      const po = renderPage([positiveBalance, zeroBalance]);
      expect(await po.getImportTokenButtonPo().isPresent()).toBe(true);
    });

    it("should show import token and show all buttons", async () => {
      const po = renderPage([positiveBalance, zeroBalance]);

      expect(await po.getShowAllButtonPo().isPresent()).toBe(false);

      await po.getSettingsButtonPo().click();
      await po.getHideZeroBalancesTogglePo().getTogglePo().toggle();

      expect(await po.getShowAllButtonPo().isPresent()).toBe(true);
      expect(await po.getImportTokenButtonPo().isPresent()).toBe(true);
    });

    it("should not display import token button before imported tokens are available", async () => {
      importedTokensStore.reset();
      const po = renderPage([]);

      expect(await po.getImportTokenButtonPo().isPresent()).toBe(false);

      importedTokensStore.set({ importedTokens: [], certified: true });
      await runResolvedPromises();
      expect(await po.getImportTokenButtonPo().isPresent()).toBe(true);
    });

    it("should disable import token button when maximum imported", async () => {
      const setImportedTokens = (count: number) =>
        importedTokensStore.set({
          importedTokens: Array.from({ length: count }, (_, i) => ({
            ledgerCanisterId: principal(i),
            indexCanisterId: undefined,
          })),
          certified: true,
        });

      setImportedTokens(MAX_IMPORTED_TOKENS - 1);
      const po = renderPage([]);
      await runResolvedPromises();

      expect(await po.getImportTokenButtonPo().isPresent()).toBe(true);
      expect(await po.getImportTokenButtonPo().isDisabled()).toBe(false);

      setImportedTokens(MAX_IMPORTED_TOKENS);
      await runResolvedPromises();
      expect(await po.getImportTokenButtonPo().isDisabled()).toBe(true);

      setImportedTokens(MAX_IMPORTED_TOKENS + 1);
      await runResolvedPromises();
      expect(await po.getImportTokenButtonPo().isDisabled()).toBe(true);
    });

    it("should open import token modal", async () => {
      const po = renderPage([positiveBalance, zeroBalance]);

      await po.getImportTokenButtonPo().click();

      expect(await po.getImportTokenModalPo().isPresent()).toBe(true);
    });

    it("opens import token modal when ledger canister id in URL", async () => {
      vi.spyOn(ledgerApi, "queryIcrcToken").mockResolvedValue({
        name: "Tetris",
        symbol: "TET",
        logo: "https://tetris.tet/logo.png",
      } as IcrcTokenMetadata);

      page.mock({
        routeId: AppPath.Tokens,
        data: {
          universe: OWN_CANISTER_ID_TEXT,
          importTokenLedgerId: principal(1).toText(),
        },
      });
      const po = renderPage([positiveBalance, zeroBalance]);

      expect(await po.getImportTokenModalPo().isPresent()).toBe(true);
    });
  });

  it("should show total USD value banner when feature flag is enabled", async () => {
    const po = renderPage(userTokensPageMock);

    expect(await po.getUsdValueBannerPo().isPresent()).toBe(true);
  });

  it("should show total USD value", async () => {
    const token1 = createUserToken({
      universeId: principal(1),
      balanceInUsd: 2,
    });
    const token2 = createUserToken({
      universeId: principal(2),
      balanceInUsd: 3,
    });
    const po = renderPage([token1, token2]);

    expect(await po.getUsdValueBannerPo().isPresent()).toBe(true);
    expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe("$5.00");
    expect(
      await po.getUsdValueBannerPo().getTotalsTooltipIconPo().isPresent()
    ).toBe(false);
  });

  it("should ignore tokens with unknown balance in USD when adding up the total", async () => {
    const token1 = createUserToken({
      universeId: principal(1),
      balanceInUsd: 3,
    });
    const token2 = createUserToken({
      universeId: principal(2),
      balanceInUsd: undefined,
    });
    const token3 = createUserToken({
      universeId: principal(3),
      balanceInUsd: 5,
    });
    const po = renderPage([token1, token2, token3]);

    expect(await po.getUsdValueBannerPo().isPresent()).toBe(true);
    expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe("$8.00");
    expect(
      await po.getUsdValueBannerPo().getTotalsTooltipIconPo().isPresent()
    ).toBe(true);
  });

  it("should order by balance by default", async () => {
    const po = renderPage(userTokensPageMock);

    expect(get(tokensTableOrderStore)).toEqual([
      {
        columnId: "balance",
      },
      {
        columnId: "title",
      },
    ]);

    expect(await po.getTokensTable().getColumnHeaderWithArrow()).toBe(
      "Balance"
    );
  });

  it("should change order based on order store", async () => {
    const po = renderPage(userTokensPageMock);
    expect(await po.getTokensTable().getColumnHeaderWithArrow()).toBe(
      "Balance"
    );

    tokensTableOrderStore.set([
      {
        columnId: "title",
      },
    ]);

    expect(await po.getTokensTable().getColumnHeaderWithArrow()).toBe(
      "Projects"
    );
  });

  it("should change order store based on clicked header", async () => {
    const po = renderPage(userTokensPageMock);
    expect(await po.getTokensTable().getColumnHeaderWithArrow()).toBe(
      "Balance"
    );

    expect(get(tokensTableOrderStore)).toEqual([
      {
        columnId: "balance",
      },
      {
        columnId: "title",
      },
    ]);

    await po.getTokensTable().clickColumnHeader("Projects");

    expect(get(tokensTableOrderStore)).toEqual([
      {
        columnId: "title",
      },
      {
        columnId: "balance",
      },
    ]);
  });
});
