/**
 * @jest-environment jsdom
 */

import { resetNeuronsApiService } from "$lib/api-services/governance.api-service";
import * as api from "$lib/api/governance.api";
import NnsNeurons from "$lib/pages/NnsNeurons.svelte";
import * as authServices from "$lib/services/auth.services";
import { neuronsStore } from "$lib/stores/neurons.store";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { NeuronState } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";

jest.mock("$lib/api/governance.api");

describe("NnsNeurons", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    resetNeuronsApiService();
    neuronsStore.reset();
  });

  describe("with enough neurons", () => {
    const mockNeuron2 = {
      ...mockNeuron,
      neuronId: BigInt(223),
    };
    const spawningNeuron = {
      ...mockNeuron,
      state: NeuronState.Spawning,
      neuronId: BigInt(224),
      fullNeuron: {
        ...mockFullNeuron,
        spawnAtTimesSeconds: BigInt(12312313),
      },
    };
    const neurons = [mockNeuron, spawningNeuron, mockNeuron2];

    beforeEach(() => {
      jest
        .spyOn(authServices, "getAuthenticatedIdentity")
        .mockResolvedValue(mockIdentity);
      jest.spyOn(api, "queryNeurons").mockResolvedValue(neurons);
    });

    it("should render spawning neurons as disabled", async () => {
      const { queryAllByTestId } = render(NnsNeurons);

      // Wait for the neurons to be loaded and rendered
      await waitFor(() => {
        const neuronCards = queryAllByTestId("neuron-card");
        return expect(neuronCards.length).toBe(neurons.length);
      });
      const neuronCards = queryAllByTestId("neuron-card");
      const disabledCards = neuronCards.filter(
        (card) => card.getAttribute("aria-disabled") === "true"
      );
      expect(disabledCards.length).toBe(1);
    });

    it("should render the NeuronCards", async () => {
      const { getAllByTestId } = render(NnsNeurons);

      await waitFor(() =>
        expect(getAllByTestId("neuron-card").length).toEqual(neurons.length)
      );
    });
  });

  describe("no neurons", () => {
    beforeEach(() => {
      jest
        .spyOn(authServices, "getAuthenticatedIdentity")
        .mockResolvedValue(mockIdentity);
      jest.spyOn(api, "queryNeurons").mockResolvedValue([]);
    });

    it("should render an empty message", async () => {
      const { getByText } = render(NnsNeurons);

      await waitFor(() =>
        expect(getByText(en.neurons.text)).toBeInTheDocument()
      );
    });
  });

  describe("navigating", () => {
    beforeEach(() => {
      jest
        .spyOn(authServices, "getAuthenticatedIdentity")
        .mockResolvedValue(mockIdentity);
      jest.spyOn(api, "queryNeurons").mockResolvedValue([]);
    });

    it("should call query neurons twice when rendered", async () => {
      render(NnsNeurons);

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
      render(NnsNeurons);

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

      render(NnsNeurons);

      // We wait to make sure there are no more calls
      await tick();
      await tick();
      await tick();

      await waitFor(() => expect(api.queryNeurons).toHaveBeenCalledTimes(2));
    });
  });
});
