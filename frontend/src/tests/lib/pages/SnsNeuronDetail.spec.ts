/**
 * @jest-environment jsdom
 */

import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { snsSelectedTransactionFeeStore } from "$lib/derived/sns/sns-selected-transaction-fee.store";
import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
import SnsNeuronDetail from "$lib/pages/SnsNeuronDetail.svelte";
import { getSnsNeuron } from "$lib/services/sns-neurons.services";
import { loadSnsParameters } from "$lib/services/sns-parameters.services";
import { loadSnsTransactionFee } from "$lib/services/transaction-fees.services";
import { snsParametersStore } from "$lib/stores/sns-parameters.store";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { page } from "$mocks/$app/stores";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import {
  buildMockSnsParametersStore,
  mockSnsNeuron,
} from "../../mocks/sns-neurons.mock";
import { mockTokenStore } from "../../mocks/sns-projects.mock";
import { rootCanisterIdMock } from "../../mocks/sns.api.mock";
import { mockSnsSelectedTransactionFeeStoreSubscribe } from "../../mocks/transaction-fee.mock";

let validNeuron = true;
jest.mock("$lib/services/sns-parameters.services", () => {
  return {
    loadSnsParameters: jest.fn(),
  };
});
jest.mock("$lib/services/transaction-fees.services", () => {
  return {
    loadSnsTransactionFee: jest.fn(),
  };
});
jest.mock("$lib/services/sns-neurons.services", () => {
  return {
    getSnsNeuron: jest.fn().mockImplementation(({ onLoad, onError }) => {
      if (validNeuron) {
        onLoad({ neuron: mockSnsNeuron });
      } else {
        onError();
      }
    }),
    loadSnsNervousSystemFunctions: jest.fn(),
  };
});

describe("SnsNeuronDetail", () => {
  const mockParametersStore = () =>
    jest
      .spyOn(snsParametersStore, "subscribe")
      .mockImplementation(buildMockSnsParametersStore());
  const mockFeeStore = () =>
    jest
      .spyOn(snsSelectedTransactionFeeStore, "subscribe")
      .mockImplementation(mockSnsSelectedTransactionFeeStoreSubscribe());

  beforeAll(() => {
    mockParametersStore();
    mockFeeStore();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest
      .spyOn(snsTokenSymbolSelectedStore, "subscribe")
      .mockImplementation(mockTokenStore);
  });

  afterEach(() => {
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

    it("should render sns project name", async () => {
      const { getByTestId } = render(SnsNeuronDetail, props);

      const titleRow = getByTestId("projects-summary");

      expect(titleRow).not.toBeNull();
    });

    it("should not load parameters and fee when available", async () => {
      render(SnsNeuronDetail, props);

      await waitFor(() => expect(loadSnsParameters).not.toBeCalled());
      await waitFor(() => expect(loadSnsTransactionFee).not.toBeCalled());
    });

    describe("", () => {
      beforeAll(() => {
        // empty stores
        jest
          .spyOn(snsParametersStore, "subscribe")
          .mockImplementation(buildMockSnsParametersStore(true));
        jest
          .spyOn(snsSelectedTransactionFeeStore, "subscribe")
          .mockImplementation(
            mockSnsSelectedTransactionFeeStoreSubscribe(true)
          );
      });

      afterAll(() => {
        // restore stores
        mockParametersStore();
        mockFeeStore();
      });

      it("should load parameters and fee if not available", async () => {
        render(SnsNeuronDetail, props);

        await waitFor(() => expect(loadSnsParameters).toBeCalled());
        await waitFor(() => expect(loadSnsTransactionFee).toBeCalled());
      });
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
