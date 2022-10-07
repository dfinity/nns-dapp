/**
 * @jest-environment jsdom
 */

import type { SnsNeuron } from "@dfinity/sns";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import { get } from "svelte/store";
import * as accountsApi from "../../../../lib/api/accounts.api";
import { CONTEXT_PATH } from "../../../../lib/constants/routes.constants";
import { snsTokenSymbolSelectedStore } from "../../../../lib/derived/sns/sns-token-symbol-selected.store";
import DisburseSnsNeuronModal from "../../../../lib/modals/neurons/DisburseSnsNeuronModal.svelte";
import { disburse } from "../../../../lib/services/sns-neurons.services";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import { routeStore } from "../../../../lib/stores/route.store";
import {
  mockAccountsStoreSubscribe,
  mockMainAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import { renderModal } from "../../../mocks/modal.mock";
import { mockSnsNeuron } from "../../../mocks/sns-neurons.mock";
import { mockTokenStore } from "../../../mocks/sns-projects.mock";

jest.mock("../../../../lib/services/sns-neurons.services", () => {
  return {
    disburse: jest.fn().mockResolvedValue({ success: true }),
  };
});

describe("DisburseSnsNeuronModal", () => {
  const renderDisburseModal = async (
    neuron: SnsNeuron,
    reloadContext: () => Promise<void> = () => Promise.resolve()
  ): Promise<RenderResult> => {
    return renderModal({
      component: DisburseSnsNeuronModal,
      props: {
        neuron,
        reloadContext,
      },
    });
  };

  beforeAll(() => {
    jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe([mockSubAccount]));

    accountsStore.set({
      ...get(accountsStore),
      main: mockMainAccount,
    });

    jest
      .spyOn(accountsApi, "loadAccounts")
      .mockImplementation(() =>
        Promise.resolve({ main: mockMainAccount, subAccounts: [] })
      );

    jest
      .spyOn(snsTokenSymbolSelectedStore, "subscribe")
      .mockImplementation(mockTokenStore);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it("should display modal", async () => {
    const { container } = await renderDisburseModal(mockSnsNeuron);

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should render a confirmation screen", async () => {
    const { queryByTestId } = await renderDisburseModal(mockSnsNeuron);

    const confirmScreen = queryByTestId("confirm-disburse-screen");
    expect(confirmScreen).not.toBeNull();
  });

  it("should call disburse service", async () => {
    const principalString = "aaaaa-aa";
    routeStore.update({
      path: `${CONTEXT_PATH}/${principalString}/neuron/12344`,
    });

    const { queryByTestId } = await renderDisburseModal(mockSnsNeuron);

    expect(queryByTestId("confirm-disburse-screen")).not.toBeNull();

    const confirmButton = queryByTestId("disburse-neuron-button");
    expect(confirmButton).not.toBeNull();

    confirmButton && (await fireEvent.click(confirmButton));
    expect(disburse).toBeCalled();
  });

  it("should call reloadContext", async () => {
    const principalString = "aaaaa-aa";
    routeStore.update({
      path: `${CONTEXT_PATH}/${principalString}/neuron/12344`,
    });
    const reloadContext = jest.fn().mockResolvedValue(null);
    const { queryByTestId } = await renderDisburseModal(
      mockSnsNeuron,
      reloadContext
    );

    expect(queryByTestId("confirm-disburse-screen")).not.toBeNull();

    const confirmButton = queryByTestId("disburse-neuron-button");
    expect(confirmButton).not.toBeNull();

    confirmButton && (await fireEvent.click(confirmButton));

    await waitFor(() => expect(reloadContext).toBeCalled());
  });
});
