import TokensCard from "$lib/components/portfolio/TokensCard.svelte";
import type { UserTokenData } from "$lib/types/tokens-page";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import {
  ckBTCTokenBase,
  ckETHTokenBase,
  createIcpUserToken,
  createUserToken,
} from "$tests/mocks/tokens-page.mock";
import { TokensCardPo } from "$tests/page-objects/TokensCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("TokensCard", () => {
  const renderComponent = (props: {
    topTokens: UserTokenData[];
    usdAmount: number;
  }) => {
    const { container } = render(TokensCard, {
      props,
    });

    return TokensCardPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    resetIdentity();
  });

  describe("when not signed in", () => {
    const mockIcpToken = createIcpUserToken();
    const mockCkBTCToken = createUserToken(ckBTCTokenBase);
    const mockCkETHToken = createUserToken(ckETHTokenBase);

    const mockTokens = [
      mockIcpToken,
      mockCkBTCToken,
      mockCkETHToken,
    ] as UserTokenData[];

    beforeEach(() => {
      setNoIdentity();
    });

    it("should show placeholder balance", async () => {
      const po = renderComponent({
        topTokens: mockTokens,
        usdAmount: 0,
      });

      expect(await po.getAmount()).toBe("$-/-");
    });

    it("should show list of tokens with name and balance", async () => {
      const po = renderComponent({
        topTokens: mockTokens,
        usdAmount: 0,
      });
      const titles = await po.getTokensTitles();
      const balances = await po.getTokensBalances();

      expect(titles.length).toBe(3);
      expect(titles).toEqual(["Internet Computer", "ckBTC", "ckETH"]);

      expect(balances.length).toBe(3);
      expect(balances).toEqual(["$0.00", "$0.00", "$0.00"]);
    });
  });

  describe("when signed in", () => {
    const mockIcpToken = createIcpUserToken();
    mockIcpToken.balanceInUsd = 100;

    const mockCkBTCToken = createUserToken(ckBTCTokenBase);
    mockCkBTCToken.balanceInUsd = 200;

    const mockCkETHToken = createUserToken(ckETHTokenBase);
    mockCkETHToken.balanceInUsd = 300;

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
        topTokens: mockTokens,
        usdAmount: 600,
      });

      expect(await po.getAmount()).toBe("$600.00");
    });

    it("should show all the tokens with their balance", async () => {
      const po = renderComponent({
        topTokens: mockTokens,
        usdAmount: 600,
      });
      const titles = await po.getTokensTitles();
      const balances = await po.getTokensBalances();

      expect(titles.length).toBe(3);
      expect(titles).toEqual(["Internet Computer", "ckBTC", "ckETH"]);

      expect(balances.length).toBe(3);
      expect(balances).toEqual(["$100.00", "$200.00", "$300.00"]);
    });

    it("should not show info row when tokens length is 3 or more", async () => {
      const po = renderComponent({
        topTokens: mockTokens.slice(0, 3),
        usdAmount: 600,
      });
      const titles = await po.getTokensTitles();
      const balances = await po.getTokensBalances();

      expect(titles.length).toBe(3);
      expect(titles).toEqual(["Internet Computer", "ckBTC", "ckETH"]);

      expect(balances.length).toBe(3);
      expect(balances).toEqual(["$100.00", "$200.00", "$300.00"]);

      expect(await po.getInfoRow().isPresent()).toBe(false);
    });

    it("should show info row when tokens length is 1", async () => {
      const po = renderComponent({
        topTokens: mockTokens.slice(0, 1),
        usdAmount: 100,
      });

      const titles = await po.getTokensTitles();
      const balances = await po.getTokensBalances();

      expect(titles.length).toBe(1);
      expect(titles).toEqual(["Internet Computer"]);

      expect(balances.length).toBe(1);
      expect(balances).toEqual(["$100.00"]);

      expect(await po.getInfoRow().isPresent()).toBe(true);
    });

    it("should show info row when tokens length is 2", async () => {
      const po = renderComponent({
        topTokens: mockTokens.slice(0, 2),
        usdAmount: 300,
      });

      const titles = await po.getTokensTitles();
      const balances = await po.getTokensBalances();

      expect(titles.length).toBe(2);
      expect(titles).toEqual(["Internet Computer", "ckBTC"]);

      expect(balances.length).toBe(2);
      expect(balances).toEqual(["$100.00", "$200.00"]);

      expect(await po.getInfoRow().isPresent()).toBe(true);
    });
  });
});
