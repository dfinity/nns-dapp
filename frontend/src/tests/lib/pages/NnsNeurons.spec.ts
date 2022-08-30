/**
 * @jest-environment jsdom
 */

import { NeuronState } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import NnsNeurons from "../../../lib/pages/NnsNeurons.svelte";
import { authStore } from "../../../lib/stores/auth.store";
import { neuronsStore } from "../../../lib/stores/neurons.store";
import {
  mockAuthStoreSubscribe,
  mockPrincipal,
} from "../../mocks/auth.store.mock";
import {
  buildMockNeuronsStoreSubscribe,
  mockFullNeuron,
  mockNeuron,
} from "../../mocks/neurons.mock";

jest.mock("../../../lib/services/neurons.services", () => {
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

    it("should render content", () => {
      const { getByText } = render(NnsNeurons);

      expect(
        getByText("Earn rewards by staking your ICP in neurons.", {
          exact: false,
        })
      ).toBeInTheDocument();
    });

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

    it("should render a principal as text", () => {
      const { getByText } = render(NnsNeurons);

      expect(
        getByText(mockPrincipal.toText(), { exact: false })
      ).toBeInTheDocument();
    });

    it("should render a NeuronCard", async () => {
      const { container } = render(NnsNeurons);

      waitFor(() =>
        expect(container.querySelector('article[role="link"]')).not.toBeNull()
      );
    });
  });
});
