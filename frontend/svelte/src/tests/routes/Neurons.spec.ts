/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import { authStore } from "../../lib/stores/auth.store";
import Neurons from "../../routes/Neurons.svelte";
import {
  mockAuthStoreSubscribe,
  mockPrincipal,
} from "../mocks/auth.store.mock";

describe("Neurons", () => {
  let authStoreMock;

  beforeEach(() => {
    authStoreMock = jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  it("should render content", () => {
    const { container, getByText } = render(Neurons);

    const title = container.querySelector("h1");
    expect(title).not.toBeNull();
    expect(title).toBeVisible();
    expect(title).toHaveTextContent("Neurons");

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
});
