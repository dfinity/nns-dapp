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

  describe("accountsStore is populated", () => {
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
      expect(
        container.querySelector("input[name='amount']")
      ).toBeInTheDocument();
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

      const participateButton = queryByTestId(
        "sns-swap-participate-button-next"
      );
      expect(participateButton?.hasAttribute("disabled")).toBeTruthy();
    });

    it("should enable button when input value changes", async () => {
      const { queryByTestId, container } = await renderSwapModal();

      const participateButton = queryByTestId(
        "sns-swap-participate-button-next"
      );
      expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

      const input = container.querySelector("input[name='amount']");
      input && fireEvent.input(input, { target: { value: "10" } });
      await waitFor(() =>
        expect(participateButton?.hasAttribute("disabled")).toBeFalsy()
      );
    });

    it("should move to the last step with ICP and disabled button", async () => {
      const { queryByTestId, queryByText, getByTestId, container } =
        await renderSwapModal();

      const participateButton = queryByTestId(
        "sns-swap-participate-button-next"
      );
      expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

      const icpAmount = "10";
      const input = container.querySelector("input[name='amount']");
      input && fireEvent.input(input, { target: { value: icpAmount } });
      await waitFor(() =>
        expect(participateButton?.hasAttribute("disabled")).toBeFalsy()
      );

      participateButton && fireEvent.click(participateButton);
      await waitFor(() =>
        expect(queryByTestId("sns-swap-participate-step-2")).toBeTruthy()
      );
      expect(queryByText(icpAmount, { exact: false })).toBeInTheDocument();

      const confirmButton = getByTestId("sns-swap-participate-button-execute");
      expect(confirmButton?.hasAttribute("disabled")).toBeTruthy();
    });

    it("should move to the last step and enable button when accepting terms", async () => {
      const { queryByTestId, queryByText, getByTestId, container } =
        await renderSwapModal();

      const participateButton = queryByTestId(
        "sns-swap-participate-button-next"
      );
      expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

      const icpAmount = "10";
      const input = container.querySelector("input[name='amount']");
      input && fireEvent.input(input, { target: { value: icpAmount } });
      await waitFor(() =>
        expect(participateButton?.hasAttribute("disabled")).toBeFalsy()
      );

      participateButton && fireEvent.click(participateButton);
      await waitFor(() =>
        expect(queryByTestId("sns-swap-participate-step-2")).toBeTruthy()
      );
      expect(queryByText(icpAmount, { exact: false })).toBeInTheDocument();

      const confirmButton = getByTestId("sns-swap-participate-button-execute");
      expect(confirmButton?.hasAttribute("disabled")).toBeTruthy();

      const acceptInput = container.querySelector("[type='checkbox']");
      acceptInput && (await fireEvent.click(acceptInput));
      await waitFor(() =>
        expect(confirmButton?.hasAttribute("disabled")).toBeFalsy()
      );
    });

    it("should move to the last step and go back", async () => {
      const { queryByTestId, container } = await renderSwapModal();

      const participateButton = queryByTestId(
        "sns-swap-participate-button-next"
      );
      expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

      const input = container.querySelector("input[name='amount']");
      input && fireEvent.input(input, { target: { value: "10" } });
      await waitFor(() =>
        expect(participateButton?.hasAttribute("disabled")).toBeFalsy()
      );

      participateButton && fireEvent.click(participateButton);
      await waitFor(() =>
        expect(queryByTestId("sns-swap-participate-step-2")).toBeTruthy()
      );

      await clickByTestId(queryByTestId, "sns-swap-participate-button-back");
      await waitFor(() =>
        expect(queryByTestId("sns-swap-participate-step-1")).toBeTruthy()
      );
    });
  });

  describe("accountsStore is empty", () => {
    it("should have disabled button if no account is selected", async () => {
      const { queryByTestId, container } = await renderSwapModal();

      const participateButton = queryByTestId(
        "sns-swap-participate-button-next"
      );

      const input = container.querySelector("input[name='amount']");
      input && (await fireEvent.input(input, { target: { value: "10" } }));

      expect(participateButton?.hasAttribute("disabled")).toBeFalsy();
    });
  });
});
