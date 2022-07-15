/**
 * @jest-environment jsdom
 */

import { fireEvent, waitFor } from "@testing-library/svelte";
import { writable } from "svelte/store";
import ParticipateSwapModal from "../../../../lib/modals/sns/ParticipateSwapModal.svelte";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import {
  PROJECT_DETAIL_CONTEXT_KEY,
  type ProjectDetailContext,
  type ProjectDetailStore,
} from "../../../../lib/types/project-detail.context";
import { mockAccountsStoreSubscribe } from "../../../mocks/accounts.store.mock";
import { renderModalContextWrapper } from "../../../mocks/modal.mock";
import { mockSnsFullProject } from "../../../mocks/sns-projects.mock";
import { clickByTestId } from "../../testHelpers/clickByTestId";

describe("ParticipateSwapModal", () => {
  const renderSwapModal = () =>
    renderModalContextWrapper({
      Component: ParticipateSwapModal,
      contextKey: PROJECT_DETAIL_CONTEXT_KEY,
      contextValue: {
        store: writable<ProjectDetailStore>({
          summary: mockSnsFullProject.summary,
          swapState: mockSnsFullProject.swapState,
        }),
      } as ProjectDetailContext,
    });

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
      const { getByTestId, component } = await renderSwapModal();

      const onClose = jest.fn();
      component.$on("nnsClose", onClose);

      await clickByTestId(getByTestId, "sns-swap-participate-button-cancel");

      await waitFor(() => expect(onClose).toBeCalled());
    });

    it("should have disabled button by default", async () => {
      const { getByTestId } = await renderSwapModal();

      const participateButton = getByTestId("sns-swap-participate-button-next");
      expect(participateButton?.hasAttribute("disabled")).toBeTruthy();
    });

    it("should enable button when input value changes", async () => {
      const { getByTestId, container } = await renderSwapModal();

      const participateButton = getByTestId("sns-swap-participate-button-next");
      expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

      const input = container.querySelector("input[name='amount']");
      input && fireEvent.input(input, { target: { value: "10" } });
      await waitFor(() =>
        expect(participateButton?.hasAttribute("disabled")).toBeFalsy()
      );
    });

    it("should move to the last step with ICP and disabled button", async () => {
      const { queryByText, getByTestId, container } = await renderSwapModal();

      const participateButton = getByTestId("sns-swap-participate-button-next");
      expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

      const icpAmount = "10";
      const input = container.querySelector("input[name='amount']");
      input && fireEvent.input(input, { target: { value: icpAmount } });
      await waitFor(() =>
        expect(participateButton?.hasAttribute("disabled")).toBeFalsy()
      );

      fireEvent.click(participateButton);

      await waitFor(() =>
        expect(getByTestId("sns-swap-participate-step-2")).toBeTruthy()
      );
      expect(queryByText(icpAmount, { exact: false })).toBeInTheDocument();

      const confirmButton = getByTestId("sns-swap-participate-button-execute");
      expect(confirmButton?.hasAttribute("disabled")).toBeTruthy();
    });

    it("should move to the last step and enable button when accepting terms", async () => {
      const { queryByText, getByTestId, container } = await renderSwapModal();

      const participateButton = getByTestId("sns-swap-participate-button-next");
      expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

      const icpAmount = "10";
      const input = container.querySelector("input[name='amount']");
      input && fireEvent.input(input, { target: { value: icpAmount } });
      await waitFor(() =>
        expect(participateButton?.hasAttribute("disabled")).toBeFalsy()
      );

      fireEvent.click(participateButton);

      await waitFor(() =>
        expect(getByTestId("sns-swap-participate-step-2")).toBeTruthy()
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
      const { getByTestId, container } = await renderSwapModal();

      const participateButton = getByTestId("sns-swap-participate-button-next");

      expect(participateButton).toBeInTheDocument();

      expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

      const input = container.querySelector("input[name='amount']");
      input && fireEvent.input(input, { target: { value: "10" } });
      await waitFor(() =>
        expect(participateButton?.hasAttribute("disabled")).toBeFalsy()
      );

      fireEvent.click(participateButton);
      await waitFor(() =>
        expect(getByTestId("sns-swap-participate-step-2")).toBeTruthy()
      );

      await clickByTestId(getByTestId, "sns-swap-participate-button-back");
      await waitFor(() =>
        expect(getByTestId("sns-swap-participate-step-1")).toBeTruthy()
      );
    });
  });

  describe("accountsStore is empty", () => {
    it("should have disabled button if no account is selected", async () => {
      const { getByTestId, container } = await renderSwapModal();

      const participateButton = getByTestId("sns-swap-participate-button-next");

      const input = container.querySelector("input[name='amount']");
      input && (await fireEvent.input(input, { target: { value: "10" } }));

      expect(participateButton?.hasAttribute("disabled")).toBeFalsy();
    });
  });
});
