/**
 * @jest-environment jsdom
 */

import {
  sortedSnsCFNeuronsStore,
  sortedSnsUserNeuronsStore,
} from "$lib/derived/sorted-sns-neurons.derived";
import SnsNeurons from "$lib/pages/SnsNeurons.svelte";
import { syncSnsAccounts } from "$lib/services/sns-accounts.services";
import { syncSnsNeurons } from "$lib/services/sns-neurons.services";
import { loadSnsParameters } from "$lib/services/sns-parameters.services";
import { authStore } from "$lib/stores/auth.store";
import { snsParametersStore } from "$lib/stores/sns-parameters.store";
import { page } from "$mocks/$app/stores";
import type { SnsNeuron } from "@dfinity/sns";
import { render, waitFor } from "@testing-library/svelte";
import { mockAuthStoreSubscribe } from "../../mocks/auth.store.mock";
import {
  buildMockSnsParametersStore,
  buildMockSortedSnsNeuronsStoreSubscribe,
  createMockSnsNeuron,
} from "../../mocks/sns-neurons.mock";
import { rootCanisterIdMock } from "../../mocks/sns.api.mock";

jest.mock("$lib/services/sns-neurons.services", () => {
  return {
    syncSnsNeurons: jest.fn().mockReturnValue(undefined),
  };
});

jest.mock("$lib/services/sns-accounts.services", () => {
  return {
    syncSnsAccounts: jest.fn().mockReturnValue(undefined),
  };
});

jest.mock("$lib/services/sns-parameters.services", () => {
  return {
    loadSnsParameters: jest.fn().mockReturnValue(undefined),
  };
});

describe("SnsNeurons", () => {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  let authStoreMock: jest.MockedFunction<any>;

  beforeEach(() => {
    page.mock({ data: { universe: rootCanisterIdMock.toText() } });
    authStoreMock = jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  afterEach(() => jest.clearAllMocks());

  describe("without neurons from CF", () => {
    beforeEach(() => {
      const neuron1 = createMockSnsNeuron({
        id: [1, 2, 3],
      });
      const neuron2 = createMockSnsNeuron({
        id: [1, 2, 4],
      });
      jest
        .spyOn(sortedSnsUserNeuronsStore, "subscribe")
        .mockImplementation(
          buildMockSortedSnsNeuronsStoreSubscribe([neuron1, neuron2])
        );
      jest
        .spyOn(sortedSnsCFNeuronsStore, "subscribe")
        .mockImplementation(buildMockSortedSnsNeuronsStoreSubscribe([]));
      jest
        .spyOn(snsParametersStore, "subscribe")
        .mockImplementation(buildMockSnsParametersStore());
    });

    afterEach(() => jest.clearAllMocks());

    it("should subscribe to store and call services to set up data", async () => {
      render(SnsNeurons);
      await waitFor(() => expect(authStoreMock).toHaveBeenCalled());
      await waitFor(() => expect(loadSnsParameters).toHaveBeenCalled());
      await waitFor(() => expect(syncSnsAccounts).toBeCalled());
      await waitFor(() => expect(syncSnsNeurons).toBeCalled());
    });

    it("should render SnsNeuronCards for each neuron", async () => {
      const { queryAllByTestId } = render(SnsNeurons);

      await waitFor(() =>
        expect(queryAllByTestId("sns-neuron-card-title").length).toBe(2)
      );
    });
  });

  describe("with neurons from CF", () => {
    beforeEach(() => {
      const neuron1 = createMockSnsNeuron({
        id: [1, 2, 3],
      });
      const neuron2: SnsNeuron = {
        ...createMockSnsNeuron({
          id: [1, 2, 4],
        }),
        source_nns_neuron_id: [BigInt(123)],
      };
      jest
        .spyOn(sortedSnsUserNeuronsStore, "subscribe")
        .mockImplementation(buildMockSortedSnsNeuronsStoreSubscribe([neuron1]));
      jest
        .spyOn(sortedSnsCFNeuronsStore, "subscribe")
        .mockImplementation(buildMockSortedSnsNeuronsStoreSubscribe([neuron2]));
    });

    afterEach(() => jest.clearAllMocks());

    it("should render SnsNeuronCards for each neuron", async () => {
      const { queryAllByTestId } = render(SnsNeurons);

      await waitFor(() =>
        expect(queryAllByTestId("sns-neuron-card-title").length).toBe(2)
      );
    });

    it("should render Community Fund title", async () => {
      const { queryByTestId } = render(SnsNeurons);

      await waitFor(() =>
        expect(queryByTestId("community-fund-title")).toBeInTheDocument()
      );
    });
  });
});
