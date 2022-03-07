/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import NeuronDetail from "../../routes/NeuronDetail.svelte";

describe("Canisters", () => {
  it("should render title", () => {
    const { getByText } = render(NeuronDetail);

    expect(
      getByText("Neuron", {
        exact: false,
      })
    ).toBeInTheDocument();
  });
});
