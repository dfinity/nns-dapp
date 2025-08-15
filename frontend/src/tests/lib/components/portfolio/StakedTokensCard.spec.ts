import StakedTokensCard from "$lib/components/portfolio/StakedTokensCard.svelte";
import { isDesktopViewportStore } from "$lib/derived/viewport.derived";
import { balancePrivacyOptionStore } from "$lib/stores/balance-privacy-option.store";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import type { TableProject } from "$lib/types/staking";
import { APY_CALC_ERROR } from "$lib/utils/staking-rewards.utils";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockToken } from "$tests/mocks/sns-projects.mock";
import { mockTableProject } from "$tests/mocks/staking.mock";
import { StakedTokensCardPo } from "$tests/page-objects/StakedTokensCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { ICPToken, TokenAmountV2 } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("StakedTokensCard", () => {
  const renderComponent = ({
    topStakedTokens = [],
    usdAmount = 0,
    numberOfTopHeldTokens = 0,
    hasApyCalculationErrored = false,
  }: {
    topStakedTokens?: TableProject[];
    usdAmount?: number;
    numberOfTopHeldTokens?: number;
    hasApyCalculationErrored?: boolean;
  } = {}) => {
    const { container } = render(StakedTokensCard, {
      props: {
        topStakedTokens,
        usdAmount,
        numberOfTopHeldTokens,
        hasApyCalculationErrored,
      },
    });

    return StakedTokensCardPo.under({
      element: new JestPageObjectElement(container),
    });
  };

  beforeEach(() => {
    overrideFeatureFlagsStore.setFlag("ENABLE_APY_PORTFOLIO", false);
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
    stake: TokenAmountV2.fromUlps({
      amount: 1100_000n,
      token: mockToken,
    }),
  };

  const mockStakedTokens: TableProject[] = [
    icpProject,
    tableProject1,
    tableProject2,
    tableProject3,
  ];

  beforeEach(() => {
    resetIdentity();
  });

  it("should show the usd amount", async () => {
    const po = renderComponent({
      usdAmount: 5000,
    });

    expect(await po.getAmount()).toBe("$5’000");
  });

  it("should hide the usd amount", async () => {
    balancePrivacyOptionStore.set("hide");

    const po = renderComponent({
      usdAmount: 5000,
    });

    expect(await po.getAmount()).toBe("$•••");
  });

  it("should show all the projects with their maturity, staked in usd and staked in native currency", async () => {
    const po = renderComponent({
      topStakedTokens: mockStakedTokens,
    });

    const titles = await po.getStakedTokensTitle();
    const maturities = await po.getStakedTokensMaturity();
    const stakesInUsd = await po.getStakedTokensStakeInUsd();
    const stakesInNativeCurrency =
      await po.getStakedTokensStakeInNativeCurrency();

    expect(titles.length).toBe(4);
    expect(titles).toEqual([
      "Internet Computer",
      "Project 1",
      "Project 2",
      "Project 3",
    ]);

    expect(maturities.length).toBe(4);
    expect(maturities).toEqual(["20.00", "0", "0", "0"]);

    expect(stakesInUsd.length).toBe(4);
    expect(stakesInUsd).toEqual(["$100.00", "$200.00", "$300.00", "$400.00"]);

    expect(stakesInNativeCurrency.length).toBe(4);
    expect(stakesInNativeCurrency).toEqual([
      "0.01 ICP",
      "0.01 TET",
      "0.01 TET",
      "0.01 TET",
    ]);
  });

  it("should hide the balance for all the projects", async () => {
    balancePrivacyOptionStore.set("hide");

    const po = renderComponent({
      topStakedTokens: mockStakedTokens,
    });

    const titles = await po.getStakedTokensTitle();
    const stakesInUsd = await po.getStakedTokensStakeInUsd();
    const stakesInNativeCurrency =
      await po.getStakedTokensStakeInNativeCurrency();

    expect(titles).toEqual([
      "Internet Computer",
      "Project 1",
      "Project 2",
      "Project 3",
    ]);

    expect(stakesInUsd).toEqual(["$•••", "$•••", "$•••", "$•••"]);

    expect(stakesInNativeCurrency).toEqual([
      "••• ICP",
      "••• TET",
      "••• TET",
      "••• TET",
    ]);
  });

  it("should not show info row when numberOfTopHeldTokens is the same as the number of topStakedTokens", async () => {
    const po = renderComponent({
      topStakedTokens: mockStakedTokens.slice(0, 3),
      numberOfTopHeldTokens: 3,
    });

    const titles = await po.getStakedTokensTitle();
    const maturities = await po.getStakedTokensMaturity();
    const stakesInUsd = await po.getStakedTokensStakeInUsd();
    const stakesInNativeCurrency =
      await po.getStakedTokensStakeInNativeCurrency();

    expect(titles.length).toBe(3);
    expect(titles).toEqual(["Internet Computer", "Project 1", "Project 2"]);

    expect(maturities.length).toBe(3);
    expect(maturities).toEqual(["20.00", "0", "0"]);

    expect(stakesInUsd.length).toBe(3);
    expect(stakesInUsd).toEqual(["$100.00", "$200.00", "$300.00"]);

    expect(stakesInNativeCurrency.length).toBe(3);
    expect(stakesInNativeCurrency).toEqual([
      "0.01 ICP",
      "0.01 TET",
      "0.01 TET",
    ]);

    expect(await po.getInfoRow().isPresent()).toBe(false);
  });

  it("should render rows as links", async () => {
    const po = renderComponent({
      topStakedTokens: mockStakedTokens,
    });

    const allTags = await po.getRowsTags();
    const allHrefs = await po.getRowsHref();

    expect(allTags.every((tag) => tag === "A")).toBe(true);
    expect(allHrefs).toEqual([
      mockStakedTokens[0].rowHref,
      mockStakedTokens[1].rowHref,
      mockStakedTokens[2].rowHref,
      mockStakedTokens[3].rowHref,
    ]);
  });

  describe("APY feature flag", () => {
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
      apy: {
        cur: 0.05,
        max: 0.1,
      },
    };
    const tableProject1: TableProject = {
      ...mockTableProject,
      title: "Project 1",
      stakeInUsd: 200,
      domKey: "/staking/1",
      stake: TokenAmountV2.fromUlps({
        amount: 1000_000n,
        token: mockToken,
      }),
      apy: {
        cur: 0.05,
        max: 0.12,
      },
    };
    const tableProject2: TableProject = {
      ...mockTableProject,
      title: "Project 2",
      stakeInUsd: 300,
      domKey: "/staking/2",
      stake: TokenAmountV2.fromUlps({
        amount: 1000_000n,
        token: mockToken,
      }),
      apy: {
        cur: 0,
        max: 0,
        error: APY_CALC_ERROR.UNEXPECTED,
      },
    };

    const tableProject3: TableProject = {
      ...mockTableProject,
      title: "Project 3",
      stakeInUsd: 400,
      domKey: "/staking/3",
      stake: TokenAmountV2.fromUlps({
        amount: 1100_000n,
        token: mockToken,
      }),
      apy: {
        cur: 0.0,
        max: 0.0,
      },
    };

    const mockStakedTokens: TableProject[] = [
      icpProject,
      tableProject1,
      tableProject2,
      tableProject3,
    ];

    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_APY_PORTFOLIO", true);
    });

    it("should show all the projects with their Apys, staked in usd and staked in native currency", async () => {
      const po = renderComponent({
        topStakedTokens: mockStakedTokens,
      });

      const titles = await po.getStakedTokensTitle();
      const apys = await po.getStakedTokensApy();
      const maturities = await po.getStakedTokensMaturity();
      const stakesInUsd = await po.getStakedTokensStakeInUsd();
      const stakesInNativeCurrency =
        await po.getStakedTokensStakeInNativeCurrency();

      expect(titles.length).toBe(4);
      expect(titles).toEqual([
        "Internet Computer",
        "Project 1",
        "Project 2",
        "Project 3",
      ]);

      expect(maturities.length).toBe(0);

      expect(apys.length).toBe(4);
      expect(apys).toEqual([
        "5.00% (10.00%)",
        "5.00% (12.00%)",
        "-/-",
        "0.00% (0.00%)",
      ]);
      expect(stakesInUsd.length).toBe(4);
      expect(stakesInUsd).toEqual(["$100.00", "$200.00", "$300.00", "$400.00"]);

      expect(stakesInNativeCurrency.length).toBe(4);
      expect(stakesInNativeCurrency).toEqual([
        "0.01 ICP",
        "0.01 TET",
        "0.01 TET",
        "0.01 TET",
      ]);
    });

    it("should show maturity if the APY calculation restulted in an error", async () => {
      const po = renderComponent({
        topStakedTokens: mockStakedTokens,
        hasApyCalculationErrored: true,
      });

      const apys = await po.getStakedTokensApy();
      const maturities = await po.getStakedTokensMaturity();

      expect(apys.length).toBe(0);
      expect(maturities.length).toBe(4);
      expect(maturities).toEqual(["20.00", "0", "0", "0"]);
    });
  });

  describe("desktop viewport", () => {
    beforeEach(() => {
      // TODO: Move this to a helper or similar
      vi.spyOn(isDesktopViewportStore, "subscribe").mockImplementation((fn) => {
        fn(true);
        return () => {};
      });
    });

    it("should show info row when the number of topStakedTokens is different than numberOfTopHeldTokens ", async () => {
      const po = renderComponent({
        topStakedTokens: mockStakedTokens.slice(0, 2),
        numberOfTopHeldTokens: 3,
      });

      expect(await po.getInfoRow().isPresent()).toBe(true);
      expect(await po.getLinkRow().isPresent()).toBe(false);
    });

    it("should not show info row but show link row when tokens length is 3 or more", async () => {
      const po = renderComponent({
        topStakedTokens: [...mockStakedTokens],
        numberOfTopHeldTokens: 3,
      });

      expect(await po.getInfoRow().isPresent()).toBe(false);
      expect(await po.getLinkRow().isPresent()).toBe(true);
    });
  });
});
