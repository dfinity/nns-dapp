/**
 * @jest-environment jsdom
 */

import SnsNeuronInfoStake from "$lib/components/sns-neuron-detail/SnsNeuronInfoStake.svelte";
import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
import { authStore } from "$lib/stores/auth.store";
import { page } from "$mocks/$app/stores";
import { SnsNeuronPermissionType } from "@dfinity/sns";
import { waitFor } from "@testing-library/svelte";
import { mockAuthStoreSubscribe } from "../../../mocks/auth.store.mock";
import { renderSelectedSnsNeuronContext } from "../../../mocks/context-wrapper.mock";
import { mockSnsNeuronWithPermissions } from "../../../mocks/sns-neurons.mock";
import {
  mockSnsFullProject,
  mockTokenStore,
} from "../../../mocks/sns-projects.mock";

describe("SnsNeuronInfoStake", () => {
  beforeAll(() =>
    page.mock({
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    })
  );

  beforeEach(() => {
    jest
      .spyOn(snsTokenSymbolSelectedStore, "subscribe")
      .mockImplementation(mockTokenStore);

    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  it("should render disburse button", async () => {
    const neuron = mockSnsNeuronWithPermissions([
      SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_DISBURSE,
    ]);
    const { queryByTestId } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronInfoStake,
      neuron,
      reload: jest.fn(),
    });

    await waitFor(() =>
      expect(queryByTestId("disburse-button")).toBeInTheDocument()
    );
  });

  it("should not render disburse button", async () => {
    const neuron = mockSnsNeuronWithPermissions([]);
    const { queryByTestId } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronInfoStake,
      neuron,
      reload: jest.fn(),
    });

    expect(queryByTestId("disburse-button")).not.toBeInTheDocument();
  });

  it("should render dissolve button", async () => {
    const neuron = mockSnsNeuronWithPermissions([
      SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_CONFIGURE_DISSOLVE_STATE,
    ]);
    const { queryByTestId } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronInfoStake,
      neuron,
      reload: jest.fn(),
    });

    expect(queryByTestId("sns-increase-dissolve-delay")).toBeInTheDocument();
  });

  it("should not render dissolve button", async () => {
    const neuron = mockSnsNeuronWithPermissions([]);
    const { queryByTestId } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronInfoStake,
      neuron,
      reload: jest.fn(),
    });

    expect(
      queryByTestId("sns-increase-dissolve-delay")
    ).not.toBeInTheDocument();
  });

  it("renders increase dissolve delay button", async () => {
    const neuron = mockSnsNeuronWithPermissions([
      SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_CONFIGURE_DISSOLVE_STATE,
    ]);
    const { queryByTestId } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronInfoStake,
      neuron,
      reload: jest.fn(),
    });

    expect(queryByTestId("sns-increase-dissolve-delay")).toBeInTheDocument();
  });

  it("should not render increase dissolve delay button", async () => {
    const neuron = mockSnsNeuronWithPermissions([]);
    const { queryByTestId } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronInfoStake,
      neuron,
      reload: jest.fn(),
    });

    expect(
      queryByTestId("sns-increase-dissolve-delay")
    ).not.toBeInTheDocument();
  });
});
