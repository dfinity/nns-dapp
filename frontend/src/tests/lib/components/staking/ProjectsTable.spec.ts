import ProjectsTable from "$lib/components/staking/ProjectsTable.svelte";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { neuronsStore } from "$lib/stores/neurons.store";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { page } from "$mocks/$app/stores";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { mockSnsToken, principal } from "$tests/mocks/sns-projects.mock";
import { ProjectsTablePo } from "$tests/page-objects/ProjectsTable.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { render } from "$tests/utils/svelte.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";

describe("ProjectsTable", () => {
  const snsTitle = "SNS-1";
  const snsCanisterId = principal(1111);
  const snsTokenSymbol = "TOK";

  const renderComponent = () => {
    const { container } = render(ProjectsTable);
    return ProjectsTablePo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    neuronsStore.reset();
    snsNeuronsStore.reset();
    resetSnsProjects();
    resetIdentity();

    page.mock({
      routeId: AppPath.Staking,
    });
    setSnsProjects([
      {
        projectName: snsTitle,
        rootCanisterId: snsCanisterId,
        tokenMetadata: {
          ...mockSnsToken,
          symbol: snsTokenSymbol,
        },
      },
    ]);
  });

  it("should render desktop headers", async () => {
    const po = renderComponent();
    expect(await po.getDesktopColumnHeaders()).toEqual([
      "Nervous Systems",
      "",
      "Stake",
      "",
      "Neurons",
      "", // No header for actions column.
    ]);
  });

  it("should render mobile headers", async () => {
    const po = renderComponent();
    expect(await po.getMobileColumnHeaders()).toEqual([
      "Nervous Systems",
      "", // No header for actions column.
    ]);
  });

  it("should render cell alignment classes", async () => {
    const po = renderComponent();
    const rows = await po.getRows();
    expect(await rows[0].getCellAlignments()).toEqual([
      "desktop-align-left", // Nervous Systems
      expect.any(String), // gap
      "desktop-align-right", // Stake
      expect.any(String), // gap
      "desktop-align-right", // Neurons
      "desktop-align-right", // Actions
    ]);
  });

  it("should use correct template columns", async () => {
    const po = renderComponent();

    expect(await po.getDesktopGridTemplateColumns()).toBe(
      [
        "minmax(min-content, max-content)", // Nervous Systems
        "1fr", // gap
        "max-content", // Stake
        "1fr", // gap
        "max-content", // Neurons
        "max-content", // Actions
      ].join(" ")
    );
    expect(await po.getMobileGridTemplateAreas()).toBe(
      '"first-cell last-cell" "cell-1 cell-1" "cell-3 cell-3"'
    );
  });

  it("should render project title", async () => {
    const po = renderComponent();
    const rowPos = await po.getProjectsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getProjectTitle()).toBe("Internet Computer");
    expect(await rowPos[1].getProjectTitle()).toBe(snsTitle);
  });

  it("should render stake as -/- when neurons not loaded", async () => {
    const po = renderComponent();
    const rowPos = await po.getProjectsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getStake()).toBe("-/- ICP");
    expect(await rowPos[1].getStake()).toBe("-/- TOK");
  });

  it("should not render stake when user has no neurons", async () => {
    neuronsStore.setNeurons({
      neurons: [],
      certified: true,
    });
    snsNeuronsStore.setNeurons({
      rootCanisterId: snsCanisterId,
      neurons: [],
      certified: true,
    });
    const po = renderComponent();
    const rowPos = await po.getProjectsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getStake()).toBe("");
    expect(await rowPos[1].getStake()).toBe("");
  });

  describe("with neurons", () => {
    const nnsNeuronStake = 100_000_000n;
    const snsNeuronStake = 200_000_000n;

    const nnsNeuronWithStake = {
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        cachedNeuronStake: nnsNeuronStake,
      },
    };

    const nnsNeuronWithoutStake = {
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        cachedNeuronStake: 0n,
        maturityE8sEquivalent: 0n,
      },
    };

    const snsNeuronWithStake = createMockSnsNeuron({
      stake: snsNeuronStake,
      id: [1, 1, 3],
    });

    const snsNeuronWithoutStake = createMockSnsNeuron({
      stake: 0n,
      maturity: 0n,
      id: [7, 7, 9],
    });

    it("should render stake", async () => {
      neuronsStore.setNeurons({
        neurons: [nnsNeuronWithStake],
        certified: true,
      });
      snsNeuronsStore.setNeurons({
        rootCanisterId: snsCanisterId,
        neurons: [snsNeuronWithStake],
        certified: true,
      });
      const po = renderComponent();
      const rowPos = await po.getProjectsTableRowPos();
      expect(rowPos).toHaveLength(2);
      expect(await rowPos[0].getStake()).toBe("1.00 ICP");
      expect(await rowPos[1].getStake()).toBe("2.00 TOK");
    });

    it("should render NNS neurons count", async () => {
      neuronsStore.setNeurons({
        neurons: [nnsNeuronWithStake, nnsNeuronWithStake],
        certified: true,
      });
      const po = renderComponent();
      const rowPos = await po.getProjectsTableRowPos();
      expect(rowPos).toHaveLength(2);
      expect(await rowPos[0].getNeuronCount()).toBe("2");
      expect(await rowPos[0].getHref()).toBe(
        `/neurons/?u=${OWN_CANISTER_ID_TEXT}`
      );
      expect(await rowPos[0].hasGoToNeuronsTableAction()).toBe(true);
    });

    it("should render SNS neurons count", async () => {
      snsNeuronsStore.setNeurons({
        rootCanisterId: snsCanisterId,
        neurons: [snsNeuronWithStake, snsNeuronWithStake, snsNeuronWithStake],
        certified: true,
      });
      const po = renderComponent();
      const rowPos = await po.getProjectsTableRowPos();
      expect(rowPos).toHaveLength(2);
      expect(await rowPos[1].getNeuronCount()).toBe("3");
      expect(await rowPos[1].getHref()).toBe(`/neurons/?u=${snsCanisterId}`);
      expect(await rowPos[1].hasGoToNeuronsTableAction()).toBe(true);
    });

    it("should filter NNS neurons without stake", async () => {
      neuronsStore.setNeurons({
        neurons: [nnsNeuronWithStake, nnsNeuronWithoutStake],
        certified: true,
      });
      const po = renderComponent();
      const rowPos = await po.getProjectsTableRowPos();
      expect(rowPos).toHaveLength(2);
      expect(await rowPos[0].getNeuronCount()).toBe("1");
    });

    it("should filter SNS neurons without stake", async () => {
      snsNeuronsStore.setNeurons({
        rootCanisterId: snsCanisterId,
        neurons: [
          snsNeuronWithStake,
          snsNeuronWithoutStake,
          snsNeuronWithStake,
        ],
        certified: true,
      });
      const po = renderComponent();
      const rowPos = await po.getProjectsTableRowPos();
      expect(rowPos).toHaveLength(2);
      expect(await rowPos[1].getNeuronCount()).toBe("2");
    });

    it("should not render neurons count when not signed in", async () => {
      setNoIdentity();
      snsNeuronsStore.setNeurons({
        rootCanisterId: snsCanisterId,
        neurons: [],
        certified: true,
      });
      const po = renderComponent();
      const rowPos = await po.getProjectsTableRowPos();
      expect(rowPos).toHaveLength(2);
      expect(await rowPos[0].getNeuronCount()).toBe("-/-");
      expect(await rowPos[0].getHref()).toBe(
        `/neurons/?u=${OWN_CANISTER_ID_TEXT}`
      );
      expect(await rowPos[0].hasGoToNeuronsTableAction()).toBe(true);
      expect(await rowPos[1].getNeuronCount()).toBe("-/-");
      expect(await rowPos[1].getHref()).toBe(`/neurons/?u=${snsCanisterId}`);
      expect(await rowPos[1].hasGoToNeuronsTableAction()).toBe(true);
    });

    it("should not render SNS neurons count when not loaded", async () => {
      const po = renderComponent();
      const rowPos = await po.getProjectsTableRowPos();
      expect(rowPos).toHaveLength(2);
      expect(await rowPos[0].getNeuronCount()).toBe("-/-");
      expect(await rowPos[0].getHref()).toBe(
        `/neurons/?u=${OWN_CANISTER_ID_TEXT}`
      );
      expect(await rowPos[0].hasGoToNeuronsTableAction()).toBe(true);
      expect(await rowPos[1].getNeuronCount()).toBe("-/-");
      expect(await rowPos[1].getHref()).toBe(`/neurons/?u=${snsCanisterId}`);
      expect(await rowPos[1].hasGoToNeuronsTableAction()).toBe(true);
    });

    it("should not render clickable row with zero neurons", async () => {
      neuronsStore.setNeurons({
        neurons: [],
        certified: true,
      });
      snsNeuronsStore.setNeurons({
        rootCanisterId: snsCanisterId,
        neurons: [],
        certified: true,
      });
      const po = renderComponent();
      const rowPos = await po.getProjectsTableRowPos();
      expect(rowPos).toHaveLength(2);
      expect(await rowPos[0].getNeuronCount()).toBe("0");
      expect(await rowPos[0].getHref()).toBe(
        `/neurons/?u=${OWN_CANISTER_ID_TEXT}`
      );
      expect(await rowPos[0].hasGoToNeuronsTableAction()).toBe(true);
      expect(await rowPos[1].getNeuronCount()).toBe("0");
      expect(await rowPos[1].getHref()).toBe(`/neurons/?u=${snsCanisterId}`);
      expect(await rowPos[1].hasGoToNeuronsTableAction()).toBe(true);
    });
  });

  it("should update table when universes store changes", async () => {
    const po = renderComponent();

    await runResolvedPromises();
    expect(await po.getProjectsTableRowPos()).toHaveLength(2);

    setSnsProjects([
      {
        projectName: snsTitle,
        rootCanisterId: snsCanisterId,
      },
      {
        projectName: "Another SNS",
        rootCanisterId: principal(2222),
      },
    ]);

    await runResolvedPromises();
    expect(await po.getProjectsTableRowPos()).toHaveLength(3);
  });

  it("should sort projects", async () => {
    const snsNeuronWithStake = createMockSnsNeuron({
      stake: 100_000_000n,
      id: [1, 1, 3],
    });
    const rootCanisterId1 = principal(101);
    const rootCanisterId2 = principal(102);
    const rootCanisterId3 = principal(103);
    const rootCanisterId4 = principal(104);
    setSnsProjects([
      {
        projectName: "A without neurons",
        rootCanisterId: rootCanisterId1,
      },
      {
        projectName: "B with neurons",
        rootCanisterId: rootCanisterId2,
      },
      {
        projectName: "X without neurons",
        rootCanisterId: rootCanisterId3,
      },
      {
        projectName: "Z with neurons",
        rootCanisterId: rootCanisterId4,
      },
    ]);
    snsNeuronsStore.setNeurons({
      rootCanisterId: rootCanisterId1,
      neurons: [],
      certified: true,
    });
    snsNeuronsStore.setNeurons({
      rootCanisterId: rootCanisterId2,
      neurons: [snsNeuronWithStake],
      certified: true,
    });
    snsNeuronsStore.setNeurons({
      rootCanisterId: rootCanisterId3,
      neurons: [],
      certified: true,
    });
    snsNeuronsStore.setNeurons({
      rootCanisterId: rootCanisterId4,
      neurons: [snsNeuronWithStake],
      certified: true,
    });
    const po = renderComponent();
    const rowPos = await po.getProjectsTableRowPos();
    expect(rowPos).toHaveLength(5);
    expect(
      await Promise.all(rowPos.map((project) => project.getProjectTitle()))
    ).toEqual([
      "Internet Computer",
      "B with neurons",
      "Z with neurons",
      "A without neurons",
      "X without neurons",
    ]);
  });
});
