import HeldTokensCard from "$lib/components/portfolio/HeldTokensCard.svelte";
import { isDesktopViewportStore } from "$lib/derived/viewport.derived";
import { balancePrivacyOptionStore } from "$lib/stores/balance-privacy-option.store";
import type { UserTokenData } from "$lib/types/tokens-page";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockCkBTCToken as CkBTCToken } from "$tests/mocks/ckbtc-accounts.mock";
import { mockCkETHToken as CkETHToken } from "$tests/mocks/cketh-accounts.mock";
import {
  ckBTCTokenBase,
  ckETHTokenBase,
  createIcpUserToken,
  createUserToken,
} from "$tests/mocks/tokens-page.mock";
import { HeldTokensCardPo } from "$tests/page-objects/HeldTokensCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { ICPToken, TokenAmountV2 } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("HeldTokensCard", () => {
  const renderComponent = ({
    topHeldTokens = [],
    usdAmount = 0,
    numberOfTopStakedTokens = 0,
  }: {
    topHeldTokens?: UserTokenData[];
    usdAmount?: number;
    numberOfTopStakedTokens?: number;
  }) => {
    const { container } = render(HeldTokensCard, {
      props: {
        topHeldTokens,
        usdAmount,
        numberOfTopStakedTokens,
      },
    });

    return HeldTokensCardPo.under({
      element: new JestPageObjectElement(container),
    });
  };

  const mockIcpToken = createIcpUserToken();
  mockIcpToken.balanceInUsd = 100;
  mockIcpToken.balance = TokenAmountV2.fromUlps({
    amount: 2160000000n,
    token: ICPToken,
  });

  const mockCkBTCToken = createUserToken(ckBTCTokenBase);
  mockCkBTCToken.balanceInUsd = 200;
  mockCkBTCToken.balance = TokenAmountV2.fromUlps({
    amount: 2160000000n,
    token: CkBTCToken,
  });

  const mockCkETHToken = createUserToken(ckETHTokenBase);
  mockCkETHToken.balanceInUsd = 300;
  mockCkETHToken.balance = TokenAmountV2.fromUlps({
    amount: 21606000000000000000n,
    token: CkETHToken,
  });

  const mockTokens = [
    mockIcpToken,
    mockCkBTCToken,
    mockCkETHToken,
  ] as UserTokenData[];

  beforeEach(() => {
    resetIdentity();
  });

  it("should show the usd amount", async () => {
    const po = renderComponent({
      topHeldTokens: mockTokens,
      usdAmount: 6000,
    });

    expect(await po.getAmount()).toBe("$6’000");
  });

  it("should hide the usd amount", async () => {
    balancePrivacyOptionStore.set("hide");

    const po = renderComponent({
      topHeldTokens: mockTokens,
      usdAmount: 6000,
    });

    expect(await po.getAmount()).toBe("$•••");
  });

  it("should show all the tokens with their balance", async () => {
    const po = renderComponent({
      topHeldTokens: mockTokens,
      usdAmount: 600,
    });
    const titles = await po.getHeldTokensTitles();
    const usdBalances = await po.getHeldTokensBalanceInUsd();
    const nativeBalances = await po.getHeldTokensBalanceInNativeCurrency();

    expect(titles.length).toBe(3);
    expect(titles).toEqual(["Internet Computer", "ckBTC", "ckETH"]);

    expect(usdBalances.length).toBe(3);
    expect(usdBalances).toEqual(["$100.00", "$200.00", "$300.00"]);

    expect(nativeBalances.length).toBe(3);
    expect(nativeBalances).toEqual(["21.60 ICP", "21.60 ckBTC", "21.61 ckETH"]);
  });

  it("should hide the balances for all the tokens", async () => {
    balancePrivacyOptionStore.set("hide");

    const po = renderComponent({
      topHeldTokens: mockTokens,
      usdAmount: 600,
    });
    const titles = await po.getHeldTokensTitles();
    const usdBalances = await po.getHeldTokensBalanceInUsd();
    const nativeBalances = await po.getHeldTokensBalanceInNativeCurrency();

    expect(titles.length).toBe(3);
    expect(titles).toEqual(["Internet Computer", "ckBTC", "ckETH"]);

    expect(usdBalances.length).toBe(3);
    expect(usdBalances).toEqual(["$•••", "$•••", "$•••"]);

    expect(nativeBalances.length).toBe(3);
    expect(nativeBalances).toEqual(["••• ICP", "••• ckBTC", "••• ckETH"]);
  });

  it("should render links for each row", async () => {
    const po = renderComponent({
      topHeldTokens: mockTokens,
    });

    const allHrefs = await po.getRowsHref();

    expect(allHrefs).toEqual([
      mockTokens[0].rowHref,
      mockTokens[1].rowHref,
      mockTokens[2].rowHref,
    ]);
  });

  it("should not show info row when numberOfTopHeldTokens is the same as the number of topStakedTokens", async () => {
    const po = renderComponent({
      topHeldTokens: mockTokens.slice(0, 3),
      usdAmount: 600,
      numberOfTopStakedTokens: 3,
    });
    const titles = await po.getHeldTokensTitles();
    const balances = await po.getHeldTokensBalanceInUsd();
    const nativeBalances = await po.getHeldTokensBalanceInNativeCurrency();

    expect(titles.length).toBe(3);
    expect(titles).toEqual(["Internet Computer", "ckBTC", "ckETH"]);

    expect(balances.length).toBe(3);
    expect(balances).toEqual(["$100.00", "$200.00", "$300.00"]);

    expect(nativeBalances.length).toBe(3);
    expect(nativeBalances).toEqual(["21.60 ICP", "21.60 ckBTC", "21.61 ckETH"]);

    expect(await po.getInfoRow().isPresent()).toBe(false);
  });

  describe("desktop viewport", () => {
    beforeEach(() => {
      // TODO: Move this to a helper or similar
      vi.spyOn(isDesktopViewportStore, "subscribe").mockImplementation((fn) => {
        fn(true);
        return () => {};
      });
    });

    it("should show info row when tokens length is 1", async () => {
      const po = renderComponent({
        topHeldTokens: mockTokens.slice(0, 1),
        usdAmount: 100,
      });

      expect(await po.getInfoRow().isPresent()).toBe(true);
      expect(await po.getLinkRow().isPresent()).toBe(false);
    });

    it("should show info row when tokens length is 2", async () => {
      const po = renderComponent({
        topHeldTokens: mockTokens.slice(0, 2),
        usdAmount: 300,
      });

      expect(await po.getInfoRow().isPresent()).toBe(true);
      expect(await po.getLinkRow().isPresent()).toBe(false);
    });

    it("should not show info row but show link row when tokens length is 4 or more", async () => {
      const po = renderComponent({
        topHeldTokens: [
          ...mockTokens,
          createUserToken({
            balanceInUsd: 300,
            rowHref: "/tokens/test1",
          }),
          createUserToken({
            balanceInUsd: 100,
            rowHref: "/tokens/test2",
          }),
        ],
        usdAmount: 300,
      });

      expect(await po.getInfoRow().isPresent()).toBe(false);
      expect(await po.getLinkRow().isPresent()).toBe(true);
    });
  });
});
