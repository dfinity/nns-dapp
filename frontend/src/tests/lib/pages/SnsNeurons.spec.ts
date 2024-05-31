import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import * as snsGovernanceApi from "$lib/api/sns-governance.api";
import SnsNeurons from "$lib/pages/SnsNeurons.svelte";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { snsParametersStore } from "$lib/stores/sns-parameters.store";
import { page } from "$mocks/$app/stores";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import {
  createMockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { SnsNeuronsPo } from "$tests/page-objects/SnsNeurons.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { SnsNeuron } from "@dfinity/sns";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

vi.mock("$lib/api/sns-governance.api");
vi.mock("$lib/api/sns-ledger.api");

describe("SnsNeurons", () => {
  const rootCanisterId = rootCanisterIdMock;
  const neuron1Stake = 200_000_000n;
  const neuron1 = createMockSnsNeuron({
    id: [1, 2, 3],
    stake: neuron1Stake,
  });
  const neuron2Stake = 100_000_000n;
  const neuron2 = createMockSnsNeuron({
    id: [1, 2, 4],
    stake: neuron2Stake,
  });
  const neuronNFStake = 400_000_000n;
  const neuronNF: SnsNeuron = {
    ...createMockSnsNeuron({
      id: [1, 2, 6],
      stake: neuronNFStake,
    }),
    source_nns_neuron_id: [123n],
  };
  const projectName = "Tetris";
  const getNeuronBalanceMock = async ({ neuronId }) => {
    if (neuronId === neuron1.id[0]) {
      return neuron1Stake;
    }
    if (neuronId === neuron2.id[0]) {
      return neuron2Stake;
    }
    if (neuronId === neuronNF.id[0]) {
      return neuronNFStake;
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    overrideFeatureFlagsStore.reset();
    page.mock({ data: { universe: rootCanisterId.toText() } });
    resetIdentity();
    vi.spyOn(icrcLedgerApi, "queryIcrcBalance").mockResolvedValue(
      mockSnsMainAccount.balanceUlps
    );
    snsParametersStore.setParameters({
      rootCanisterId,
      certified: true,
      parameters: snsNervousSystemParametersMock,
    });

    setSnsProjects([
      {
        rootCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
        projectName,
      },
    ]);
  });

  const renderComponent = async () => {
    const { container } = render(SnsNeurons);
    await runResolvedPromises();
    return SnsNeuronsPo.under(new JestPageObjectElement(container));
  };

  describe("while loading", () => {
    beforeEach(() => {
      vi.spyOn(snsGovernanceApi, "querySnsNeurons").mockReturnValue(
        new Promise(() => {
          // Don't resolve the promise to keep the component in loading state.
        })
      );
    });

    describe("with ENABLE_NEURONS_TABLE disabled", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.setFlag("ENABLE_NEURONS_TABLE", false);
      });

      it("should render skeleton cards", async () => {
        const po = await renderComponent();

        expect(await po.getSkeletonCardPo().isPresent()).toBe(true);
        expect(await po.hasSpinner()).toBe(false);
      });

      it("should not render empty text", async () => {
        const po = await renderComponent();

        expect(await po.hasEmptyMessage()).toBe(false);
      });
    });

    describe("with ENABLE_NEURONS_TABLE enabled", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.setFlag("ENABLE_NEURONS_TABLE", true);
      });

      it("should render a spinner", async () => {
        const po = await renderComponent();

        expect(await po.hasSpinner()).toBe(true);
        expect(await po.getSkeletonCardPo().isPresent()).toBe(false);
      });

      it("should not render empty text", async () => {
        const po = await renderComponent();

        expect(await po.hasEmptyMessage()).toBe(false);
      });
    });
  });

  describe("with normal neurons without neurons from CF", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_NEURONS_TABLE", false);
      vi.spyOn(snsGovernanceApi, "querySnsNeurons").mockResolvedValue([
        neuron1,
        neuron2,
      ]);
      vi.spyOn(snsGovernanceApi, "getNeuronBalance").mockImplementation(
        getNeuronBalanceMock
      );
    });

    it("should render SnsNeuronCards for each neuron", async () => {
      const po = await renderComponent();

      expect(await po.getNeuronCardPos()).toHaveLength(2);
    });

    it("should not render NF neurons grids", async () => {
      const po = await renderComponent();

      expect(await po.hasNonNeuronFundNeuronsGrid()).toBe(true);
      expect(await po.hasNeuronFundNeuronsGrid()).toBe(false);
    });

    it("should not render empty text", async () => {
      const po = await renderComponent();

      expect(await po.hasEmptyMessage()).toBe(false);
    });
  });

  describe("with normal neurons and neurons from CF", () => {
    beforeEach(() => {
      vi.spyOn(snsGovernanceApi, "querySnsNeurons").mockResolvedValue([
        neuron1,
        neuronNF,
      ]);
    });

    describe("with ENABLE_NEURONS_TABLE disabled", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.setFlag("ENABLE_NEURONS_TABLE", false);
      });

      it("should render SnsNeuronCards for each neuron", async () => {
        const po = await renderComponent();

        expect(await po.getNeuronCardPos()).toHaveLength(2);
      });

      it("should render NF neurons grids", async () => {
        const po = await renderComponent();

        expect(await po.hasNonNeuronFundNeuronsGrid()).toBe(true);
        expect(await po.hasNeuronFundNeuronsGrid()).toBe(true);
      });

      it("should not render empty text", async () => {
        const po = await renderComponent();

        expect(await po.hasEmptyMessage()).toBe(false);
      });

      it("should not render the neurons table", async () => {
        const po = await renderComponent();

        expect(await po.getNeuronsTablePo().isPresent()).toBe(false);
      });
    });

    describe("with ENABLE_NEURONS_TABLE enabled", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.setFlag("ENABLE_NEURONS_TABLE", true);
      });

      it("should render the neurons table", async () => {
        const po = await renderComponent();

        expect(await po.getNeuronsTablePo().isPresent()).toBe(true);
      });

      it("should render neurons table rows", async () => {
        const po = await renderComponent();

        const rows = await po.getNeuronsTablePo().getNeuronsTableRowPos();
        expect(rows).toHaveLength(2);
      });

      it("should not render the NeuronCards", async () => {
        const po = await renderComponent();

        const neuronCards = await po.getNeuronCardPos();
        expect(neuronCards.length).toBe(0);
      });

      it("should not render neurons grids", async () => {
        const po = await renderComponent();

        expect(await po.hasNonNeuronFundNeuronsGrid()).toBe(false);
        expect(await po.hasNeuronFundNeuronsGrid()).toBe(false);
      });

      it("should not render empty text", async () => {
        const po = await renderComponent();

        expect(await po.hasEmptyMessage()).toBe(false);
      });
    });
  });

  describe("with only neurons from CF", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_NEURONS_TABLE", false);
      vi.spyOn(snsGovernanceApi, "querySnsNeurons").mockResolvedValue([
        neuronNF,
      ]);
    });

    it("should render one grid", async () => {
      const po = await renderComponent();

      expect(await po.hasNonNeuronFundNeuronsGrid()).toBe(false);
      expect(await po.hasNeuronFundNeuronsGrid()).toBe(true);
      expect(await po.hasEmptyMessage()).toBe(false);
    });

    it("should not render empty text", async () => {
      const po = await renderComponent();

      expect(await po.hasEmptyMessage()).toBe(false);
    });
  });

  describe("no neurons", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_NEURONS_TABLE", false);
      vi.spyOn(snsGovernanceApi, "querySnsNeurons").mockResolvedValue([]);
    });

    it("should not render either grid", async () => {
      const po = await renderComponent();

      expect(await po.hasNonNeuronFundNeuronsGrid()).toBe(false);
      expect(await po.hasNeuronFundNeuronsGrid()).toBe(false);
    });

    it("should render empty text if no neurons", async () => {
      const po = await renderComponent();

      expect(await po.hasEmptyMessage()).toBe(true);
    });
  });
});
