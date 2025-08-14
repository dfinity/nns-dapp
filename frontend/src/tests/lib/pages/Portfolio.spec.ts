import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
import { isDesktopViewportStore } from "$lib/derived/viewport.derived";
import Portfolio from "$lib/pages/Portfolio.svelte";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import type { TableProject } from "$lib/types/staking";
import type { UserToken, UserTokenData } from "$lib/types/tokens-page";
import type { StakingRewardResult } from "$lib/utils/staking-rewards.utils";
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockToken, principal } from "$tests/mocks/sns-projects.mock";
import { mockTableProject } from "$tests/mocks/staking.mock";
import {
  ckBTCTokenBase,
  ckETHTokenBase,
  ckTESTBTCTokenBase,
  createIcpUserToken,
  createUserToken,
  createUserTokenLoading,
} from "$tests/mocks/tokens-page.mock";
import { PortfolioPagePo } from "$tests/page-objects/PortfolioPage.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setIcpPrice } from "$tests/utils/icp-swap.test-utils";
import { ICPToken, TokenAmountV2 } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("Portfolio page", () => {
  const renderPage = ({
    userTokens = [],
    tableProjects = [],
    stakingRewardResult = { loading: true },
  }: {
    userTokens?: UserToken[];
    tableProjects?: TableProject[];
    stakingRewardResult?: StakingRewardResult;
  } = {}) => {
    const { container } = render(Portfolio, {
      props: {
        userTokens,
        tableProjects,
        stakingRewardResult,
      },
    });

    return PortfolioPagePo.under(new JestPageObjectElement(container));
  };

  describe("when not logged in", () => {
    const mockIcpToken = createIcpUserToken();
    const mockCkBTCToken = createUserToken(ckBTCTokenBase);
    const mockCkTESTBTCToken = createUserToken(ckTESTBTCTokenBase);
    const mockCkETHToken = createUserToken(ckETHTokenBase);

    const mockTokens = [
      mockIcpToken,
      mockCkBTCToken,
      mockCkTESTBTCToken,
      mockCkETHToken,
    ] as UserTokenData[];

    const icpProject: TableProject = {
      ...mockTableProject,
      stakeInUsd: undefined,
      domKey: "/staking/icp",
      stake: new UnavailableTokenAmount(NNS_TOKEN_DATA),
    };
    const tableProject1: TableProject = {
      ...mockTableProject,
      title: "Project 1",
      stakeInUsd: undefined,
      domKey: "/staking/1",
      stake: new UnavailableTokenAmount(mockToken),
    };
    const tableProject2: TableProject = {
      ...mockTableProject,
      title: "Project 2",
      stakeInUsd: undefined,
      domKey: "/staking/2",
      stake: new UnavailableTokenAmount(mockToken),
    };

    const tableProject3: TableProject = {
      ...mockTableProject,
      title: "Project 3",
      stakeInUsd: undefined,
      domKey: "/staking/3",
      stake: new UnavailableTokenAmount(mockToken),
    };

    const mockTableProjects: TableProject[] = [
      icpProject,
      tableProject1,
      tableProject2,
      tableProject3,
    ];

    beforeEach(() => {
      setNoIdentity();
    });

    it("should display the LoginCard", async () => {
      const po = renderPage();

      expect(await po.getLoginCard().isPresent()).toBe(true);
    });

    it("should display the StartStakingCard", async () => {
      const po = renderPage();

      expect(await po.getStartStakingCard().isPresent()).toBe(true);
    });

    it("should not show TotalAssetsCard", async () => {
      const po = renderPage();

      expect(await po.getTotalAssetsCardPo().isPresent()).toBe(false);
    });

    it("should not show ApyCard", async () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_APY_PORTFOLIO", true);
      const po = renderPage();

      expect(await po.getApyFallbackCardPo().isPresent()).toBe(false);
    });

    it("should show empty cards for top holdings", async () => {
      const po = renderPage({
        tableProjects: mockTableProjects,
        userTokens: mockTokens,
      });

      const heldTokensCardPo = po.getHeldTokensCardPo();
      const stakedTokensCardPo = po.getStakedTokensCardPo();

      expect(await po.getNoHeldTokensCard().isPresent()).toBe(true);
      expect(await po.getNoStakedTokensCarPo().isPresent()).toBe(true);

      expect(await heldTokensCardPo.isPresent()).toBe(false);
      expect(await stakedTokensCardPo.isPresent()).toBe(false);
    });

    it("should not show any loading state", async () => {
      const po = renderPage({
        tableProjects: mockTableProjects,
        userTokens: mockTokens,
      });

      expect(await po.getTotalAssetsCardPo().hasSpinner()).toEqual(false);
      expect(await po.getHeldTokensSkeletonCard().isPresent()).toEqual(false);
      expect(await po.getStakedTokensSkeletonCard().isPresent()).toEqual(false);
    });
  });

  describe("when logged in", () => {
    const icpToken = createIcpUserToken();
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

      setIcpPrice(10);
    });

    it("should not display the LoginCard when the user is logged in", async () => {
      const po = renderPage();

      expect(await po.getLoginCard().isPresent()).toBe(false);
    });

    it("should not display the StartStakingCard when the user is logged in", async () => {
      const po = renderPage();

      expect(await po.getStartStakingCard().isPresent()).toBe(false);
    });

    describe("NoHeldTokensCard", () => {
      it("should display the card when the tokens accounts balance is zero", async () => {
        const po = renderPage();

        expect(await po.getNoHeldTokensCard().isPresent()).toBe(true);
        expect(await po.getHeldTokensCardPo().isPresent()).toBe(false);
        expect(await po.getTotalAssetsCardPo().getPrimaryAmount()).toBe(
          "$0.00"
        );
      });

      it("should not display the card when the tokens accounts balance is not zero", async () => {
        const token = createUserToken({
          universeId: principal(1),
          balanceInUsd: 2,
        });
        const po = renderPage({ userTokens: [token] });

        expect(await po.getNoHeldTokensCard().isPresent()).toBe(false);
        expect(await po.getHeldTokensCardPo().isPresent()).toBe(true);
        expect(await po.getTotalAssetsCardPo().getPrimaryAmount()).toBe(
          "$2.00"
        );
      });
    });

    describe("HeldTokensCard", () => {
      it("should display the top four tokens by balanceInUsd", async () => {
        const po = renderPage({
          userTokens: [icpToken, token1, token2, token3, token4, token5],
        });
        const tokensCardPo = po.getHeldTokensCardPo();

        const titles = await tokensCardPo.getHeldTokensTitles();
        const usdBalances = await tokensCardPo.getHeldTokensBalanceInUsd();
        const nativeBalances =
          await tokensCardPo.getHeldTokensBalanceInNativeCurrency();

        expect(await po.getNoHeldTokensCard().isPresent()).toBe(false);

        expect(titles.length).toBe(4);
        expect(titles).toEqual([
          "Internet Computer",
          "Token5",
          "Token4",
          "Token3",
        ]);

        expect(usdBalances.length).toBe(4);
        expect(usdBalances).toEqual(["$0.00", "$500.00", "$400.00", "$300.00"]);

        expect(nativeBalances.length).toBe(4);
        expect(nativeBalances).toEqual([
          "-/- ICP",
          "21.60 TET",
          "21.60 TET",
          "21.60 TET",
        ]);

        expect(await tokensCardPo.getInfoRow().isPresent()).toBe(false);
      });

      it("should display the information row when less then three tokens and desktop", async () => {
        vi.spyOn(isDesktopViewportStore, "subscribe").mockImplementation(
          (fn) => {
            fn(true);
            return () => {};
          }
        );

        const po = renderPage({
          userTokens: [icpToken, token2],
        });
        const tokensCardPo = po.getHeldTokensCardPo();

        const titles = await tokensCardPo.getHeldTokensTitles();
        const usdBalances = await tokensCardPo.getHeldTokensBalanceInUsd();
        const nativeBalances =
          await tokensCardPo.getHeldTokensBalanceInNativeCurrency();

        expect(await po.getNoHeldTokensCard().isPresent()).toBe(false);

        expect(titles.length).toBe(2);
        expect(titles).toEqual(["Internet Computer", "Token2"]);

        expect(usdBalances.length).toBe(2);
        expect(usdBalances).toEqual(["$0.00", "$200.00"]);

        expect(nativeBalances.length).toBe(2);
        expect(nativeBalances).toEqual(["-/- ICP", "21.60 TET"]);

        expect(await tokensCardPo.getInfoRow().isPresent()).toBe(true);
      });
    });

    describe("StakedTokensCard", () => {
      it("should display the top staked tokens by staked balance in Usd with InternetComputer as first", async () => {
        overrideFeatureFlagsStore.setFlag("ENABLE_APY_PORTFOLIO", false);
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
        vi.spyOn(isDesktopViewportStore, "subscribe").mockImplementation(
          (fn) => {
            fn(true);
            return () => {};
          }
        );
        overrideFeatureFlagsStore.setFlag("ENABLE_APY_PORTFOLIO", false);
        const po = renderPage({
          tableProjects: [icpProject, tableProject2],
          userTokens: [icpToken, token2, token3, token4],
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
        expect(titles).toEqual(["Internet Computer", "Project 2"]);

        expect(maturities.length).toBe(2);
        expect(maturities).toEqual(["20.00", "0"]);

        expect(stakesInUsd.length).toBe(2);
        expect(stakesInUsd).toEqual(["$100.00", "$300.00"]);

        expect(stakesInNativeCurrency.length).toBe(2);
        expect(stakesInNativeCurrency).toEqual(["0.01 ICP", "0.01 TET"]);

        expect(await stakedTokensCardPo.getInfoRow().isPresent()).toBe(true);
      });
    });

    describe("NoStakedTokensCard", () => {
      it("should display the card when the total balance is zero", async () => {
        const po = renderPage();

        expect(await po.getNoStakedTokensCarPo().isPresent()).toBe(true);
        expect(await po.getTotalAssetsCardPo().getPrimaryAmount()).toBe(
          "$0.00"
        );
      });

      it("should not display the card when the neurons accounts balance is not zero", async () => {
        const tableProject: TableProject = {
          ...mockTableProject,
          stakeInUsd: 2,
        };
        const po = renderPage({ tableProjects: [tableProject] });

        expect(await po.getNoStakedTokensCarPo().isPresent()).toBe(false);
        expect(await po.getTotalAssetsCardPo().getPrimaryAmount()).toBe(
          "$2.00"
        );
      });

      it("should display a primary action when the neurons accounts balance is zero and the tokens balance is not zero", async () => {
        const token = createUserToken({
          universeId: principal(1),
          balanceInUsd: 2,
        });
        const po = renderPage({ userTokens: [token] });

        expect(await po.getNoStakedTokensCarPo().isPresent()).toBe(true);
        expect(await po.getTotalAssetsCardPo().getPrimaryAmount()).toBe(
          "$2.00"
        );
      });

      it("should not display a primary action when the neurons accounts balance is zero and the tokens balance is also zero", async () => {
        const po = renderPage();

        expect(await po.getNoStakedTokensCarPo().isPresent()).toBe(true);
        expect(await po.getTotalAssetsCardPo().getPrimaryAmount()).toBe(
          "$0.00"
        );
      });

      it("should not display a primary action when the staked tokens card loads before the held tokens card", async () => {
        const loadingToken = createUserTokenLoading({});

        const po = renderPage({
          userTokens: [loadingToken],
          tableProjects: [],
        });

        expect(await po.getNoStakedTokensCarPo().isPresent()).toEqual(true);
      });
    });

    describe("TotalAssetsCard", () => {
      it("should display total assets", async () => {
        const po = renderPage({
          userTokens: [token1, token2],
          tableProjects: [icpProject, tableProject1],
        });

        // There are two tokens with a balance of 100$ and 200$, and two projects with a staked balance of 100$ and 200$ -> 600$
        expect(await po.getTotalAssetsCardPo().getPrimaryAmount()).toBe(
          "$600.00"
        );
        // 1ICP == 10$
        expect(await po.getTotalAssetsCardPo().getSecondaryAmount()).toBe(
          "60.00 ICP"
        );
        expect(
          await po.getTotalAssetsCardPo().getTotalsTooltipIconPo().isPresent()
        ).toBe(false);
      });

      it("should ignore held tokens with unknown balance in USD and display tooltip", async () => {
        const tokenNoBalance = createUserToken({
          balanceInUsd: undefined,
        });
        const po = renderPage({ userTokens: [token1, token2, tokenNoBalance] });

        expect(await po.getTotalAssetsCardPo().getPrimaryAmount()).toBe(
          "$300.00"
        );
        expect(await po.getTotalAssetsCardPo().getSecondaryAmount()).toBe(
          "30.00 ICP"
        );
        expect(
          await po.getTotalAssetsCardPo().getTotalsTooltipIconPo().isPresent()
        ).toBe(true);
      });

      it("should ignore staked tokens with unknown balance in USD and display tooltip", async () => {
        const projectNoBalance: TableProject = {
          ...mockTableProject,
          stakeInUsd: undefined,
        };
        const po = renderPage({
          tableProjects: [tableProject1, tableProject2, projectNoBalance],
        });

        expect(await po.getTotalAssetsCardPo().getPrimaryAmount()).toBe(
          "$500.00"
        );
        expect(await po.getTotalAssetsCardPo().getSecondaryAmount()).toBe(
          "50.00 ICP"
        );
        expect(
          await po.getTotalAssetsCardPo().getTotalsTooltipIconPo().isPresent()
        ).toBe(true);
      });
    });

    describe("ApyCard", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.setFlag("ENABLE_APY_PORTFOLIO", true);
      });

      it("should show fallback Apy card while data loads", async () => {
        const po = renderPage({
          stakingRewardResult: {
            loading: true,
          },
        });

        expect(await po.getApyCardPo().isPresent()).toBe(false);
        expect(await po.getApyFallbackCardPo().isPresent()).toBe(true);
        expect(
          await po.getApyFallbackCardPo().getLoadingContent().isPresent()
        ).toBe(true);
        expect(
          await po.getApyFallbackCardPo().getErrorContent().isPresent()
        ).toBe(false);
      });

      it("should not show ApyCard if FF is off", async () => {
        overrideFeatureFlagsStore.setFlag("ENABLE_APY_PORTFOLIO", false);
        const po = renderPage({
          stakingRewardResult: {
            loading: true,
          },
        });

        expect(await po.getApyCardPo().isPresent()).toBe(false);
        expect(await po.getApyFallbackCardPo().isPresent()).toBe(false);
      });

      it("should show fallback Apy card with an error when calculation fails", async () => {
        const po = renderPage({
          stakingRewardResult: {
            loading: false,
            error: "Failed to load data",
          },
        });

        expect(await po.getApyCardPo().isPresent()).toBe(false);
        expect(await po.getApyFallbackCardPo().isPresent()).toBe(true);
        expect(
          await po.getApyFallbackCardPo().getLoadingContent().isPresent()
        ).toBe(false);
        expect(
          await po.getApyFallbackCardPo().getErrorContent().isPresent()
        ).toBe(true);
      });

      it("should show Apy card with all information", async () => {
        const po = renderPage({
          userTokens: [token1, token2],
          tableProjects: [icpProject, tableProject1],
          stakingRewardResult: {
            loading: false,
            apy: new Map(),
            rewardBalanceUSD: 10,
            rewardEstimateWeekUSD: 1,
            stakingPower: 0.1,
            stakingPowerUSD: 100,
            icpOnly: {
              maturityBalance: 1,
              maturityEstimateWeek: 1,
              stakingPower: 0.1,
            },
          },
        });

        expect(await po.getApyFallbackCardPo().isPresent()).toBe(false);
        expect(await po.getApyCardPo().isPresent()).toBe(true);
        expect(await po.getApyCardPo().getRewardAmount()).toBe("1.00");
        expect(await po.getApyCardPo().getProjectionAmount()).toBe("1.000");
        expect(await po.getApyCardPo().getStakingPowerPercentage()).toBe(
          "10.00%"
        );
      });
    });

    describe("Loading States", () => {
      const loadingToken = createUserTokenLoading({});
      const loadingProject: TableProject = {
        ...mockTableProject,
        isStakeLoading: true,
      };

      const loadedToken = createUserToken({
        balanceInUsd: 100,
        universeId: principal(1),
      });

      const loadedProject: TableProject = {
        ...mockTableProject,
        stakeInUsd: 100,
        isStakeLoading: false,
      };

      it("should show the inital loading state - both tokens and projects loading", async () => {
        const po = renderPage({
          userTokens: [loadingToken],
          tableProjects: [loadingProject],
        });

        expect(await po.getTotalAssetsCardPo().hasSpinner()).toEqual(true);
        expect(await po.getHeldTokensSkeletonCard().isPresent()).toEqual(true);
        expect(await po.getStakedTokensSkeletonCard().isPresent()).toEqual(
          true
        );
        expect(await po.getHeldTokensCardPo().isPresent()).toEqual(false);
        expect(await po.getStakedTokensCardPo().isPresent()).toEqual(false);
      });

      it("should show a partial loading state - tokens loaded, projects still loading", async () => {
        const po = renderPage({
          userTokens: [loadedToken],
          tableProjects: [loadingProject],
        });

        expect(await po.getTotalAssetsCardPo().hasSpinner()).toEqual(true);
        expect(await po.getHeldTokensSkeletonCard().isPresent()).toEqual(false);
        expect(await po.getStakedTokensSkeletonCard().isPresent()).toEqual(
          true
        );
        expect(await po.getHeldTokensCardPo().isPresent()).toEqual(true);
        expect(await po.getStakedTokensCardPo().isPresent()).toEqual(false);
      });

      it("should show a partial loading state - projects loaded, tokens still loading", async () => {
        const po = renderPage({
          userTokens: [loadingToken],
          tableProjects: [loadedProject],
        });

        expect(await po.getTotalAssetsCardPo().hasSpinner()).toEqual(true);
        expect(await po.getHeldTokensSkeletonCard().isPresent()).toEqual(true);
        expect(await po.getStakedTokensSkeletonCard().isPresent()).toEqual(
          false
        );
        expect(await po.getHeldTokensCardPo().isPresent()).toEqual(false);
        expect(await po.getStakedTokensCardPo().isPresent()).toEqual(true);
      });

      it("should show a fully loaded state - both tokens and projects loaded", async () => {
        const po = renderPage({
          userTokens: [loadedToken],
          tableProjects: [loadedProject],
        });

        expect(await po.getTotalAssetsCardPo().hasSpinner()).toEqual(false);
        expect(await po.getHeldTokensSkeletonCard().isPresent()).toEqual(false);
        expect(await po.getStakedTokensSkeletonCard().isPresent()).toEqual(
          false
        );
        expect(await po.getHeldTokensCardPo().isPresent()).toEqual(true);
        expect(await po.getStakedTokensCardPo().isPresent()).toEqual(true);
      });
    });
  });
});
