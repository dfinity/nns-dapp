/**
 * @jest-environment jsdom
 */

import type { NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import { authStore } from "../../lib/stores/auth.store";
import { routeStore } from "../../lib/stores/route.store";
import NeuronDetail from "../../routes/NeuronDetail.svelte";
import { mockAuthStoreSubscribe } from "../mocks/auth.store.mock";
import en from "../mocks/i18n.mock";
import { mockNeuron } from "../mocks/neurons.mock";
import { mockRouteStoreSubscibe } from "../mocks/route.store.mock";

jest.mock("../../lib/services/neurons.services", () => {
  return {
    loadNeuron: ({
      setNeuron,
    }: {
      setNeuron: (proposal: NeuronInfo) => void;
    }) => {
      setNeuron(mockNeuron);
    },
    // we can't mock one and not the other
    getNeuronId: () => "7193101111710042264",
  };
});

describe("NeuronDetail", () => {
  beforeEach(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);

    jest
      .spyOn(routeStore, "subscribe")
      .mockImplementation(
        mockRouteStoreSubscibe("/#/neuron/7193101111710042264")
      );
  });

  it("should render title", () => {
    const { getAllByText } = render(NeuronDetail);

    expect(getAllByText(en.neuron_detail.title).length).toBeGreaterThan(0);
  });
});
