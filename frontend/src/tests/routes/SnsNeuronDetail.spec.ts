/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/svelte";
import { getSnsNeuron } from "../../lib/services/sns-neurons.services";
import { routeStore } from "../../lib/stores/route.store";
import { getSnsNeuronIdAsHexString } from "../../lib/utils/sns-neuron.utils";
import SnsNeuronDetail from "../../routes/SnsNeuronDetail.svelte";
import { mockRouteStoreSubscribe } from "../mocks/route.store.mock";
import { mockSnsNeuron } from "../mocks/sns-neurons.mock";
import { rootCanisterIdMock } from "../mocks/sns.api.mock";

jest.mock("../../lib/services/sns-neurons.services", () => {
  return {
    getSnsNeuron: jest
      .fn()
      .mockImplementation(({ onLoad }) => onLoad({ neuron: mockSnsNeuron })),
  };
});

describe("SnsNeuronDetail", () => {
  jest
    .spyOn(routeStore, "subscribe")
    .mockImplementation(
      mockRouteStoreSubscribe(
        `/#/project/${rootCanisterIdMock.toText()}/neuron/${getSnsNeuronIdAsHexString(
          mockSnsNeuron
        )}`
      )
    );

  it("should get neuron", async () => {
    render(SnsNeuronDetail);

    await waitFor(() => expect(getSnsNeuron).toBeCalled());
  });

  it("should render main information card", async () => {
    const { queryByTestId } = render(SnsNeuronDetail);

    expect(queryByTestId("sns-neuron-card-title")).toBeInTheDocument();
  });

  it("should render hotkeys card", async () => {
    const { queryByTestId } = render(SnsNeuronDetail);

    expect(queryByTestId("sns-hotkeys-card")).toBeInTheDocument();
  });
});
