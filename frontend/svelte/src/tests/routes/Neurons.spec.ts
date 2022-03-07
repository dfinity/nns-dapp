/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import { authStore } from "../../lib/stores/auth.store";
import Neurons from "../../routes/Neurons.svelte";
import {
  mockAuthStoreSubscribe,
  mockPrincipal,
} from "../mocks/auth.store.mock";
const en = require("../../lib/i18n/en.json");

describe("Neurons", () => {
  let authStoreMock;

  beforeEach(() => {
    authStoreMock = jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
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

  it("should render a NeuronCard", () => {
    const { container } = render(Neurons);

    const anchor = container.querySelector("a");
    expect(anchor).not.toBeNull();
  });

  it("should open the CreateNeuronModal on click to Stake Neurons", async () => {
    const { container, queryByText } = render(Neurons);

    const toolbarButton = container.querySelector('[role="toolbar"] button');
    expect(toolbarButton).not.toBeNull();
    expect(queryByText(en.neurons.select_source)).toBeNull();

    toolbarButton && (await fireEvent.click(toolbarButton));

    expect(queryByText(en.neurons.select_source)).not.toBeNull();
  });
});
