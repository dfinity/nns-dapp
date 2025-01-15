import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import Portfolio from "$lib/pages/Portfolio.svelte";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import type { TableProject } from "$lib/types/staking";
import type { UserToken } from "$lib/types/tokens-page";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
import { mockToken, principal } from "$tests/mocks/sns-projects.mock";
import { mockTableProject } from "$tests/mocks/staking.mock";
import { createUserToken } from "$tests/mocks/tokens-page.mock";
import { PortfolioPagePo } from "$tests/page-objects/PortfolioPage.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { TokenAmountV2 } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("Portfolio page", () => {
  const renderPage = ({
    userTokensData = [],
    tableProjects = [],
  }: { userTokensData?: UserToken[]; tableProjects?: TableProject[] } = {}) => {
    const { container } = render(Portfolio, {
      props: {
        userTokensData,
        tableProjects,
      },
    });

    return PortfolioPagePo.under(new JestPageObjectElement(container));
  };

  describe("when not logged in", () => {
    beforeEach(() => {
      setNoIdentity();
    });

    it("should display the LoginCard when the user is not logged in", async () => {
      const po = renderPage();

      expect(await po.getLoginCard().isPresent()).toBe(true);
    });

    it("should show the NoTokensCard", async () => {
      const po = renderPage();

      expect(await po.getNoTokensCard().isPresent()).toBe(true);
    });

    it("should show the NoProjectsCardPo with secondary action", async () => {
      const po = renderPage();

      expect(await po.getNoNeuronsCarPo().isPresent()).toBe(true);
      expect(await po.getNoNeuronsCarPo().hasSecondaryAction()).toBe(true);
    });
  });

  describe("when logged in", () => {
    beforeEach(() => {
      resetIdentity();

      icpSwapTickersStore.set([
        {
          ...mockIcpSwapTicker,
          base_id: CKUSDC_UNIVERSE_CANISTER_ID.toText(),
          last_price: "10.00",
        },
      ]);
    });

    it("should not display the LoginCard when the user is logged in", async () => {
      const po = renderPage();

      expect(await po.getLoginCard().isPresent()).toBe(false);
    });

    describe("NoTokensCard", () => {
      it("should display the card when the tokens accounts balance is zero", async () => {
        const po = renderPage();

        expect(await po.getNoTokensCard().isPresent()).toBe(true);
        expect(await po.getTokensCardPo().isPresent()).toBe(false);
        expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe("$0.00");
      });

      it("should not display the card when the tokens accounts balance is not zero", async () => {
        const token = createUserToken({
          universeId: principal(1),
          balanceInUsd: 2,
        });
        const po = renderPage({ userTokensData: [token] });

        expect(await po.getNoTokensCard().isPresent()).toBe(false);
        expect(await po.getTokensCardPo().isPresent()).toBe(true);
        expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe("$2.00");
      });
    });

    describe("TokensCard", () => {
      const token1 = createUserToken({
        balanceInUsd: 100,
        rowHref: "/tokens/1",
        title: "Token1",
        balance: TokenAmountV2.fromUlps({
          amount: 2160000000n,
          token: mockToken,
        }),
      });
      const token2 = createUserToken({
        balanceInUsd: 200,
        rowHref: "/tokens/2",
        title: "Token2",
        balance: TokenAmountV2.fromUlps({
          amount: 2160000000n,
          token: mockToken,
        }),
      });
      const token3 = createUserToken({
        balanceInUsd: 300,
        rowHref: "/tokens/3",
        title: "Token3",
        balance: TokenAmountV2.fromUlps({
          amount: 2160000000n,
          token: mockToken,
        }),
      });
      const token4 = createUserToken({
        balanceInUsd: 400,
        rowHref: "/tokens/4",
        title: "Token4",
        balance: TokenAmountV2.fromUlps({
          amount: 2160000000n,
          token: mockToken,
        }),
      });
      const token5 = createUserToken({
        balanceInUsd: 500,
        rowHref: "/tokens/5",
        title: "Token5",
        balance: TokenAmountV2.fromUlps({
          amount: 2160000000n,
          token: mockToken,
        }),
      });

      it("should display the top four tokens by balanceInUsd", async () => {
        const po = renderPage({
          userTokensData: [token1, token2, token3, token4, token5],
        });
        const tokensCardPo = po.getTokensCardPo();

        const titles = await tokensCardPo.getTokensTitles();
        const usdBalances = await tokensCardPo.getTokensUsdBalances();
        const nativeBalances = await tokensCardPo.getTokensNativeBalances();

        expect(await po.getNoTokensCard().isPresent()).toBe(false);

        expect(titles.length).toBe(4);
        expect(titles).toEqual(["Token5", "Token4", "Token3", "Token2"]);

        expect(usdBalances.length).toBe(4);
        expect(usdBalances).toEqual([
          "$500.00",
          "$400.00",
          "$300.00",
          "$200.00",
        ]);

        expect(nativeBalances.length).toBe(4);
        expect(nativeBalances).toEqual([
          "21.60 TET",
          "21.60 TET",
          "21.60 TET",
          "21.60 TET",
        ]);

        expect(await tokensCardPo.getInfoRow().isPresent()).toBe(false);
      });

      it("should display the information row when less then three tokens", async () => {
        const po = renderPage({
          userTokensData: [token1, token2],
        });
        const tokensCardPo = po.getTokensCardPo();

        const titles = await tokensCardPo.getTokensTitles();
        const usdBalances = await tokensCardPo.getTokensUsdBalances();
        const nativeBalances = await tokensCardPo.getTokensNativeBalances();

        expect(await po.getNoTokensCard().isPresent()).toBe(false);

        expect(titles.length).toBe(2);
        expect(titles).toEqual(["Token2", "Token1"]);

        expect(usdBalances.length).toBe(2);
        expect(usdBalances).toEqual(["$200.00", "$100.00"]);

        expect(nativeBalances.length).toBe(2);
        expect(nativeBalances).toEqual(["21.60 TET", "21.60 TET"]);

        expect(await tokensCardPo.getInfoRow().isPresent()).toBe(true);
      });
    });

    describe("NoProjectsCard", () => {
      it("should display the card when the total balance is zero", async () => {
        const po = renderPage();

        expect(await po.getNoNeuronsCarPo().isPresent()).toBe(true);
        expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe("$0.00");
      });

      it("should not display the card when the neurons accounts balance is not zero", async () => {
        const tableProject: TableProject = {
          ...mockTableProject,
          stakeInUsd: 2,
        };
        const po = renderPage({ tableProjects: [tableProject] });

        expect(await po.getNoNeuronsCarPo().isPresent()).toBe(false);
        expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe("$2.00");
      });

      it("should display a primary action when the neurons accounts balance is zero and the tokens balance is not zero", async () => {
        const token = createUserToken({
          universeId: principal(1),
          balanceInUsd: 2,
        });
        const po = renderPage({ userTokensData: [token] });

        expect(await po.getNoNeuronsCarPo().isPresent()).toBe(true);
        expect(await po.getNoNeuronsCarPo().hasPrimaryAction()).toBe(true);
        expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe("$2.00");
      });

      it("should not display a primary action when the neurons accounts balance is zero and the tokens balance is also zero", async () => {
        const po = renderPage();

        expect(await po.getNoNeuronsCarPo().isPresent()).toBe(true);
        expect(await po.getNoNeuronsCarPo().hasPrimaryAction()).toBe(false);
        expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe("$0.00");
      });
    });

    describe("UsdValueBanner", () => {
      const token1 = createUserToken({
        universeId: principal(1),
        balanceInUsd: 5,
        rowHref: "/token/1",
      });
      const token2 = createUserToken({
        universeId: principal(1),
        balanceInUsd: 7,
        rowHref: "/token/2",
      });
      const token3 = createUserToken({
        universeId: principal(1),
        balanceInUsd: undefined,
        rowHref: "/token/3",
      });

      const tableProject1: TableProject = {
        ...mockTableProject,
        stakeInUsd: 2,
      };
      const tableProject2: TableProject = {
        ...mockTableProject,
        stakeInUsd: 10.5,
      };
      const tableProject3: TableProject = {
        ...mockTableProject,
        stakeInUsd: undefined,
      };

      it("should display total assets", async () => {
        const po = renderPage({
          userTokensData: [token1, token2],
          tableProjects: [tableProject1, tableProject2],
        });

        // There are two tokens with a balance of 5$ and 7$, and two projects with a staked balance of 2$ and 10.5$ -> 24.5$
        expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe(
          "$24.50"
        );
        // 1ICP == 10$
        expect(await po.getUsdValueBannerPo().getSecondaryAmount()).toBe(
          "2.45 ICP"
        );
        expect(
          await po.getUsdValueBannerPo().getTotalsTooltipIconPo().isPresent()
        ).toBe(false);
      });

      it("should ignore tokens with unknown balance in USD and display tooltip", async () => {
        const po = renderPage({ userTokensData: [token1, token2, token3] });

        expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe(
          "$12.00"
        );
        expect(await po.getUsdValueBannerPo().getSecondaryAmount()).toBe(
          "1.20 ICP"
        );
        expect(
          await po.getUsdValueBannerPo().getTotalsTooltipIconPo().isPresent()
        ).toBe(true);
      });

      it("should ignore neurons with unknown balance in USD and display tooltip", async () => {
        const po = renderPage({
          tableProjects: [tableProject1, tableProject2, tableProject3],
        });

        expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe(
          "$12.50"
        );
        expect(await po.getUsdValueBannerPo().getSecondaryAmount()).toBe(
          "1.25 ICP"
        );
        expect(
          await po.getUsdValueBannerPo().getTotalsTooltipIconPo().isPresent()
        ).toBe(true);
      });
    });
  });
});
