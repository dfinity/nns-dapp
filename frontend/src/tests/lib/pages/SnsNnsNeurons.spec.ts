/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/svelte";
import SnsNeurons from "../../../lib/pages/SnsNeurons.svelte";
import { authStore } from "../../../lib/stores/auth.store";
import { sortedSnsNeuronStore } from "../../../lib/stores/sns-neurons.store";
import {
  mockAuthStoreSubscribe,
  mockPrincipal,
} from "../../mocks/auth.store.mock";
import {
  buildMockSortedSnsNeuronsStoreSubscribe,
  createMockSnsNeuron,
} from "../../mocks/sns-neurons.mock";

jest.mock("../../../lib/services/sns-neurons.services", () => {
  return {
    loadSnsNeurons: jest.fn(),
  };
});

describe("SnsNeurons", () => {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  let authStoreMock: jest.MockedFunction<any>;

  beforeEach(() => {
    authStoreMock = jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
    const neuron1 = createMockSnsNeuron({
      id: [1, 2, 3],
    });
    const neuron2 = createMockSnsNeuron({
      id: [1, 2, 4],
    });
    jest
      .spyOn(sortedSnsNeuronStore, "subscribe")
      .mockImplementation(
        buildMockSortedSnsNeuronsStoreSubscribe([neuron1, neuron2])
      );
  });

  it("should subscribe to store", () => {
    render(SnsNeurons);
    expect(authStoreMock).toHaveBeenCalled();
  });

  it("should render a principal as text", () => {
    const { getByText } = render(SnsNeurons);

    expect(
      getByText(mockPrincipal.toText(), { exact: false })
    ).toBeInTheDocument();
  });

  it("should render a SnsNeuronCards", async () => {
    const { queryAllByTestId } = render(SnsNeurons);

    waitFor(() =>
      expect(queryAllByTestId("sns-neuron-card-title").length).toBe(2)
    );
  });
});
