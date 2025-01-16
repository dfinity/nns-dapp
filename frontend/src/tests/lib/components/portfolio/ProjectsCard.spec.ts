import ProjectsCard from "$lib/components/portfolio/ProjectsCard.svelte";
import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
import type { TableProject } from "$lib/types/staking";
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockToken } from "$tests/mocks/sns-projects.mock";
import { mockTableProject } from "$tests/mocks/staking.mock";
import { ProjectsCardPo } from "$tests/page-objects/ProjectsCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { ICPToken, TokenAmountV2 } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("ProjectsCard", () => {
  const renderComponent = ({
    topStakedTokens = [],
    usdAmount = 0,
    numberOfTopHeldTokens = 0,
  }: {
    topStakedTokens?: TableProject[];
    usdAmount?: number;
    numberOfTopHeldTokens?: number;
  } = {}) => {
    const { container } = render(ProjectsCard, {
      props: {
        topStakedTokens,
        usdAmount,
        numberOfTopHeldTokens,
      },
    });

    return ProjectsCardPo.under(new JestPageObjectElement(container));
  };

  describe("when not signed in", () => {
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

    const mockProjects: TableProject[] = [
      icpProject,
      tableProject1,
      tableProject2,
      tableProject3,
    ];

    beforeEach(() => {
      setNoIdentity();
    });

    it("should show placeholder balance", async () => {
      const po = renderComponent();

      expect(await po.getAmount()).toBe("$-/-");
    });

    it("should list of tokens with placeholders", async () => {
      const po = renderComponent({
        topStakedTokens: mockProjects,
      });
      const titles = await po.getProjectsTitle();
      const maturities = await po.getProjectsMaturity();
      const stakesInUsd = await po.getProjectsStakeInUsd();
      const stakesInNativeCurrency =
        await po.getProjectsStakeInNativeCurrency();

      expect(titles.length).toBe(4);
      expect(titles).toEqual([
        "Internet Computer",
        "Project 1",
        "Project 2",
        "Project 3",
      ]);

      expect(maturities.length).toBe(4);
      expect(maturities).toEqual(["-/-", "-/-", "-/-", "-/-"]);

      expect(stakesInUsd.length).toBe(4);
      expect(stakesInUsd).toEqual(["$0.00", "$0.00", "$0.00", "$0.00"]);

      expect(stakesInNativeCurrency.length).toBe(4);
      expect(stakesInNativeCurrency).toEqual([
        "-/- ICP",
        "-/- TET",
        "-/- TET",
        "-/- TET",
      ]);

      expect(await po.getInfoRow().isPresent()).toBe(false);
    });
  });

  describe("when signed in", () => {
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
        amount: 1000_000n,
        token: mockToken,
      }),
    };

    const mockProjects: TableProject[] = [
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

      expect(await po.getAmount()).toBe("$5’000.00");
    });

    it("should show all the projects with their maturity, staked in usd and staked in native currency", async () => {
      const po = renderComponent({
        topStakedTokens: mockProjects,
      });

      const titles = await po.getProjectsTitle();
      const maturities = await po.getProjectsMaturity();
      const stakesInUsd = await po.getProjectsStakeInUsd();
      const stakesInNativeCurrency =
        await po.getProjectsStakeInNativeCurrency();

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

    it("should not show info row when numberOfTopHeldTokens is the same as the number of topStakedTokens", async () => {
      const po = renderComponent({
        topStakedTokens: mockProjects.slice(0, 3),
        numberOfTopHeldTokens: 3,
      });

      const titles = await po.getProjectsTitle();
      const maturities = await po.getProjectsMaturity();
      const stakesInUsd = await po.getProjectsStakeInUsd();
      const stakesInNativeCurrency =
        await po.getProjectsStakeInNativeCurrency();

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

    it("should not show info row when the number of topStakedTokens is less than numberOfTopHeldTokens like 1", async () => {
      const po = renderComponent({
        topStakedTokens: mockProjects.slice(0, 2),
        numberOfTopHeldTokens: 4,
      });

      const titles = await po.getProjectsTitle();
      const maturities = await po.getProjectsMaturity();
      const stakesInUsd = await po.getProjectsStakeInUsd();
      const stakesInNativeCurrency =
        await po.getProjectsStakeInNativeCurrency();

      expect(titles.length).toBe(2);
      expect(titles).toEqual(["Internet Computer", "Project 1"]);

      expect(maturities.length).toBe(2);
      expect(maturities).toEqual(["20.00", "0"]);

      expect(stakesInUsd.length).toBe(2);
      expect(stakesInUsd).toEqual(["$100.00", "$200.00"]);

      expect(stakesInNativeCurrency.length).toBe(2);
      expect(stakesInNativeCurrency).toEqual(["0.01 ICP", "0.01 TET"]);

      expect(await po.getInfoRow().isPresent()).toBe(true);
    });

    it("should not show info row when the number of topStakedTokens is less than numberOfTopHeldTokens like 2", async () => {
      const po = renderComponent({
        topStakedTokens: mockProjects.slice(0, 1),
        numberOfTopHeldTokens: 3,
      });

      const titles = await po.getProjectsTitle();
      const maturities = await po.getProjectsMaturity();
      const stakesInUsd = await po.getProjectsStakeInUsd();
      const stakesInNativeCurrency =
        await po.getProjectsStakeInNativeCurrency();

      expect(titles.length).toBe(1);
      expect(titles).toEqual(["Internet Computer"]);

      expect(maturities.length).toBe(1);
      expect(maturities).toEqual(["20.00"]);

      expect(stakesInUsd.length).toBe(1);
      expect(stakesInUsd).toEqual(["$100.00"]);

      expect(stakesInNativeCurrency.length).toBe(1);
      expect(stakesInNativeCurrency).toEqual(["0.01 ICP"]);

      expect(await po.getInfoRow().isPresent()).toBe(true);
    });
  });
});
