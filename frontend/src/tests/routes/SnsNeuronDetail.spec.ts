/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import { routeStore } from "../../lib/stores/route.store";
import { getSnsNeuronIdAsHexString } from "../../lib/utils/sns-neuron.utils";
import SnsNeuronDetail from "../../routes/SnsNeuronDetail.svelte";
import { mockRouteStoreSubscribe } from "../mocks/route.store.mock";
import { mockSnsNeuron } from "../mocks/sns-neurons.mock";
import { rootCanisterIdMock } from "../mocks/sns.api.mock";

jest.mock("../../lib/services/sns-neurons.services", () => {
  return {
    getSnsNeuron: jest.fn(),
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

  it("should render div", async () => {
    const { queryByTestId } = render(SnsNeuronDetail);

    expect(queryByTestId("sns-neuron-detail-page")).toBeInTheDocument();
  });
});
