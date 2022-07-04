/**
 * @jest-environment jsdom
 */

import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import ParticipateSwapModal from "../../../../lib/modals/sns/ParticipateSwapModal.svelte";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import { mockAccountsStoreSubscribe } from "../../../mocks/accounts.store.mock";
import { renderModal } from "../../../mocks/modal.mock";
import { mockSnsFullProject } from "../../../mocks/sns-projects.mock";
import { clickByTestId } from "../../testHelpers/clickByTestId";

describe("ParticipateSwapModal", () => {
  const renderSwapModal = async (): Promise<RenderResult> => {
    return renderModal({
      component: ParticipateSwapModal,
      props: { project: mockSnsFullProject },
    });
  };

  beforeEach(() => {
    jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe());
  });

  it("should display modal", async () => {
    const { container } = await renderSwapModal();

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should display dropdown to select account and input to add amount", async () => {
    const { queryByTestId, container } = await renderSwapModal();

    expect(queryByTestId("select-account-dropdown")).toBeInTheDocument();
    expect(container.querySelector("input[name='amount']")).toBeInTheDocument();
  });

  it("should trigger close on cancel", async () => {
    const { queryByTestId, component } = await renderSwapModal();

    const onClose = jest.fn();
    component.$on("nnsClose", onClose);

    await clickByTestId(queryByTestId, "sns-swap-participate-button-cancel");
    await waitFor(() => expect(onClose).toBeCalled());
  });

  it("should have disabled button by default", async () => {
    const { queryByTestId } = await renderSwapModal();

    const participateButton = queryByTestId("sns-swap-participate-button-next");
    expect(participateButton?.hasAttribute("disabled")).toBeTruthy();
  });

  it("should enable button when input value changes", async () => {
    const { queryByTestId, container } = await renderSwapModal();

    const participateButton = queryByTestId("sns-swap-participate-button-next");
    expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

    const input = container.querySelector("input[name='amount']");
    input && fireEvent.input(input, { target: { value: "10" } });
    await waitFor(() =>
      expect(participateButton?.hasAttribute("disabled")).toBeFalsy()
    );
  });

  it("should move to the last step", async () => {
    const { queryByTestId, container } = await renderSwapModal();

    const participateButton = queryByTestId("sns-swap-participate-button-next");
    expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

    const input = container.querySelector("input[name='amount']");
    input && fireEvent.input(input, { target: { value: "10" } });
    await waitFor(() =>
      expect(participateButton?.hasAttribute("disabled")).toBeFalsy()
    );

    participateButton && fireEvent.click(participateButton);
    await waitFor(() =>
      expect(queryByTestId("sns-swap-participate-step-2")).toBeFalsy()
    );
  });
});
