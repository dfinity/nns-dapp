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

let validNeuron = true;
jest.mock("../../lib/services/sns-neurons.services", () => {
  return {
    getSnsNeuron: jest.fn().mockImplementation(({ onLoad, onError }) => {
      if (validNeuron) {
        onLoad({ neuron: mockSnsNeuron });
      } else {
        onError();
      }
    }),
  };
});

describe("SnsNeuronDetail", () => {
  afterEach(() => {
    jest.clearAllMocks();
    validNeuron = true;
  });
  describe("when neuron and projects are valid and present", () => {
    beforeEach(() => {
      jest
        .spyOn(routeStore, "subscribe")
        .mockImplementation(
          mockRouteStoreSubscribe(
            `/#/project/${rootCanisterIdMock.toText()}/neuron/${getSnsNeuronIdAsHexString(
              mockSnsNeuron
            )}`
          )
        );
    });

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

  describe("when project is an invalid canister id", () => {
    beforeEach(() => {
      jest
        .spyOn(routeStore, "subscribe")
        .mockImplementation(
          mockRouteStoreSubscribe(
            `/#/project/invalid-project-id/neuron/${getSnsNeuronIdAsHexString(
              mockSnsNeuron
            )}`
          )
        );
      jest.spyOn(routeStore, "replace");
    });

    it("should get neuron", async () => {
      render(SnsNeuronDetail);

      await waitFor(() => expect(routeStore.replace).toBeCalled());
    });
  });

  describe("when neuron is not found", () => {
    beforeEach(() => {
      jest
        .spyOn(routeStore, "subscribe")
        .mockImplementation(
          mockRouteStoreSubscribe(
            `/#/project/invalid-project-id/neuron/${getSnsNeuronIdAsHexString(
              mockSnsNeuron
            )}`
          )
        );
      jest.spyOn(routeStore, "replace");
    });

    it("should get neuron", async () => {
      validNeuron = false;
      render(SnsNeuronDetail);

      await waitFor(() => expect(routeStore.replace).toBeCalled());
    });
  });
});
