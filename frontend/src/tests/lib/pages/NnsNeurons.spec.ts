import { resetNeuronsApiService } from "$lib/api-services/governance.api-service";
import * as api from "$lib/api/governance.api";
import NnsNeurons from "$lib/pages/NnsNeurons.svelte";
import * as authServices from "$lib/services/auth.services";
import { neuronsStore } from "$lib/stores/neurons.store";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronsPo } from "$tests/page-objects/NnsNeurons.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { NeuronState } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";

vi.mock("$lib/api/governance.api");

describe("NnsNeurons", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    resetNeuronsApiService();
    neuronsStore.reset();
  });

  const renderComponent = async () => {
    const { container } = render(NnsNeurons);
    await runResolvedPromises();
    return NnsNeuronsPo.under(new JestPageObjectElement(container));
  };

  describe("with enough neurons", () => {
    const mockNeuron2 = {
      ...mockNeuron,
      neuronId: 223n,
    };
    const spawningNeuron = {
      ...mockNeuron,
      state: NeuronState.Spawning,
      neuronId: 224n,
      fullNeuron: {
        ...mockFullNeuron,
        spawnAtTimesSeconds: 12_312_313n,
      },
    };
    const neurons = [mockNeuron, spawningNeuron, mockNeuron2];

    beforeEach(() => {
      vi.spyOn(authServices, "getAuthenticatedIdentity").mockResolvedValue(
        mockIdentity
      );
      vi.spyOn(api, "queryNeurons").mockResolvedValue(neurons);
    });

    it("should render spawning neurons as disabled", async () => {
      const po = await renderComponent();

      const neuronCards = await po.getNeuronCardPos();
      expect(neuronCards.length).toBe(3);

      expect(await neuronCards[0].isDisabled()).toBe(false);
      expect(await neuronCards[1].isDisabled()).toBe(true);
      expect(await neuronCards[2].isDisabled()).toBe(false);
    });

    it("should render the NeuronCards", async () => {
      const po = await renderComponent();

      const neuronCards = await po.getNeuronCardPos();
      expect(neuronCards.length).toBe(neurons.length);
    });

    it("should not render an empty message", async () => {
      const po = await renderComponent();

      expect(await po.hasEmptyMessage()).toBe(false);
    });
  });

  describe("no neurons", () => {
    beforeEach(() => {
      vi.spyOn(authServices, "getAuthenticatedIdentity").mockResolvedValue(
        mockIdentity
      );
      vi.spyOn(api, "queryNeurons").mockResolvedValue([]);
    });

    it("should render an empty message", async () => {
      const po = await renderComponent();

      expect(await po.hasEmptyMessage()).toBe(true);
    });
  });

  describe("navigating", () => {
    beforeEach(() => {
      vi.spyOn(authServices, "getAuthenticatedIdentity").mockResolvedValue(
        mockIdentity
      );
      vi.spyOn(api, "queryNeurons").mockResolvedValue([]);
    });

    it("should call query neurons twice when rendered", async () => {
      await renderComponent();

      await waitFor(() =>
        expect(api.queryNeurons).toHaveBeenCalledWith({
          identity: mockIdentity,
          certified: true,
        })
      );
      expect(api.queryNeurons).toHaveBeenCalledWith({
        identity: mockIdentity,
        certified: false,
      });
    });

    it("should NOT call query neurons after being visited", async () => {
      await renderComponent();

      await waitFor(() =>
        expect(api.queryNeurons).toHaveBeenCalledWith({
          identity: mockIdentity,
          certified: true,
        })
      );
      expect(api.queryNeurons).toHaveBeenCalledWith({
        identity: mockIdentity,
        certified: false,
      });

      await renderComponent();

      // We wait to make sure there are no more calls
      await tick();
      await tick();
      await tick();

      await waitFor(() => expect(api.queryNeurons).toHaveBeenCalledTimes(2));
    });
  });
});
