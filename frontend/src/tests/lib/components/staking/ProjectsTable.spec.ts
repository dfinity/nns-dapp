import ProjectsTable from "$lib/components/staking/ProjectsTable.svelte";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { neuronsStore } from "$lib/stores/neurons.store";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { page } from "$mocks/$app/stores";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { ProjectsTablePo } from "$tests/page-objects/ProjectsTable.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { render } from "$tests/utils/svelte.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";

describe("ProjectsTable", () => {
  const snsTitle = "SNS-1";
  const snsCanisterId = principal(1111);

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
      },
    ]);
  });

  it("should render desktop headers", async () => {
    const po = renderComponent();
    expect(await po.getDesktopColumnHeaders()).toEqual([
      "Nervous Systems",
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
      "desktop-align-right", // Neurons
      "desktop-align-right", // Actions
    ]);
  });

  it("should use correct template columns", async () => {
    const po = renderComponent();

    expect(await po.getDesktopGridTemplateColumns()).toBe(
      [
        "1fr", // Nerous Systems
        "1fr", // Neurons
        "max-content", // Actions
      ].join(" ")
    );
    expect(await po.getMobileGridTemplateAreas()).toBe(
      '"first-cell last-cell" "cell-0 cell-0"'
    );
  });

  it("should render project title", async () => {
    const po = renderComponent();
    const rowPos = await po.getProjectsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getProjectTitle()).toBe("Internet Computer");
    expect(await rowPos[1].getProjectTitle()).toBe(snsTitle);
  });

  describe("neuron counts", () => {
    const nnsNeuronWithStake = {
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        cachedNeuronStake: 100_000_000n,
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
      stake: 100_000_000n,
      id: [1, 1, 3],
    });

    const snsNeuronWithoutStake = createMockSnsNeuron({
      stake: 0n,
      maturity: 0n,
      id: [7, 7, 9],
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
});
