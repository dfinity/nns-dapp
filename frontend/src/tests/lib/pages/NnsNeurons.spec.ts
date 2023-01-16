/**
 * @jest-environment jsdom
 */

import NnsNeurons from "$lib/pages/NnsNeurons.svelte";
import { authStore } from "$lib/stores/auth.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { NeuronState } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import { mockAuthStoreSubscribe } from "../../mocks/auth.store.mock";
import en from "../../mocks/i18n.mock";
import {
  buildMockNeuronsStoreSubscribe,
  mockFullNeuron,
  mockNeuron,
} from "../../mocks/neurons.mock";

jest.mock("$lib/services/neurons.services", () => {
  return {
    listNeurons: jest.fn().mockResolvedValue(undefined),
  };
});

describe("NnsNeurons", () => {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  let authStoreMock: jest.MockedFunction<any>;

  beforeEach(() => {
    authStoreMock = jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  describe("with enough neurons", () => {
    beforeEach(() => {
      const mockNeuron2 = {
        ...mockNeuron,
        neuronId: BigInt(223),
      };
      const spawningNeuron = {
        ...mockNeuron,
        state: NeuronState.Spawning,
        neuronId: BigInt(223),
        fullNeuron: {
          ...mockFullNeuron,
          spawnAtTimesSeconds: BigInt(12312313),
        },
      };
      jest
        .spyOn(neuronsStore, "subscribe")
        .mockImplementation(
          buildMockNeuronsStoreSubscribe([
            mockNeuron,
            mockNeuron2,
            spawningNeuron,
          ])
        );
    });

    afterEach(() => jest.resetAllMocks());

    it("should render spawning neurons as disabled", () => {
      const { queryAllByTestId } = render(NnsNeurons);

      const neuronCards = queryAllByTestId("neuron-card");
      const disabledCards = neuronCards.filter(
        (card) => card.getAttribute("aria-disabled") === "true"
      );
      expect(disabledCards.length).toBe(1);
    });

    it("should subscribe to store", () => {
      render(NnsNeurons);
      expect(authStoreMock).toHaveBeenCalled();
    });

    it("should render a NeuronCard", async () => {
      const { container } = render(NnsNeurons);

      await waitFor(() =>
        expect(container.querySelector('article[role="link"]')).not.toBeNull()
      );
    });
  });

  describe("no neurons", () => {
    beforeAll(() => {
      jest
        .spyOn(neuronsStore, "subscribe")
        .mockImplementation(buildMockNeuronsStoreSubscribe([]));
    });

    it("should render an empty message", () => {
      const { getByText } = render(NnsNeurons);

      expect(getByText(en.neurons.text)).toBeInTheDocument();
    });
  });
});
