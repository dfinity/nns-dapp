/**
 * @jest-environment jsdom
 */

import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
import SnsNeuronDetail from "$lib/pages/SnsNeuronDetail.svelte";
import { getSnsNeuron } from "$lib/services/sns-neurons.services";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { page } from "$mocks/$app/stores";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { mockSnsNeuron } from "../../mocks/sns-neurons.mock";
import { mockTokenStore } from "../../mocks/sns-projects.mock";
import { rootCanisterIdMock } from "../../mocks/sns.api.mock";

let validNeuron = true;
jest.mock("$lib/services/sns-neurons.services", () => {
  return {
    getSnsNeuron: jest.fn().mockImplementation(({ onLoad, onError }) => {
      if (validNeuron) {
        onLoad({ neuron: mockSnsNeuron });
      } else {
        onError();
      }
    }),
    loadSnsTopics: jest.fn(),
  };
});

describe("SnsNeuronDetail", () => {
  beforeEach(() => {
    jest
      .spyOn(snsTokenSymbolSelectedStore, "subscribe")
      .mockImplementation(mockTokenStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
    validNeuron = true;
  });

  describe("when neuron and projects are valid and present", () => {
    beforeEach(() =>
      page.mock({
        data: { universe: rootCanisterIdMock.toText() },
        routeId: AppPath.Neuron,
      })
    );

    const props = {
      neuronId: getSnsNeuronIdAsHexString(mockSnsNeuron),
    };

    it("should get neuron", async () => {
      render(SnsNeuronDetail, props);

      await waitFor(() => expect(getSnsNeuron).toBeCalled());
    });

    it("should render main information card", async () => {
      const { queryByTestId } = render(SnsNeuronDetail, props);

      expect(queryByTestId("sns-neuron-card-title")).toBeInTheDocument();
    });

    it("should render hotkeys card", async () => {
      const { queryByTestId } = render(SnsNeuronDetail, props);

      expect(queryByTestId("sns-hotkeys-card")).toBeInTheDocument();
    });

    it("should render following card", async () => {
      const { queryByTestId } = render(SnsNeuronDetail, props);

      expect(queryByTestId("sns-neuron-following")).toBeInTheDocument();
    });
  });

  describe("when project is an invalid canister id", () => {
    beforeEach(() => page.mock({ data: { universe: "invalid-project-id" } }));

    const props = {
      neuronId: getSnsNeuronIdAsHexString(mockSnsNeuron),
    };

    it("should redirect", async () => {
      render(SnsNeuronDetail, props);

      await waitFor(() => {
        const { path } = get(pageStore);
        expect(path).toEqual(AppPath.Neurons);
      });
    });
  });

  describe("when neuron is not found", () => {
    beforeEach(() => page.mock({ data: { universe: "invalid-project-id" } }));

    const props = {
      neuronId: getSnsNeuronIdAsHexString(mockSnsNeuron),
    };

    it("should redirect", async () => {
      validNeuron = false;
      render(SnsNeuronDetail, props);

      await waitFor(() => {
        const { path } = get(pageStore);
        expect(path).toEqual(AppPath.Neurons);
      });
    });
  });
});
