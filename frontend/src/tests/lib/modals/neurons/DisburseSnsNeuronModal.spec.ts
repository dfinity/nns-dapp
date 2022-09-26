/**
 * @jest-environment jsdom
 */

import type { SnsNeuron } from "@dfinity/sns";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import { get } from "svelte/store";
import { CONTEXT_PATH } from "../../../../lib/constants/routes.constants";
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

jest.mock("../../../../lib/services/sns-neurons.services", () => {
  return {
    disburse: jest.fn().mockResolvedValue({ success: true }),
  };
});

describe("DisburseSnsNeuronModal", () => {
  const renderDisburseModal = async (
    neuron: SnsNeuron
  ): Promise<RenderResult> => {
    return renderModal({
      component: DisburseSnsNeuronModal,
      props: { neuron },
    });
  };

  const spyNavigate = jest
    .spyOn(routeStore, "replace")
    .mockImplementation(jest.fn());

  beforeAll(() => {
    jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe([mockSubAccount]));

    accountsStore.set({
      ...get(accountsStore),
      main: mockMainAccount,
    });
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

    const confirmScreen = queryByTestId("confirm-disburse-sns-neuron-screen");
    expect(confirmScreen).not.toBeNull();
  });

  it("should call disburse service", async () => {
    const principalString = "aaaaa-aa";
    routeStore.update({
      path: `${CONTEXT_PATH}/${principalString}/neuron/12344`,
    });

    const { queryByTestId } = await renderDisburseModal(mockSnsNeuron);
    const confirmScreen = queryByTestId("confirm-disburse-sns-neuron-screen");
    expect(confirmScreen).not.toBeNull();

    const confirmButton = queryByTestId("disburse-neuron-button");
    expect(confirmButton).not.toBeNull();

    confirmButton && (await fireEvent.click(confirmButton));
    expect(disburse).toBeCalled();
    await waitFor(() => expect(spyNavigate).toBeCalled());
  });
});
