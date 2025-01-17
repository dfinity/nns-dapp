import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import Portfolio from "$lib/pages/Portfolio.svelte";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import type { TableProject } from "$lib/types/staking";
import type { UserToken } from "$lib/types/tokens-page";
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
import { mockToken, principal } from "$tests/mocks/sns-projects.mock";
import { mockTableProject } from "$tests/mocks/staking.mock";
import { createUserToken } from "$tests/mocks/tokens-page.mock";
import { PortfolioPagePo } from "$tests/page-objects/PortfolioPage.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { ICPToken, TokenAmountV2 } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("Portfolio page", () => {
  const renderPage = ({
    userTokens = [],
    tableProjects = [],
  }: { userTokens?: UserToken[]; tableProjects?: TableProject[] } = {}) => {
    const { container } = render(Portfolio, {
      props: {
        userTokens,
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

    it("should show the HeldTokensCard default data", async () => {
      const po = renderPage();

      const tokensCardPo = po.getHeldTokensCardPo();

      expect(await po.getNoHeldTokensCard().isPresent()).toBe(false);
      expect(await tokensCardPo.isPresent()).toBe(true);
      expect(await tokensCardPo.getInfoRow().isPresent()).toBe(false);
    });

    it("should show the StakedTokensCard default data", async () => {
      const po = renderPage();

      const stakedTokensCardPo = po.getStakedTokensCardPo();

      expect(await po.getNoStakedTokensCarPo().isPresent()).toBe(false);
      expect(await stakedTokensCardPo.isPresent()).toBe(true);
      expect(await stakedTokensCardPo.getInfoRow().isPresent()).toBe(false);
    });
  });

  describe("when logged in", () => {
    const token1 = createUserToken({
      balanceInUsd: 100,
      universeId: principal(1),
      title: "Token1",
      balance: TokenAmountV2.fromUlps({
        amount: 2160000000n,
        token: mockToken,
      }),
    });
    const token2 = createUserToken({
      balanceInUsd: 200,
      universeId: principal(2),
      title: "Token2",
      balance: TokenAmountV2.fromUlps({
        amount: 2160000000n,
        token: mockToken,
      }),
    });
    const token3 = createUserToken({
      balanceInUsd: 300,
      universeId: principal(3),
      title: "Token3",
      balance: TokenAmountV2.fromUlps({
        amount: 2160000000n,
        token: mockToken,
      }),
    });
    const token4 = createUserToken({
      balanceInUsd: 400,
      universeId: principal(4),
      title: "Token4",
      balance: TokenAmountV2.fromUlps({
        amount: 2160000000n,
        token: mockToken,
      }),
    });
    const token5 = createUserToken({
      balanceInUsd: 500,
      universeId: principal(5),
      title: "Token5",
      balance: TokenAmountV2.fromUlps({
        amount: 2160000000n,
        token: mockToken,
      }),
    });

    const icpProject: TableProject = {
      ...mockTableProject,
      stakeInUsd: 100,
      domKey: "/staking/icp",
      stake: TokenAmountV2.fromUlps({
        amount: 1000_000n,
        token: ICPToken,
      }),
      availableMaturity: 1_000_000_000n,
      stakedMaturity: 1_000_000_000n,
    };
    const tableProject1: TableProject = {
      ...mockTableProject,
      title: "Project 1",
      stakeInUsd: 200,
      domKey: "/staking/1",
      universeId: principal(1).toText(),
      stake: TokenAmountV2.fromUlps({
        amount: 1000_000n,
        token: mockToken,
      }),
    };
    const tableProject2: TableProject = {
      ...mockTableProject,
      title: "Project 2",
      stakeInUsd: 300,
      domKey: "/staking/2",

      universeId: principal(2).toText(),
      stake: TokenAmountV2.fromUlps({
        amount: 1000_000n,
        token: mockToken,
      }),
    };
    const tableProject3: TableProject = {
      ...mockTableProject,
      title: "Project 3",
      stakeInUsd: 400,
      domKey: "/staking/3",
      universeId: principal(3).toText(),
      availableMaturity: 100_000_000n,
      stake: TokenAmountV2.fromUlps({
        amount: 0n,
        token: mockToken,
      }),
    };
    const tableProject4: TableProject = {
      ...mockTableProject,
      title: "Project 4",
      stakeInUsd: undefined,
      domKey: "/staking/4",
      universeId: principal(5).toText(),
      stake: new UnavailableTokenAmount(mockToken),
    };

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

    describe("NoHeldTokensCard", () => {
      it("should display the card when the tokens accounts balance is zero", async () => {
        const po = renderPage();

        expect(await po.getNoHeldTokensCard().isPresent()).toBe(true);
        expect(await po.getHeldTokensCardPo().isPresent()).toBe(false);
        expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe("$0.00");
      });

      it("should not display the card when the tokens accounts balance is not zero", async () => {
        const token = createUserToken({
          universeId: principal(1),
          balanceInUsd: 2,
        });
        const po = renderPage({ userTokens: [token] });

        expect(await po.getNoHeldTokensCard().isPresent()).toBe(false);
        expect(await po.getHeldTokensCardPo().isPresent()).toBe(true);
        expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe("$2.00");
      });
    });

    describe("HeldTokensCard", () => {
      it("should display the top four tokens by balanceInUsd", async () => {
        const po = renderPage({
          userTokens: [token1, token2, token3, token4, token5],
        });
        const tokensCardPo = po.getHeldTokensCardPo();

        const titles = await tokensCardPo.getHeldTokensTitles();
        const usdBalances = await tokensCardPo.getHeldTokensBalanceInUsd();
        const nativeBalances =
          await tokensCardPo.getHeldTokensBalanceInNativeCurrency();

        expect(await po.getNoHeldTokensCard().isPresent()).toBe(false);

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
          userTokens: [token1, token2],
        });
        const tokensCardPo = po.getHeldTokensCardPo();

        const titles = await tokensCardPo.getHeldTokensTitles();
        const usdBalances = await tokensCardPo.getHeldTokensBalanceInUsd();
        const nativeBalances =
          await tokensCardPo.getHeldTokensBalanceInNativeCurrency();

        expect(await po.getNoHeldTokensCard().isPresent()).toBe(false);

        expect(titles.length).toBe(2);
        expect(titles).toEqual(["Token2", "Token1"]);

        expect(usdBalances.length).toBe(2);
        expect(usdBalances).toEqual(["$200.00", "$100.00"]);

        expect(nativeBalances.length).toBe(2);
        expect(nativeBalances).toEqual(["21.60 TET", "21.60 TET"]);

        expect(await tokensCardPo.getInfoRow().isPresent()).toBe(true);
      });
    });

    describe("StakedTokensCard", () => {
      it("should display the top staked tokens by staked balance in Usd with InternetComputer as first", async () => {
        const po = renderPage({
          tableProjects: [
            tableProject1,
            tableProject2,
            tableProject3,
            tableProject4,
            icpProject,
          ],
        });
        const stakedTokensCardPo = po.getStakedTokensCardPo();

        const titles = await stakedTokensCardPo.getStakedTokensTitle();
        const maturities = await stakedTokensCardPo.getStakedTokensMaturity();
        const stakesInUsd =
          await stakedTokensCardPo.getStakedTokensStakeInUsd();
        const stakesInNativeCurrency =
          await stakedTokensCardPo.getStakedTokensStakeInNativeCurrency();

        expect(await po.getNoStakedTokensCarPo().isPresent()).toBe(false);

        expect(titles.length).toBe(4);
        expect(titles).toEqual([
          "Internet Computer",
          "Project 3",
          "Project 2",
          "Project 1",
        ]);

        expect(maturities.length).toBe(4);
        expect(maturities).toEqual(["20.00", "1.00", "0", "0"]);

        expect(stakesInUsd.length).toBe(4);
        expect(stakesInUsd).toEqual([
          "$100.00",
          "$400.00",
          "$300.00",
          "$200.00",
        ]);

        expect(stakesInNativeCurrency.length).toBe(4);
        expect(stakesInNativeCurrency).toEqual([
          "0.01 ICP",
          "0 TET",
          "0.01 TET",
          "0.01 TET",
        ]);

        expect(await stakedTokensCardPo.getInfoRow().isPresent()).toBe(false);
      });

      it("should display the information row when the staked tokens card has less items than the held tokens card", async () => {
        const po = renderPage({
          tableProjects: [tableProject1, tableProject2],
          userTokens: [token1, token2, token3, token4],
        });
        const stakedTokensCardPo = po.getStakedTokensCardPo();

        const titles = await stakedTokensCardPo.getStakedTokensTitle();
        const maturities = await stakedTokensCardPo.getStakedTokensMaturity();
        const stakesInUsd =
          await stakedTokensCardPo.getStakedTokensStakeInUsd();
        const stakesInNativeCurrency =
          await stakedTokensCardPo.getStakedTokensStakeInNativeCurrency();

        expect(await po.getNoStakedTokensCarPo().isPresent()).toBe(false);

        expect(titles.length).toBe(2);
        expect(titles).toEqual(["Project 2", "Project 1"]);

        expect(maturities.length).toBe(2);
        expect(maturities).toEqual(["0", "0"]);

        expect(stakesInUsd.length).toBe(2);
        expect(stakesInUsd).toEqual(["$300.00", "$200.00"]);

        expect(stakesInNativeCurrency.length).toBe(2);
        expect(stakesInNativeCurrency).toEqual(["0.01 TET", "0.01 TET"]);

        expect(await stakedTokensCardPo.getInfoRow().isPresent()).toBe(true);
      });
    });

    describe("NoStakedTokensCard", () => {
      it("should display the card when the total balance is zero", async () => {
        const po = renderPage();

        expect(await po.getNoStakedTokensCarPo().isPresent()).toBe(true);
        expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe("$0.00");
      });

      it("should not display the card when the neurons accounts balance is not zero", async () => {
        const tableProject: TableProject = {
          ...mockTableProject,
          stakeInUsd: 2,
        };
        const po = renderPage({ tableProjects: [tableProject] });

        expect(await po.getNoStakedTokensCarPo().isPresent()).toBe(false);
        expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe("$2.00");
      });

      it("should display a primary action when the neurons accounts balance is zero and the tokens balance is not zero", async () => {
        const token = createUserToken({
          universeId: principal(1),
          balanceInUsd: 2,
        });
        const po = renderPage({ userTokens: [token] });

        expect(await po.getNoStakedTokensCarPo().isPresent()).toBe(true);
        expect(await po.getNoStakedTokensCarPo().hasPrimaryAction()).toBe(true);
        expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe("$2.00");
      });

      it("should not display a primary action when the neurons accounts balance is zero and the tokens balance is also zero", async () => {
        const po = renderPage();

        expect(await po.getNoStakedTokensCarPo().isPresent()).toBe(true);
        expect(await po.getNoStakedTokensCarPo().hasPrimaryAction()).toBe(
          false
        );
        expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe("$0.00");
      });
    });

    describe("UsdValueBanner", () => {
      const token1 = createUserToken({
        universeId: principal(1),
        balanceInUsd: 5,
      });
      const token2 = createUserToken({
        universeId: principal(2),
        balanceInUsd: 7,
      });
      const token3 = createUserToken({
        universeId: principal(3),
        balanceInUsd: undefined,
      });

      const tableProject1: TableProject = {
        ...mockTableProject,
        stakeInUsd: 2,
        domKey: "/project/1",
      };
      const tableProject2: TableProject = {
        ...mockTableProject,
        stakeInUsd: 10.5,
        domKey: "/project/2",
      };
      const tableProject3: TableProject = {
        ...mockTableProject,
        stakeInUsd: undefined,
        domKey: "/project/3",
      };

      it("should display total assets", async () => {
        const po = renderPage({
          userTokens: [token1, token2],
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
        const po = renderPage({ userTokens: [token1, token2, token3] });

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
