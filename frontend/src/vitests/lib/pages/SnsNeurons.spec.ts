import * as snsGovernanceApi from "$lib/api/sns-governance.api";
import * as ledgerApi from "$lib/api/sns-ledger.api";
import SnsNeurons from "$lib/pages/SnsNeurons.svelte";
import { snsParametersStore } from "$lib/stores/sns-parameters.store";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { page } from "$mocks/$app/stores";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import {
  createMockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import type { SnsNeuron } from "@dfinity/sns";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render, waitFor } from "@testing-library/svelte";

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
    source_nns_neuron_id: [BigInt(123)],
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
    vi.spyOn(ledgerApi, "getSnsAccounts").mockResolvedValue([
      mockSnsMainAccount,
    ]);
    vi.spyOn(ledgerApi, "getSnsToken").mockResolvedValue(mockSnsToken);
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
      const { queryAllByTestId } = render(SnsNeurons);

      await waitFor(() =>
        expect(queryAllByTestId("sns-neuron-card-title").length).toBe(2)
      );
    });

    it("should render one grids", async () => {
      const { container } = render(SnsNeurons);

      await waitFor(() =>
        expect(container.querySelectorAll(".card-grid").length).toBe(1)
      );
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
      const { queryAllByTestId } = render(SnsNeurons);

      await waitFor(() =>
        expect(queryAllByTestId("sns-neuron-card-title").length).toBe(2)
      );
    });

    it("should render Community Fund title", async () => {
      const { queryByTestId } = render(SnsNeurons);

      await waitFor(() =>
        expect(queryByTestId("community-fund-title")).toBeInTheDocument()
      );
    });

    it("should render Community Fund neurons text", async () => {
      const { queryByTestId } = render(SnsNeurons);

      const div = document.createElement("div");
      div.innerHTML = en.sns_neuron_detail.community_fund_section_description;

      await waitFor(() =>
        expect(
          queryByTestId("community-fund-description").textContent.trim()
        ).toBe(div.textContent.trim())
      );
    });

    it("should render two grids", async () => {
      const { container } = render(SnsNeurons);

      await waitFor(() =>
        expect(container.querySelectorAll(".card-grid").length).toBe(2)
      );
    });
  });

  describe("with only neurons from CF", () => {
    beforeEach(() => {
      vi.spyOn(snsGovernanceApi, "querySnsNeurons").mockResolvedValue([
        neuronNF,
      ]);
    });

    it("should render Community Fund title", async () => {
      const { queryByTestId } = render(SnsNeurons);

      await waitFor(() =>
        expect(queryByTestId("community-fund-title")).toBeInTheDocument()
      );
    });

    it("should render one grid", async () => {
      const { container } = render(SnsNeurons);

      await waitFor(() =>
        expect(container.querySelectorAll(".card-grid").length).toBe(1)
      );
    });
  });

  describe("no neurons", () => {
    beforeEach(() => {
      vi.spyOn(snsGovernanceApi, "querySnsNeurons").mockResolvedValue([]);
    });

    it("should render empty text if no neurons", async () => {
      const { getByText } = render(SnsNeurons);

      const expectedText = replacePlaceholders(en.sns_neurons.text, {
        $project: projectName,
      });

      await waitFor(() => expect(getByText(expectedText)).toBeInTheDocument());
    });
  });
});
