/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import { authStore } from "../../lib/stores/auth.store";
import NeuronDetail from "../../routes/NeuronDetail.svelte";
import { mockAuthStoreSubscribe } from "../mocks/auth.store.mock";

describe("NeuronDetail", () => {
  beforeEach(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  it("should render title", () => {
    const { getByText } = render(NeuronDetail);

    expect(
      getByText("Neuron", {
        exact: false,
      })
    ).toBeInTheDocument();
  });
});
