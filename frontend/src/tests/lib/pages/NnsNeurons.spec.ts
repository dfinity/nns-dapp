/**
 * @jest-environment jsdom
 */

import { resetNeuronsApiService } from "$lib/api-services/neurons.api-service";
import * as api from "$lib/api/governance.api";
import NnsNeurons from "$lib/pages/NnsNeurons.svelte";
import * as authServices from "$lib/services/auth.services";
import { neuronsStore } from "$lib/stores/neurons.store";
import { NeuronState } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import { mockIdentity } from "../../mocks/auth.store.mock";
import en from "../../mocks/i18n.mock";
import { mockFullNeuron, mockNeuron } from "../../mocks/neurons.mock";

jest.mock("$lib/api/governance.api");

describe("NnsNeurons", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    neuronsStore.reset();
  });

  describe("with enough neurons", () => {
    beforeEach(() => {
      resetNeuronsApiService();
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
      jest
        .spyOn(authServices, "getAuthenticatedIdentity")
        .mockResolvedValue(mockIdentity);
      jest
        .spyOn(api, "queryNeurons")
        .mockResolvedValue([mockNeuron, spawningNeuron, mockNeuron2]);
    });

    it("should render spawning neurons as disabled", async () => {
      const { queryAllByTestId } = render(NnsNeurons);

      // Wait for the neurons to be loaded and rendered
      await waitFor(() => {
        const neuronCards = queryAllByTestId("neuron-card");
        return expect(neuronCards.length).toBe(3);
      });
      const neuronCards = queryAllByTestId("neuron-card");
      const disabledCards = neuronCards.filter(
        (card) => card.getAttribute("aria-disabled") === "true"
      );
      expect(disabledCards.length).toBe(1);
    });

    it("should render a NeuronCard", async () => {
      const { container } = render(NnsNeurons);

      await waitFor(() =>
        expect(container.querySelector('article[role="link"]')).not.toBeNull()
      );
    });
  });

  describe("no neurons", () => {
    beforeEach(() => {
      resetNeuronsApiService();
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
      resetNeuronsApiService();
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
      resetNeuronsApiService();
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

      await waitFor(() => expect(api.queryNeurons).toHaveBeenCalledTimes(2));
    });
  });
});
