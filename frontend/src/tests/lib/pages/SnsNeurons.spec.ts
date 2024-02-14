import * as snsGovernanceApi from "$lib/api/sns-governance.api";
import * as ledgerApi from "$lib/api/sns-ledger.api";
import SnsNeurons from "$lib/pages/SnsNeurons.svelte";
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
    page.mock({ data: { universe: rootCanisterId.toText() } });
    resetIdentity();
    vi.spyOn(ledgerApi, "querySnsBalance").mockResolvedValue(
      mockSnsMainAccount.balanceUlps
    );
    vi.spyOn(ledgerApi, "transactionFee").mockResolvedValue(10_000n);
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

  describe("without neurons from CF", () => {
    beforeEach(() => {
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

  describe("with neurons from CF", () => {
    beforeEach(() => {
      vi.spyOn(snsGovernanceApi, "querySnsNeurons").mockResolvedValue([
        neuron1,
        neuronNF,
      ]);
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
  });

  describe("with only neurons from CF", () => {
    beforeEach(() => {
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
