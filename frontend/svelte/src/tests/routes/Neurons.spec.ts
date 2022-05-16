/**
 * @jest-environment jsdom
 */

import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { authStore } from "../../lib/stores/auth.store";
import { neuronsStore } from "../../lib/stores/neurons.store";
import Neurons from "../../routes/Neurons.svelte";
import {
  mockAuthStoreSubscribe,
  mockPrincipal,
} from "../mocks/auth.store.mock";
import en from "../mocks/i18n.mock";
import {
  buildMockNeuronsStoreSubscribe,
  mockNeuron,
} from "../mocks/neurons.mock";

jest.mock("../../lib/services/neurons.services", () => {
  return {
    listNeurons: jest.fn().mockResolvedValue(undefined),
  };
});

describe("Neurons", () => {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  let authStoreMock: jest.MockedFunction<any>;

  beforeEach(() => {
    authStoreMock = jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);

    jest
      .spyOn(neuronsStore, "subscribe")
      .mockImplementation(buildMockNeuronsStoreSubscribe([mockNeuron]));
  });

  it("should render content", () => {
    const { getByText } = render(Neurons);

    expect(
      getByText("Earn rewards by staking your ICP in neurons.", {
        exact: false,
      })
    ).toBeInTheDocument();
  });

  it("should subscribe to store", () =>
    expect(authStoreMock).toHaveBeenCalled());

  it("should render a principal as text", () => {
    const { getByText } = render(Neurons);

    expect(
      getByText(mockPrincipal.toText(), { exact: false })
    ).toBeInTheDocument();
  });

  it("should render a NeuronCard", async () => {
    const { container } = render(Neurons);

    waitFor(() =>
      expect(container.querySelector('article[role="link"]')).not.toBeNull()
    );
  });

  it("should open the CreateNeuronModal on click to Stake Neurons", async () => {
    const { queryByTestId, queryByText } = render(Neurons);

    const toolbarButton = queryByTestId("stake-neuron-button");
    expect(toolbarButton).not.toBeNull();
    expect(queryByText(en.accounts.select_source)).toBeNull();

    toolbarButton !== null && (await fireEvent.click(toolbarButton));

    expect(queryByText(en.accounts.select_source)).not.toBeNull();
  });

  it("should open the MergeNeuronsModal on click to Merge Neurons", async () => {
    const { queryByTestId, queryByText } = render(Neurons);

    const toolbarButton = queryByTestId("merge-neurons-button");
    expect(toolbarButton).not.toBeNull();
    expect(queryByText(en.neurons.merge_neurons_modal_title)).toBeNull();

    toolbarButton !== null && (await fireEvent.click(toolbarButton));

    expect(queryByText(en.neurons.merge_neurons_modal_title)).not.toBeNull();
  });
});
